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
// import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
import { LoadingService } from '../../../../../Services/loading.service';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';



@Component({
  selector: 'app-assignment-report',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './assignment-report.component.html',
  styleUrl: './assignment-report.component.css'
})

@InitLoader()
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
    private reportsService: ReportsService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.loadSchools();

    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
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
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        title: 'Invalid Date Range',
        text: 'Start date cannot be later than end date.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (!this.selectedSchoolId || !this.selectedAcademicYearId || !this.selectedGradeId || !this.selectedSubjectId) {
      const Swal = await import('sweetalert2').then(m => m.default);

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
          this.selectedSchoolId!,
          this.selectedAcademicYearId!,
          this.selectedGradeId!,
          this.selectedSubjectId!
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
      successful: report.successfulStudents,
      failed: report.failedStudents,
      total: report.assignedStudents,
      submitted: report.submittedStudents,
      pending: report.pendingStudents
    }));

    // Calculate max value for chart scaling
    this.maxChartValue = Math.max(
      ...this.chartData.map(item => Math.max(item.successful, item.failed, item.submitted, item.pending)),
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
      'Assigned Students': report.assignedStudents,
      'Submitted Students': report.submittedStudents,
      'Successful': report.successfulStudents,
      'Failed': report.failedStudents,
      'Pending': report.pendingStudents,
      'Success Rate': report.successRate.toFixed(2) + '%'
    }));

    // For Excel (array format)
    this.reportsForExcel = this.assignmentReports.map((report) => [
      report.assignmentName,
      report.subjectName,
      report.assignedStudents,
      report.submittedStudents,
      report.successfulStudents,
      report.failedStudents,
      report.pendingStudents,
      report.successRate.toFixed(2) + '%'
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
    const Swal = await import('sweetalert2').then(m => m.default);
    Swal.fire('Warning', 'No data to export!', 'warning');
    return;
  }

  this.isExporting = true;
  let reportElement: HTMLElement | null = null;

  try {
    const html2canvas = (await import('html2canvas')).default;

    // Wait for the chart to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create a temporary container for the report
    reportElement = document.createElement('div');
    reportElement.style.width = '900px';
    reportElement.style.padding = '32px';
    reportElement.style.backgroundColor = '#fff';
    reportElement.style.fontFamily = 'Arial, sans-serif';
    reportElement.style.position = 'fixed';
    reportElement.style.left = '-9999px';
    reportElement.style.top = '0';
    reportElement.style.color = '#333';
    reportElement.style.boxSizing = 'border-box';

    // Header
    const headerDiv = document.createElement('div');
    headerDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 2rem; font-weight: bold; color: #333; margin: 0;">
          Assignment Report
        </h1>
      </div>
    `;
    reportElement.appendChild(headerDiv);

    // Chart image
    if (this.chartContainer && this.chartContainer.nativeElement) {
      const chartCanvas = await html2canvas(this.chartContainer.nativeElement, {
        scale: 2,
        backgroundColor: '#fff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        width: this.chartContainer.nativeElement.scrollWidth,
        height: this.chartContainer.nativeElement.scrollHeight
      });
      const chartImg = document.createElement('img');
      chartImg.src = chartCanvas.toDataURL('image/png');
      chartImg.style.display = 'block';
      chartImg.style.margin = '0 auto 32px auto';
      chartImg.style.maxWidth = '100%';
      chartImg.style.height = 'auto';
      reportElement.appendChild(chartImg);
    }

    // Details
    const detailsDiv = document.createElement('div');
    detailsDiv.innerHTML = `
      <div style="margin: 24px 0;">
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

    // Data table
    if (this.assignmentReports.length > 0) {
      const tableDiv = document.createElement('div');
      tableDiv.innerHTML = `
        <div style="margin-top: 24px;">
          <table style="width: 100%; border-collapse: collapse; background: #EBEBEB; color: #6F6F6F; font-size: 14px;">
            <thead>
              <tr style="background: #EBEBEB;">
                <th style="padding: 12px 8px; border: 1px solid #EAECF0;">Assignment Name</th>
                <th style="padding: 12px 8px; border: 1px solid #EAECF0;">Subject Name</th>
                <th style="padding: 12px 8px; border: 1px solid #EAECF0;">Assigned Students</th>
                <th style="padding: 12px 8px; border: 1px solid #EAECF0;">Submitted Students</th>
                <th style="padding: 12px 8px; border: 1px solid #EAECF0;">Successful</th>
                <th style="padding: 12px 8px; border: 1px solid #EAECF0;">Failed</th>
                <th style="padding: 12px 8px; border: 1px solid #EAECF0;">Pending</th>
                <th style="padding: 12px 8px; border: 1px solid #EAECF0;">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              ${this.assignmentReports.map((report, i) => `
                <tr style="background: ${i % 2 === 1 ? '#F7F7F7' : '#fff'};">
                  <td style="padding: 16px 8px; border: 1px solid #EAECF0;">${report.assignmentName}</td>
                  <td style="padding: 16px 8px; border: 1px solid #EAECF0;">${report.subjectName}</td>
                  <td style="padding: 16px 8px; border: 1px solid #EAECF0;">${report.assignedStudents}</td>
                  <td style="padding: 16px 8px; border: 1px solid #EAECF0;">${report.submittedStudents}</td>
                  <td style="padding: 16px 8px; border: 1px solid #EAECF0;">${report.successfulStudents}</td>
                  <td style="padding: 16px 8px; border: 1px solid #EAECF0;">${report.failedStudents}</td>
                  <td style="padding: 16px 8px; border: 1px solid #EAECF0;">${report.pendingStudents}</td>
                  <td style="padding: 16px 8px; border: 1px solid #EAECF0;">${report.successRate.toFixed(2) + '%'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      reportElement.appendChild(tableDiv);
    }

    // Append to document body
    document.body.appendChild(reportElement);

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 300));

    // Convert to image
    const reportImage = await html2canvas(reportElement, {
      scale: 2,
      backgroundColor: '#fff',
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

    // Create PDF in portrait mode
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
    const Swal = await import('sweetalert2').then(m => m.default);
    Swal.fire('Error', 'Failed to generate PDF. Please try again.', 'error');
  } finally {
    this.isExporting = false;
    // Safety cleanup
    if (reportElement && reportElement.parentNode === document.body) {
      document.body.removeChild(reportElement);
    }
  }
}

async printReportWithChart() {
  if (this.assignmentReports.length === 0) {
    const Swal = await import('sweetalert2').then(m => m.default);
    Swal.fire('Warning', 'No data to print!', 'warning');
    return;
  }

  this.isExporting = true;

  // Store cleanup function reference
  let cleanupCalled = false;

  let cleanup = () => {
    if (cleanupCalled) return;
    cleanupCalled = true;

    const printContainer = document.querySelector('.print-overlay');
    if (printContainer && printContainer.parentNode) {
      document.body.removeChild(printContainer);
    }

    // Remove print styles
    const printStyles = document.querySelectorAll('style[data-print-style]');
    printStyles.forEach(style => style.remove());

    this.isExporting = false;
  };

  try {
    // Create a hidden print container
    const printContainer = document.createElement('div');
    printContainer.className = 'print-overlay';
    printContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: white;
      z-index: 9999;
      padding: 20px;
      overflow: auto;
      visibility: hidden;
    `;

    // First, get the chart as image
    this.getChartAsImage().then((chartImage) => {
      // Create print content with the chart image
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Assignment Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 20px;
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .chart-container { 
              text-align: center; 
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .details { 
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .details-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
              margin-top: 20px;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              page-break-inside: avoid;
            }
            .data-table th,
            .data-table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
              font-size: 12px;
            }
            .data-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .data-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { 
                margin: 0;
                padding: 15px;
              }
              .header {
                margin-bottom: 20px;
              }
              .chart-container {
                margin: 20px 0;
              }
              .page-break {
                page-break-before: always;
              }
            }
            @page {
              size: auto;
              margin: 15mm;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-size: 28px; margin: 0 0 10px 0; color: #333;">Assignment Report</h1>
          </div>
          
          <div class="details">
            <div class="details-grid">
              <div><strong>Date Range:</strong> ${this.dateFrom} to ${this.dateTo}</div>
              <div><strong>School:</strong> ${this.getSchoolName()}</div>
              <div><strong>Academic Year:</strong> ${this.getAcademicYearName()}</div>
              <div><strong>Grade:</strong> ${this.getGradeName()}</div>
              <div><strong>Subject:</strong> ${this.getSubjectName()}</div>
              <div><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          
          <div class="chart-container">
            <img src="${chartImage}" style="max-width: 100%; height: auto; border: 1px solid #ddd;" />
          </div>

          <div class="data-section">
            <h3 style="font-size: 20px; margin-bottom: 15px; color: #333;">Assignment Details</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Assignment Name</th>
                  <th>Subject</th>
                  <th>Assigned</th>
                  <th>Submitted</th>
                  <th>Successful</th>
                  <th>Failed</th>
                  <th>Pending</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                ${this.assignmentReports.map((report, i) => `
                  <tr>
                    <td>${report.assignmentName}</td>
                    <td>${report.subjectName}</td>
                    <td>${report.assignedStudents}</td>
                    <td>${report.submittedStudents}</td>
                    <td>${report.successfulStudents}</td>
                    <td>${report.failedStudents}</td>
                    <td>${report.pendingStudents}</td>
                    <td>${report.successRate.toFixed(2)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

        </body>
        </html>
      `;

      printContainer.innerHTML = printContent;
      document.body.appendChild(printContainer);

      // Wait for content to be rendered
      setTimeout(() => {
        // Add print styles with data attribute for easy removal
        const printStyles = document.createElement('style');
        printStyles.setAttribute('data-print-style', 'true');
        printStyles.textContent = `
          @media screen {
            .print-overlay {
              display: none !important;
            }
          }
          @media print {
            body * {
              visibility: hidden;
            }
            .print-overlay,
            .print-overlay * {
              visibility: visible;
            }
            .print-overlay {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }
          }
        `;
        document.head.appendChild(printStyles);

        // Strategy 1: Use beforeprint and afterprint events
        const handleAfterPrint = () => {
          window.removeEventListener('afterprint', handleAfterPrint);
          cleanup();
        };

        const handleBeforePrint = () => {
          window.removeEventListener('beforeprint', handleBeforePrint);
          window.addEventListener('afterprint', handleAfterPrint);
        };

        window.addEventListener('beforeprint', handleBeforePrint);

        // Strategy 2: Fallback timeout for browsers that don't fire afterprint
        const fallbackTimeout = setTimeout(() => {
          if (!cleanupCalled) {
            console.warn('Fallback cleanup triggered');
            cleanup();
          }
        }, 3000); // 3 second fallback

        // Strategy 3: Listen for focus event (when print dialog closes)
        const handleFocus = () => {
          window.removeEventListener('focus', handleFocus);
          if (!cleanupCalled) {
            setTimeout(() => {
              if (!cleanupCalled) {
                cleanup();
              }
            }, 500);
          }
        };

        window.addEventListener('focus', handleFocus);

        // Update cleanup to clear the timeout
        const originalCleanup = cleanup;
        cleanup = () => {
          clearTimeout(fallbackTimeout);
          window.removeEventListener('beforeprint', handleBeforePrint);
          window.removeEventListener('afterprint', handleAfterPrint);
          window.removeEventListener('focus', handleFocus);
          originalCleanup();
        };

        // Trigger print
        window.print();

      }, 500);

    }).catch(async error => {
      const Swal = await import('sweetalert2').then(m => m.default);
      Swal.fire('Error', 'Failed to generate chart for printing', 'error');
      this.isExporting = false;
    });

  } catch (error) {
    const Swal = await import('sweetalert2').then(m => m.default);
    Swal.fire('Error', 'Failed to print report', 'error');
    this.isExporting = false;

    // Cleanup on error
    const printContainer = document.querySelector('.print-overlay');
    if (printContainer && printContainer.parentNode) {
      document.body.removeChild(printContainer);
    }
  }
}

private getChartAsImage(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    if (!this.chartContainer?.nativeElement) {
      reject('Chart container not available');
      return;
    }
    const html2canvas = (await import('html2canvas')).default;

    html2canvas(this.chartContainer.nativeElement, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    }).then(chartCanvas => {
      resolve(chartCanvas.toDataURL('image/png'));
    }).catch(error => {
      reject(error);
    });
  });
}

  async exportChartToExcel() {
    if (this.assignmentReports.length === 0) {
      const Swal = await import('sweetalert2').then(m => m.default);
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }

    this.isExporting = true;

    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Assignment Chart');

      // Prepare data
      const chartData = this.assignmentReports.map(report => ({
        name: report.assignmentName,
        successful: report.numberSuccessful,
        failed: report.numberFailed
      }));

      // Add data to worksheet
      worksheet.addRow(['Assignment Name', 'Successful', 'Failed']);
      chartData.forEach(item => worksheet.addRow([item.name, item.successful, item.failed]));

      // Create chart using the most compatible method
      // This creates the data structure that ExcelJS expects
      const chart = {
        type: 'column' as const,
        title: 'Assignment Performance Chart',
        data: chartData.map(item => ({
          name: item.name,
          values: [item.successful, item.failed]
        }))
      };

      // ExcelJS does not support adding charts directly; only data will be exported.
      // If chart export is needed, consider using a library that supports chart embedding or export chart as image separately.

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      this.downloadExcelFile(buffer, `Assignment_Chart_${new Date().toISOString().slice(0, 10)}.xlsx`);

    } catch (error) {
      const Swal = await import('sweetalert2').then(m => m.default);
      Swal.fire('Error', 'Failed to export chart to Excel', 'error');
    } finally {
      this.isExporting = false;
    }
  }

  private downloadExcelFile(buffer: ArrayBuffer, filename: string) {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}