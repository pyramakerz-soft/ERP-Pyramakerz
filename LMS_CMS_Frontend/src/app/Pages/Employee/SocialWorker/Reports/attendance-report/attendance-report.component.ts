import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { TranslateModule } from '@ngx-translate/core';
import { AttendanceReportItem } from '../../../../../Models/SocialWorker/attendance';
import { firstValueFrom, Subscription } from 'rxjs';
import { AttendanceService } from '../../../../../Services/Employee/SocialWorker/attendance.service';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { AcadimicYearService } from '../../../../../Services/Employee/LMS/academic-year.service';
import { GradeService } from '../../../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../../../Services/Employee/LMS/classroom.service';
import { StudentService } from '../../../../../Services/student.service';
import { ApiService } from '../../../../../Services/api.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { ReportsService } from '../../../../../Services/shared/reports.service';

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.css'
})
export class AttendanceReportComponent implements OnInit {
  // Filter properties
  dateFrom: string = '';
  dateTo: string = '';
  selectedSchoolId: number | null = null;
  selectedAcademicYearId: number | null = null;
  selectedGradeId: number | null = null;
  selectedClassId: number | null = null;
  selectedStudentId: number | null = null;

  // Data sources
  schools: any[] = [];
  academicYears: any[] = [];
  grades: any[] = [];
  classes: any[] = [];
  students: any[] = [];

  // Report data
  attendanceReports: AttendanceReportItem[] = [];
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
    reportHeaderOneEn: 'Attendance Report',
    reportHeaderTwoEn: 'Student Attendance Records',
    reportHeaderOneAr: 'تقرير الحضور',
    reportHeaderTwoAr: 'سجلات حضور الطلاب'
  };
constructor(
  private attendanceService: AttendanceService,
  private schoolService: SchoolService,
  private academicYearService: AcadimicYearService,
  private gradeService: GradeService,
  private classroomService: ClassroomService,
  private studentService: StudentService,
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
        this.classes = [];
        this.selectedClassId = null;
        this.students = [];
        this.selectedStudentId = null;
      } catch (error) {
        console.error('Error loading academic years:', error);
      }
    } else {
      this.academicYears = [];
      this.selectedAcademicYearId = null;
      this.grades = [];
      this.selectedGradeId = null;
      this.classes = [];
      this.selectedClassId = null;
      this.students = [];
      this.selectedStudentId = null;
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
        this.classes = [];
        this.selectedClassId = null;
        this.students = [];
        this.selectedStudentId = null;
      } catch (error) {
        console.error('Error loading grades:', error);
      }
    } else {
      this.grades = [];
      this.selectedGradeId = null;
      this.classes = [];
      this.selectedClassId = null;
      this.students = [];
      this.selectedStudentId = null;
    }
  }

  async loadClasses() {
    if (this.selectedGradeId) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.classroomService.GetByGradeId(this.selectedGradeId, domainName)
        );
        this.classes = data;
        this.selectedClassId = null;
        this.students = [];
        this.selectedStudentId = null;
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    } else {
      this.classes = [];
      this.selectedClassId = null;
      this.students = [];
      this.selectedStudentId = null;
    }
  }

  async loadStudents() {
    if (this.selectedClassId) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.studentService.GetByClassID(this.selectedClassId, domainName)
        );
        this.students = data.map((student: any) => ({
          id: student.id,
          name: student.en_name || student.ar_name || 'Unknown',
        }));
        this.selectedStudentId = null;
      } catch (error) {
        console.error('Error loading students:', error);
      }
    } else {
      this.students = [];
      this.selectedStudentId = null;
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
    this.loadClasses();
    this.onFilterChange();
  }

  onClassChange() {
    this.loadStudents();
    this.onFilterChange();
  }

  onFilterChange() {
    this.showTable = false;
    this.showViewReportBtn = this.dateFrom !== '' && this.dateTo !== '';
    this.attendanceReports = [];
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

    this.isLoading = true;
    this.showTable = false;

    try {
      const domainName = this.apiService.GetHeader();
      const response = await firstValueFrom(
        this.attendanceService.GetAttendanceReport(
          domainName,
          this.dateFrom,
          this.dateTo,
          this.selectedSchoolId || undefined,
          this.selectedAcademicYearId || undefined,
          this.selectedGradeId || undefined,
          this.selectedClassId || undefined,
          this.selectedStudentId || undefined
        )
      );

      console.log('API Response:', response);
      
      // Handle the response directly as an array
      if (Array.isArray(response)) {
        this.attendanceReports = response;
        console.log('Attendance reports loaded:', this.attendanceReports.length);
      } else {
        console.log('Response is not an array:', response);
        this.attendanceReports = [];
      }

      this.prepareExportData();
      this.showTable = true;
    } catch (error) {
      console.error('Error loading attendance reports:', error);
      this.attendanceReports = [];
      this.showTable = true;
    } finally {
      this.isLoading = false;
    }
  }

private prepareExportData(): void {
  // For PDF (object format)
  this.reportsForExport = this.attendanceReports.map((report) => ({
    'Date': new Date(report.date).toLocaleDateString(),
    'Student Name': report.studentName,
    'Status': report.isLate ? 'Late' : 'Present',
    'Late Time (minutes)': report.isLate ? report.lateTimeInMinutes : '-',
    'Notes': report.notes || '-'
  }));

  // For Excel (array format)
  this.reportsForExcel = this.attendanceReports.map((report) => [
    new Date(report.date).toLocaleDateString(),
    report.studentName,
    report.isLate ? 'Late' : 'Present',
    report.isLate ? report.lateTimeInMinutes : '-',
    report.notes || '-'
  ]);
}

  getSchoolName(): string {
    return this.schools.find(s => s.id === this.selectedSchoolId)?.name || 'All Schools';
  }

  getAcademicYearName(): string {
    return this.academicYears.find(ay => ay.id === this.selectedAcademicYearId)?.name || 'All Academic Years';
  }

  getGradeName(): string {
    return this.grades.find(g => g.id === this.selectedGradeId)?.name || 'All Grades';
  }

  getClassName(): string {
    return this.classes.find(c => c.id === this.selectedClassId)?.name || 'All Classes';
  }

  getStudentName(): string {
    return this.students.find(s => s.id === this.selectedStudentId)?.name || 'All Students';
  }

  getInfoRows(): any[] {
    return [
      { keyEn: 'From Date: ' + this.dateFrom },
      { keyEn: 'To Date: ' + this.dateTo },
      { keyEn: 'School: ' + this.getSchoolName() },
      { keyEn: 'Academic Year: ' + this.getAcademicYearName() },
      { keyEn: 'Grade: ' + this.getGradeName() },
      { keyEn: 'Class: ' + this.getClassName() },
      { keyEn: 'Student: ' + this.getStudentName() }
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
        en: 'Attendance Report',
        ar: 'تقرير الحضور'
      },
      subHeaders: [
        {
          en: 'Student Attendance Records',
          ar: 'سجلات حضور الطلاب'
        }
      ],
      infoRows: [
        { key: 'From Date', value: this.dateFrom },
        { key: 'To Date', value: this.dateTo },
        { key: 'School', value: this.getSchoolName() },
        { key: 'Academic Year', value: this.getAcademicYearName() },
        { key: 'Grade', value: this.getGradeName() },
        { key: 'Class', value: this.getClassName() },
        { key: 'Student', value: this.getStudentName() }
      ],
      tables: [
        {
          // title: 'Attendance Report Data',
          headers: ['Date', 'Student Name', 'Status', 'Late Time (minutes)', 'Notes'],
          data: this.reportsForExcel
        }
      ],
      filename: `Attendance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    Swal.fire('Error', 'Failed to export to Excel', 'error');
  } finally {
    this.isExporting = false;
  }
}
}