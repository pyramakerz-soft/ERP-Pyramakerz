import { Component, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-assignment-report',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './assignment-report.component.html',
  styleUrl: './assignment-report.component.css'
})
export class AssignmentReportComponent implements OnInit {
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
        this.selectedSubjectId = null;
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
    this.loadSubjects();
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

  private prepareExportData(): void {
    // For PDF (object format)
    this.reportsForExport = this.assignmentReports.map((report) => ({
      'Assignment Name': report.assignmentName,
      'Subject Name': report.subjectName,
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

  DownloadAsPDF() {
    if (this.reportsForExport.length === 0) {
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }

    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }

  Print() {
    if (this.reportsForExport.length === 0) {
      Swal.fire('Warning', 'No data to print!', 'warning');
      return;
    }
    
    this.showPDF = true;
    setTimeout(() => {
      const printContents = document.getElementById('Data')?.innerHTML;
      if (!printContents) {
        console.error('Element not found!');
        return;
      }
      
      const printStyle = `
        <style>
          @page { size: auto; margin: 0mm; }
          body { margin: 0; }
          @media print {
            body > *:not(#print-container) { display: none !important; }
            #print-container {
              display: block !important;
              position: static !important;
              top: auto !important;
              left: auto !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              box-shadow: none !important;
              margin: 0 !important;
            }
          }
        </style>
      `;
      
      const printContainer = document.createElement('div');
      printContainer.id = 'print-container';
      printContainer.innerHTML = printStyle + printContents;
      
      document.body.appendChild(printContainer);
      window.print();
      
      setTimeout(() => {
        document.body.removeChild(printContainer);
        this.showPDF = false;
      }, 100);
    }, 500);
  }

  async exportExcel() {
    if (this.reportsForExcel.length === 0) {
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }

    this.isExporting = true;
    
    try {
      await this.reportsService.generateExcelReport({
        mainHeader: {
          en: 'Assignment Report',
          ar: 'تقرير الواجبات'
        },
        subHeaders: [
          {
            en: 'Assignment Performance Statistics',
            ar: 'إحصائيات أداء الواجبات'
          }
        ],
        infoRows: [
          { key: 'From Date', value: this.dateFrom },
          { key: 'To Date', value: this.dateTo },
          { key: 'School', value: this.getSchoolName() },
          { key: 'Academic Year', value: this.getAcademicYearName() },
          { key: 'Grade', value: this.getGradeName() },
          { key: 'Subject', value: this.getSubjectName() }
        ],
        tables: [
          {
            title: 'Assignment Report Data',
            headers: ['Assignment Name', 'Subject Name', 'Attendance', 'Successful', 'Failed', 'Success Rate'],
            data: this.reportsForExcel
          }
        ],
        filename: `Assignment_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Swal.fire('Error', 'Failed to export to Excel', 'error');
    } finally {
      this.isExporting = false;
    }
  }
}
