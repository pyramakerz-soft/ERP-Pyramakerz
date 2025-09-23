import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AssignmentReportItem } from '../../../../../Models/LMS/assignment';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { firstValueFrom, Subscription } from 'rxjs';
import { AssignmentService } from '../../../../../Services/Employee/LMS/assignment.service';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { AcadimicYearService } from '../../../../../Services/Employee/LMS/academic-year.service';
import { GradeService } from '../../../../../Services/Employee/LMS/grade.service';
import { SubjectService } from '../../../../../Services/Employee/LMS/subject.service';
import { ApiService } from '../../../../../Services/api.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-assignment-report',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './assignment-report.component.html',
  styleUrl: './assignment-report.component.css'
})
export class AssignmentReportComponent implements OnInit {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  // Filter properties
  dateFrom: string = '';
  dateTo: string = '';
  selectedSchoolId: number | null = null;
  selectedAcademicYearId: number | null = null;
  selectedGradeId: number | null = null;
  selectedSubjectId: number | null = null;

  // Data sources
  schools: any[] = [];
  academicYears: any[] = [];
  grades: any[] = [];
  subjects: any[] = [];

  // Report data
  assignmentReports: AssignmentReportItem[] = [];
  showTable: boolean = false;
  isLoading: boolean = false;
  showViewReportBtn: boolean = false;
  isExporting: boolean = false;
  reportsForExcel: any[] = [];

  // Chart data
  chartData: any[] = [];
  maxChartValue: number = 0;

  // Language and RTL
  isRtl: boolean = false;
  subscription!: Subscription;

  // PDF Export
  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  showPDF = false;
  reportsForExport: any[] = [];
  school = {
    reportHeaderOneEn: 'Assignment Report',
    reportHeaderTwoEn: 'Assignment Performance Statistics',
    reportHeaderOneAr: 'تقرير الواجبات',
    reportHeaderTwoAr: 'إحصائيات أداء الواجبات'
  };

  constructor(
    private assignmentService: AssignmentService,
    private schoolService: SchoolService,
    private academicYearService: AcadimicYearService,
    private gradeService: GradeService,
    private subjectService: SubjectService,
    private apiService: ApiService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService,
    private reportsService: ReportsService
  ) {}

  ngOnInit() {
    this.loadSchools();
    
    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
    this.realTimeService.stopConnection();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async loadSchools() {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(this.schoolService.Get(domainName));
      this.schools = data;
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  }

  async loadAcademicYears() {
    if (this.selectedSchoolId) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.academicYearService.GetBySchoolId(this.selectedSchoolId, domainName)
        );
        this.academicYears = data;
        this.selectedAcademicYearId = null;
        this.grades = [];
        this.selectedGradeId = null;
        this.subjects = [];
        this.selectedSubjectId = null;
      } catch (error) {
        console.error('Error loading academic years:', error);
      }
    } else {
      this.academicYears = [];
      this.selectedAcademicYearId = null;
      this.grades = [];
      this.selectedGradeId = null;
      this.subjects = [];
      this.selectedSubjectId = null;
    }
  }

  async loadGrades() {
    if (this.selectedSchoolId) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.gradeService.GetBySchoolId(this.selectedSchoolId, domainName)
        );
        this.grades = data;
        this.selectedGradeId = null;
        this.subjects = [];
        this.selectedSubjectId = null;
      } catch (error) {
        console.error('Error loading grades:', error);
      }
    } else {
      this.grades = [];
      this.selectedGradeId = null;
      this.subjects = [];
      this.selectedSubjectId = null;
    }
  }

  async loadSubjects() {
    if (this.selectedGradeId) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.subjectService.GetByGradeId(this.selectedGradeId, domainName)
        );
        this.subjects = data;
        // Don't reset selectedSubjectId here - let the user choose
      } catch (error) {
        console.error('Error loading subjects:', error);
      }
    } else {
      this.subjects = [];
      this.selectedSubjectId = null;
    }
  }

  onSchoolChange() {
    this.loadAcademicYears();
    this.loadGrades();
    this.onFilterChange();
  }

  onAcademicYearChange() {
    this.onFilterChange();
  }

  onGradeChange() {
    // Reset subject filter when grade changes
    this.selectedSubjectId = null;
    this.subjects = [];
    
    // Only load subjects if a grade is selected
    if (this.selectedGradeId) {
      this.loadSubjects();
    }
    
    this.onFilterChange();
  }

  onSubjectChange() {
    this.onFilterChange();
  }

  onFilterChange() {
    this.showTable = false;
    this.showViewReportBtn = this.dateFrom !== '' && 
                            this.dateTo !== '' && 
                            this.selectedSchoolId !== null && 
                            this.selectedAcademicYearId !== null && 
                            this.selectedGradeId !== null && 
                            this.selectedSubjectId !== null;
    this.assignmentReports = [];
    this.chartData = [];
  }

  async viewReport() {
    if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
      Swal.fire({
        title: 'Invalid Date Range',
        text: 'Start date cannot be later than end date.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (!this.selectedSchoolId || !this.selectedAcademicYearId || !this.selectedGradeId || !this.selectedSubjectId) {
      Swal.fire({
        title: 'Missing Filters',
        text: 'Please select all required filters: School, Academic Year, Grade, and Subject.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.isLoading = true;
    this.showTable = false;

    try {
      const domainName = this.apiService.GetHeader();
      const response = await firstValueFrom(
        this.assignmentService.GetAssignmentReport(
          domainName,
          this.dateFrom,
          this.dateTo,
          this.selectedSchoolId,
          this.selectedAcademicYearId,
          this.selectedGradeId,
          this.selectedSubjectId
        )
      );

      console.log('API Response:', response);
      
      if (Array.isArray(response)) {
        this.assignmentReports = response;
        console.log('Assignment reports loaded:', this.assignmentReports.length);
      } else {
        console.log('Response is not an array:', response);
        this.assignmentReports = [];
      }

      this.prepareExportData();
      this.prepareChartData();
      this.showTable = true;
    } catch (error) {
      console.error('Error loading assignment reports:', error);
      this.assignmentReports = [];
      this.showTable = true;
      Swal.fire('Error', 'Failed to load assignment report', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  private prepareChartData(): void {
    this.chartData = this.assignmentReports.map(report => ({
      name: report.assignmentName,
      successful: report.numberSuccessful,
      failed: report.numberFailed,
      total: report.attendanceNumber
    }));

    // Calculate max value for chart scaling
    this.maxChartValue = Math.max(
      ...this.chartData.map(item => Math.max(item.successful, item.failed)),
      100 // Minimum scale
    );
  }

  getBarHeight(value: number): number {
    return this.maxChartValue > 0 ? (value / this.maxChartValue) * 100 : 0;
  }

  private prepareExportData(): void {
    // For PDF (object format)
    this.reportsForExport = this.assignmentReports.map((report) => ({
      'Assignment Name': report.assignmentName,
      'Subject': report.subjectName,
      'Attendance Number': report.attendanceNumber,
      'Successful': report.numberSuccessful,
      'Failed': report.numberFailed,
      'Success Rate': report.attendanceNumber > 0 ? 
        ((report.numberSuccessful / report.attendanceNumber) * 100).toFixed(2) + '%' : '0%'
    }));

    // For Excel (array format)
    this.reportsForExcel = this.assignmentReports.map((report) => [
      report.assignmentName,
      report.subjectName,
      report.attendanceNumber,
      report.numberSuccessful,
      report.numberFailed,
      report.attendanceNumber > 0 ? 
        ((report.numberSuccessful / report.attendanceNumber) * 100).toFixed(2) + '%' : '0%'
    ]);
  }

  getSchoolName(): string {
    return this.schools.find(s => s.id === this.selectedSchoolId)?.name || 'N/A';
  }

  getAcademicYearName(): string {
    return this.academicYears.find(ay => ay.id === this.selectedAcademicYearId)?.name || 'N/A';
  }

  getGradeName(): string {
    return this.grades.find(g => g.id === this.selectedGradeId)?.name || 'N/A';
  }

  getSubjectName(): string {
    return this.subjects.find(s => s.id === this.selectedSubjectId)?.en_name || 'N/A';
  }

  getInfoRows(): any[] {
    return [
      { keyEn: 'From Date: ' + this.dateFrom },
      { keyEn: 'To Date: ' + this.dateTo },
      { keyEn: 'School: ' + this.getSchoolName() },
      { keyEn: 'Academic Year: ' + this.getAcademicYearName() },
      { keyEn: 'Grade: ' + this.getGradeName() },
      { keyEn: 'Subject: ' + this.getSubjectName() }
    ];
  }

  // DownloadAsPDF() {
  //   if (this.reportsForExport.length === 0) {
  //     Swal.fire('Warning', 'No data to export!', 'warning');
  //     return;
  //   }

  //   this.showPDF = true;
  //   setTimeout(() => {
  //     this.pdfComponentRef.downloadPDF();
  //     setTimeout(() => (this.showPDF = false), 2000);
  //   }, 500);
  // }

  // Print() {
  //   if (this.reportsForExport.length === 0) {
  //     Swal.fire('Warning', 'No data to print!', 'warning');
  //     return;
  //   }
    
  //   this.showPDF = true;
  //   setTimeout(() => {
  //     const printContents = document.getElementById('Data')?.innerHTML;
  //     if (!printContents) {
  //       console.error('Element not found!');
  //       return;
  //     }
      
  //     const printStyle = `
  //       <style>
  //         @page { size: auto; margin: 0mm; }
  //         body { margin: 0; }
  //         @media print {
  //           body > *:not(#print-container) { display: none !important; }
  //           #print-container {
  //             display: block !important;
  //             position: static !important;
  //             top: auto !important;
  //             left: auto !important;
  //             width: 100% !important;
  //             height: auto !important;
  //             background: white !important;
  //             box-shadow: none !important;
  //             margin: 0 !important;
  //           }
  //         }
  //       </style>
  //     `;
      
  //     const printContainer = document.createElement('div');
  //     printContainer.id = 'print-container';
  //     printContainer.innerHTML = printStyle + printContents;
      
  //     document.body.appendChild(printContainer);
  //     window.print();
      
  //     setTimeout(() => {
  //       document.body.removeChild(printContainer);
  //       this.showPDF = false;
  //     }, 100);
  //   }, 500);
  // }

  // Helper methods for template calculations
  getTotalSuccessful(): number {
    return this.assignmentReports.reduce((sum, report) => sum + report.numberSuccessful, 0);
  }

  getTotalFailed(): number {
    return this.assignmentReports.reduce((sum, report) => sum + report.numberFailed, 0);
  }

  getTotalAttendance(): number {
    return this.assignmentReports.reduce((sum, report) => sum + report.attendanceNumber, 0);
  }

  getTotalAssignments(): number {
    return this.assignmentReports.length;
  }

  // async exportExcel() {
  //   if (this.reportsForExcel.length === 0) {
  //     Swal.fire('Warning', 'No data to export!', 'warning');
  //     return;
  //   }

  //   this.isExporting = true;
    
  //   try {
  //     await this.reportsService.generateExcelReport({
  //       mainHeader: {
  //         en: 'Assignment Report',
  //         ar: 'تقرير الواجبات'
  //       },
  //       subHeaders: [
  //         {
  //           en: 'Assignment Performance Statistics',
  //           ar: 'إحصائيات أداء الواجبات'
  //         }
  //       ],
  //       infoRows: [
  //         { key: 'From Date', value: this.dateFrom },
  //         { key: 'To Date', value: this.dateTo },
  //         { key: 'School', value: this.getSchoolName() },
  //         { key: 'Academic Year', value: this.getAcademicYearName() },
  //         { key: 'Grade', value: this.getGradeName() },
  //         { key: 'Subject', value: this.getSubjectName() }
  //       ],
  //       tables: [
  //         {
  //           title: 'Assignment Report Data',
  //           headers: ['Assignment Name', 'Subject', 'Attendance', 'Successful', 'Failed', 'Success Rate'],
  //           data: this.reportsForExcel
  //         }
  //       ],
  //       filename: `Assignment_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
  //     });
  //   } catch (error) {
  //     console.error('Error exporting to Excel:', error);
  //     Swal.fire('Error', 'Failed to export to Excel', 'error');
  //   } finally {
  //     this.isExporting = false;
  //   }
  // }

  async downloadAsPDFWithChart() {
  if (this.assignmentReports.length === 0) {
    Swal.fire('Warning', 'No data to export!', 'warning');
    return;
  }

  this.isExporting = true;

  try {
    // Wait for the chart to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a temporary container for the report
    const reportElement = document.createElement('div');
    reportElement.style.width = '800px';
    reportElement.style.padding = '20px';
    reportElement.style.backgroundColor = 'white';
    reportElement.style.fontFamily = 'Arial, sans-serif';
    
    // Add title
    const title = document.createElement('h1');
    title.textContent = 'Assignment Report';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    title.style.color = '#333';
    title.style.fontSize = '24px';
    reportElement.appendChild(title);
    
    // Convert chart to image
    if (this.chartContainer) {
      const chartCanvas = await html2canvas(this.chartContainer.nativeElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        width: this.chartContainer.nativeElement.scrollWidth,
        height: this.chartContainer.nativeElement.scrollHeight
      });
      
      const chartImage = chartCanvas.toDataURL('image/png');
      const chartImg = document.createElement('img');
      chartImg.src = chartImage;
      chartImg.style.width = '100%';
      chartImg.style.marginBottom = '20px';
      chartImg.style.border = '1px solid #ddd';
      chartImg.style.borderRadius = '8px';
      reportElement.appendChild(chartImg);
    }
    
    // Add report details
    const detailsDiv = document.createElement('div');
    detailsDiv.innerHTML = `
      <div style="margin-top: 20px; margin-bottom: 20px;">
        <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Report Details</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
          <div><strong>Date Range:</strong> ${this.dateFrom} to ${this.dateTo}</div>
          <div><strong>School:</strong> ${this.getSchoolName()}</div>
          <div><strong>Academic Year:</strong> ${this.getAcademicYearName()}</div>
          <div><strong>Grade:</strong> ${this.getGradeName()}</div>
          <div><strong>Subject:</strong> ${this.getSubjectName()}</div>
          <div><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</div>
          <div><strong>Total Assignments:</strong> ${this.assignmentReports.length}</div>
          <div><strong>Total Attendance:</strong> ${this.getTotalAttendance()}</div>
        </div>
      </div>
    `;
    reportElement.appendChild(detailsDiv);
    
    // Add summary statistics
    const summaryDiv = document.createElement('div');
    summaryDiv.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Summary Statistics</h3>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 15px; text-align: center;">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
            <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${this.getTotalSuccessful()}</div>
            <div style="font-size: 12px; color: #6c757d;">Total Successful</div>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
            <div style="font-size: 24px; font-weight: bold; color: #f97316;">${this.getTotalFailed()}</div>
            <div style="font-size: 12px; color: #6c757d;">Total Failed</div>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
            <div style="font-size: 24px; font-weight: bold; color: #10b981;">${this.getTotalAttendance()}</div>
            <div style="font-size: 12px; color: #6c757d;">Total Attendance</div>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
            <div style="font-size: 24px; font-weight: bold; color: #8b5cf6;">${this.getTotalAssignments()}</div>
            <div style="font-size: 12px; color: #6c757d;">Total Assignments</div>
          </div>
        </div>
      </div>
    `;
    reportElement.appendChild(summaryDiv);
    
    // Add data table
    if (this.assignmentReports.length > 0) {
      const tableDiv = document.createElement('div');
      tableDiv.innerHTML = `
        <div style="margin-top: 20px;">
          <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Assignment Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Assignment Name</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Subject</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Attendance</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Successful</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Failed</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              ${this.assignmentReports.map(report => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${report.assignmentName}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${report.subjectName}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${report.attendanceNumber}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${report.numberSuccessful}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${report.numberFailed}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${report.attendanceNumber > 0 ? ((report.numberSuccessful / report.attendanceNumber) * 100).toFixed(2) + '%' : '0%'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      reportElement.appendChild(tableDiv);
    }
    
    // Create PDF
    const pdf = new jsPDF('landscape', 'px', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Convert report to image
    const reportImage = await html2canvas(reportElement, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      width: reportElement.scrollWidth,
      height: reportElement.scrollHeight
    });
    
    const imgData = reportImage.toDataURL('image/png');
    const imgWidth = pdfWidth;
    const imgHeight = (reportImage.height * pdfWidth) / reportImage.width;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Save PDF
    pdf.save(`Assignment_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    Swal.fire('Error', 'Failed to generate PDF', 'error');
  } finally {
    this.isExporting = false;
  }
}

// Enhanced print method that includes the chart
async printReportWithChart() {
  if (this.assignmentReports.length === 0) {
    Swal.fire('Warning', 'No data to print!', 'warning');
    return;
  }

  this.isExporting = true;

  try {
    // Convert chart to image
    let chartImage = '';
    if (this.chartContainer) {
      const chartCanvas = await html2canvas(this.chartContainer.nativeElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      chartImage = chartCanvas.toDataURL('image/png');
    }

    // Create print-friendly version
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Swal.fire('Error', 'Please allow popups for printing', 'error');
      this.isExporting = false;
      return;
    }

    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Assignment Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 20px; 
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .chart-container { 
            text-align: center; 
            margin: 20px 0; 
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
          }
          .details { 
            margin: 20px 0; 
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
          .summary { 
            margin: 20px 0; 
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
          .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 15px; 
            margin-top: 15px;
          }
          .summary-item {
            text-align: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #dee2e6;
          }
          .details-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 10px; 
            margin-top: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f8f9fa;
            text-align: center;
          }
          .no-print { 
            display: none; 
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
            .header { margin-top: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Assignment Report</h1>
        </div>
        
        ${chartImage ? `
        <div class="chart-container">
          <h3>Performance Chart</h3>
          <img src="${chartImage}" style="max-width: 100%; height: auto;" />
        </div>
        ` : ''}
        
        <div class="details">
          <h3>Report Details</h3>
          <div class="details-grid">
            <div><strong>Date Range:</strong> ${this.dateFrom} to ${this.dateTo}</div>
            <div><strong>School:</strong> ${this.getSchoolName()}</div>
            <div><strong>Academic Year:</strong> ${this.getAcademicYearName()}</div>
            <div><strong>Grade:</strong> ${this.getGradeName()}</div>
            <div><strong>Subject:</strong> ${this.getSubjectName()}</div>
            <div><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
        
        <div class="summary">
          <h3>Summary Statistics</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${this.getTotalSuccessful()}</div>
              <div>Total Successful</div>
            </div>
            <div class="summary-item">
              <div style="font-size: 24px; font-weight: bold; color: #f97316;">${this.getTotalFailed()}</div>
              <div>Total Failed</div>
            </div>
            <div class="summary-item">
              <div style="font-size: 24px; font-weight: bold; color: #10b981;">${this.getTotalAttendance()}</div>
              <div>Total Attendance</div>
            </div>
            <div class="summary-item">
              <div style="font-size: 24px; font-weight: bold; color: #8b5cf6;">${this.getTotalAssignments()}</div>
              <div>Total Assignments</div>
            </div>
          </div>
        </div>
        
        <div class="table-container">
          <h3>Assignment Details</h3>
          <table>
            <thead>
              <tr>
                <th>Assignment Name</th>
                <th>Subject</th>
                <th>Attendance</th>
                <th>Successful</th>
                <th>Failed</th>
                <th>Success Rate</th>
              </tr>
            </thead>
            <tbody>
              ${this.assignmentReports.map(report => `
                <tr>
                  <td>${report.assignmentName}</td>
                  <td>${report.subjectName}</td>
                  <td style="text-align: center;">${report.attendanceNumber}</td>
                  <td style="text-align: center;">${report.numberSuccessful}</td>
                  <td style="text-align: center;">${report.numberFailed}</td>
                  <td style="text-align: center;">${report.attendanceNumber > 0 ? ((report.numberSuccessful / report.attendanceNumber) * 100).toFixed(2) + '%' : '0%'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Report
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
        
        <script>
          // Auto-print when window loads
          window.onload = function() {
            window.print();
            
            // Listen for afterprint event to close the window
            window.addEventListener('afterprint', function() {
              setTimeout(function() {
                window.close();
              }, 500);
            });
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

  } catch (error) {
    console.error('Error printing report:', error);
    Swal.fire('Error', 'Failed to print report', 'error');
  } finally {
    this.isExporting = false;
  }
}

// Enhanced Excel export with chart summary
async exportExcelWithChartSummary() {
  if (this.reportsForExcel.length === 0) {
    Swal.fire('Warning', 'No data to export!', 'warning');
    return;
  }

  this.isExporting = true;
  
  try {
    // Prepare chart summary data for Excel
    const chartSummary = this.chartData.map(item => [
      item.name,
      item.successful,
      item.failed,
      item.total,
      item.total > 0 ? ((item.successful / item.total) * 100).toFixed(2) + '%' : '0%'
    ]);

    await this.reportsService.generateExcelReport({
      mainHeader: {
        en: 'Assignment Report',
        ar: 'تقرير الواجبات'
      },
      subHeaders: [
        {
          en: 'Assignment Performance Statistics with Chart Summary',
          ar: 'إحصائيات أداء الواجبات مع ملخص الرسم البياني'
        }
      ],
      infoRows: [
        { key: 'From Date', value: this.dateFrom },
        { key: 'To Date', value: this.dateTo },
        { key: 'School', value: this.getSchoolName() },
        { key: 'Academic Year', value: this.getAcademicYearName() },
        { key: 'Grade', value: this.getGradeName() },
        { key: 'Subject', value: this.getSubjectName() },
        { key: 'Total Assignments', value: this.getTotalAssignments().toString() },
        { key: 'Total Successful', value: this.getTotalSuccessful().toString() },
        { key: 'Total Failed', value: this.getTotalFailed().toString() },
        { key: 'Total Attendance', value: this.getTotalAttendance().toString() }
      ],
      tables: [
        {
          title: 'Chart Summary',
          headers: ['Assignment Name', 'Successful', 'Failed', 'Total Attendance', 'Success Rate'],
          data: chartSummary
        },
        {
          title: 'Assignment Report Data',
          headers: ['Assignment Name', 'Subject', 'Attendance', 'Successful', 'Failed', 'Success Rate'],
          data: this.reportsForExcel
        }
      ],
      filename: `Assignment_Report_With_Chart_${new Date().toISOString().slice(0, 10)}.xlsx`
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    Swal.fire('Error', 'Failed to export to Excel', 'error');
  } finally {
    this.isExporting = false;
  }
}
}