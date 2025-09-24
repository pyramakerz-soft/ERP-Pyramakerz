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
      // Swal.fire('Error', 'Failed to load assignment report', 'error');
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

  getBarHeight(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
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
    let reportElement: HTMLElement | null = null;

    try {
      // Wait for the chart to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a temporary container for the report
      reportElement = document.createElement('div');
      reportElement.style.width = '794px'; // A4 width in pixels (210mm)
      reportElement.style.padding = '20px';
      reportElement.style.backgroundColor = 'white';
      reportElement.style.fontFamily = 'Arial, sans-serif';
      reportElement.style.position = 'fixed';
      reportElement.style.left = '-9999px';
      reportElement.style.top = '0';
      reportElement.style.color = '#333';
      
      // Add header (matches print layout)
      const headerDiv = document.createElement('div');
      headerDiv.className = 'header';
      headerDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: bold; color: #333; margin: 0;">
            Assignment Report
          </h1>
        </div>
      `;
      reportElement.appendChild(headerDiv);
      
      // Convert chart to image (if available)
      if (this.chartContainer && this.chartContainer.nativeElement) {
        try {
          const chartElement = this.chartContainer.nativeElement;
          chartElement.style.visibility = 'visible';
          chartElement.style.display = 'block';
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const chartCanvas = await html2canvas(chartElement, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: false,
            width: chartElement.scrollWidth,
            height: chartElement.scrollHeight
          });
          
          const chartImage = chartCanvas.toDataURL('image/png');
          const chartContainerDiv = document.createElement('div');
          chartContainerDiv.className = 'chart-container';
          chartContainerDiv.innerHTML = `
            <div style="margin: 20px 0;">
              <img src="${chartImage}" style="max-width: 100%; height: auto;" />
            </div>
          `;
          reportElement.appendChild(chartContainerDiv);
        } catch (chartError) {
          console.error('Error capturing chart:', chartError);
          // Continue without chart
        }
      }
      
      // Add report details (matches print layout)
      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'details';
      detailsDiv.innerHTML = `
        <div style="margin: 20px 0;">
          <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 10px; color: #333;">
            Report Details
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; font-size: 14px;">
            <div><strong>Date Range:</strong> ${this.dateFrom} to ${this.dateTo}</div>
            <div><strong>School:</strong> ${this.getSchoolName()}</div>
            <div><strong>Academic Year:</strong> ${this.getAcademicYearName()}</div>
            <div><strong>Grade:</strong> ${this.getGradeName()}</div>
            <div><strong>Subject:</strong> ${this.getSubjectName()}</div>
            <div><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
      `;
      reportElement.appendChild(detailsDiv);
      
      // Add summary statistics (similar to your commented HTML)
      const summaryDiv = document.createElement('div');
      summaryDiv.innerHTML = `
        <div style="background: white; padding: 16px; border-radius: 16px; border: 1px solid #BDBDBD; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h3 style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 16px; text-align: center;">
            Summary Statistics
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px;">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #10B981;">${this.getTotalSuccessful()}</div>
              <div style="font-size: 14px; color: #6B7280;">Total Successful</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #F97316;">${this.getTotalFailed()}</div>
              <div style="font-size: 14px; color: #6B7280;">Total Failed</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #3B82F6;">${this.getTotalAttendance()}</div>
              <div style="font-size: 14px; color: #6B7280;">Total Attendance</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #8B5CF6;">${this.getTotalAssignments()}</div>
              <div style="font-size: 14px; color: #6B7280;">Total Assignments</div>
            </div>
          </div>
        </div>
      `;
      reportElement.appendChild(summaryDiv);
      
      // Add data table (matches print layout exactly)
      if (this.assignmentReports.length > 0) {
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        tableContainer.innerHTML = `
          <div style="margin-top: 20px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 10px;">
              Assignment Details
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; border: 1px solid #BDBDBD; border-radius: 16px; overflow: hidden;">
              <thead>
                <tr style="background-color: #EBEBEB;">
                  <th style="border: 1px solid #EAECF0; padding: 12px 16px; text-align: left; font-weight: 600; color: #6F6F6F;">Assignment Name</th>
                  <th style="border: 1px solid #EAECF0; padding: 12px 16px; text-align: left; font-weight: 600; color: #6F6F6F;">Subject</th>
                  <th style="border: 1px solid #EAECF0; padding: 12px 16px; text-align: left; font-weight: 600; color: #6F6F6F;">Attendance</th>
                  <th style="border: 1px solid #EAECF0; padding: 12px 16px; text-align: left; font-weight: 600; color: #6F6F6F;">Successful</th>
                  <th style="border: 1px solid #EAECF0; padding: 12px 16px; text-align: left; font-weight: 600; color: #6F6F6F;">Failed</th>
                  <th style="border: 1px solid #EAECF0; padding: 12px 16px; text-align: left; font-weight: 600; color: #6F6F6F;">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                ${this.assignmentReports.map((report, i) => `
                  <tr style="${i % 2 === 1 ? 'background-color: #F7F7F7;' : 'background-color: white;'}">
                    <td style="border: 1px solid #EAECF0; padding: 12px 16px; color: #6F6F6F;">${report.assignmentName}</td>
                    <td style="border: 1px solid #EAECF0; padding: 12px 16px; color: #6F6F6F;">${report.subjectName}</td>
                    <td style="border: 1px solid #EAECF0; padding: 12px 16px; color: #6F6F6F;">${report.attendanceNumber}</td>
                    <td style="border: 1px solid #EAECF0; padding: 12px 16px; color: #6F6F6F;">${report.numberSuccessful}</td>
                    <td style="border: 1px solid #EAECF0; padding: 12px 16px; color: #6F6F6F;">${report.numberFailed}</td>
                    <td style="border: 1px solid #EAECF0; padding: 12px 16px; color: #6F6F6F;">${report.attendanceNumber > 0 ? ((report.numberSuccessful / report.attendanceNumber) * 100).toFixed(2) + '%' : '0%'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
        reportElement.appendChild(tableContainer);
      }

      // Append to document body
      document.body.appendChild(reportElement);

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 300));

      // Convert to image
      const reportImage = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        width: reportElement.scrollWidth,
        height: reportElement.scrollHeight
      });
      
      // Clean up
      if (reportElement.parentNode) {
        document.body.removeChild(reportElement);
      }
      
      const imgData = reportImage.toDataURL('image/png');
      
      // Create PDF in portrait mode (like a standard document)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit the page
      const imgWidth = pdfWidth - 20; // 10mm margins on each side
      const imgHeight = (reportImage.height * imgWidth) / reportImage.width;
      
      // Add image to PDF with centered margins
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      
      // Save PDF
      pdf.save(`Assignment_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire('Error', 'Failed to generate PDF. Please try again.', 'error');
    } finally {
      this.isExporting = false;
      
      // Safety cleanup
      if (reportElement && reportElement.parentNode === document.body) {
        document.body.removeChild(reportElement);
      }
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

      // Create print content that matches HTML exactly
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
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
            }
            .header h1 {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            .chart-container { 
              margin: 20px 0; 
            }
            .details { 
              margin: 20px 0; 
            }
            .details h3 {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 10px;
            }
            .details-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 10px; 
              margin-top: 15px;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 12px;
              border: 1px solid #BDBDBD;
              border-radius: 16px;
              overflow: hidden;
            }
            th, td {
              border: 1px solid #EAECF0;
              padding: 12px 16px;
              text-align: left;
            }
            th {
              background-color: #EBEBEB;
              font-weight: 600;
              color: #6F6F6F;
            }
            td {
              color: #6F6F6F;
            }
            tr:nth-child(even) {
              background-color: #F7F7F7;
            }
            tr:nth-child(odd) {
              background-color: white;
            }
            .no-print { 
              display: none; 
            }
            @media print {
              body { 
                margin: 0; 
                padding: 15px; 
                background: white;
              }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Assignment Report</h1>
          </div>
          
          ${chartImage ? `
          <div class="chart-container">
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
                ${this.assignmentReports.map((report, i) => `
                  <tr>
                    <td>${report.assignmentName}</td>
                    <td>${report.subjectName}</td>
                    <td>${report.attendanceNumber}</td>
                    <td>${report.numberSuccessful}</td>
                    <td>${report.numberFailed}</td>
                    <td>${report.attendanceNumber > 0 ? ((report.numberSuccessful / report.attendanceNumber) * 100).toFixed(2) + '%' : '0%'}</td>
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
              setTimeout(() => {
                window.print();
              }, 500);
              
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