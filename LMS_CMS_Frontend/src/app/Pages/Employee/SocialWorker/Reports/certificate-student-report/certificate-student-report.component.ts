import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { CertificateStudentReportItem } from '../../../../../Models/SocialWorker/certificate-student';
import { firstValueFrom, Subscription } from 'rxjs';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { GradeService } from '../../../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../../../Services/Employee/LMS/classroom.service';
import { StudentService } from '../../../../../Services/student.service';
import { ApiService } from '../../../../../Services/api.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { CertificateStudentService } from '../../../../../Services/Employee/SocialWorker/certificate-student.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';


@Component({
  selector: 'app-certificate-student-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './certificate-student-report.component.html',
  styleUrl: './certificate-student-report.component.css'
})
export class CertificateStudentReportComponent implements OnInit {
  // Filter properties (all mandatory)
  selectedSchoolId: number = 0;
  selectedGradeId: number = 0;
  selectedClassId: number = 0;
  selectedStudentId: number = 0;

  // Data sources
  schools: any[] = [];
  grades: any[] = [];
  classes: any[] = [];
  students: any[] = [];

  // Report data
  certificateReports: CertificateStudentReportItem[] = [];
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
    reportHeaderOneEn: 'Certificate Student Report',
    reportHeaderTwoEn: 'Student Certificate Records',
    reportHeaderOneAr: 'تقرير شهادات الطالب',
    reportHeaderTwoAr: 'سجلات شهادات الطالب'
  };

  constructor(
    private certificateReportService: CertificateStudentService,
    private schoolService: SchoolService,
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

  async loadGrades() {
    if (this.selectedSchoolId) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.gradeService.GetBySchoolId(this.selectedSchoolId, domainName)
        );
        this.grades = data;
        this.selectedGradeId = 0;
        this.classes = [];
        this.selectedClassId = 0;
        this.students = [];
        this.selectedStudentId = 0;
        this.onFilterChange();
      } catch (error) {
        console.error('Error loading grades:', error);
      }
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
        this.selectedClassId = 0;
        this.students = [];
        this.selectedStudentId = 0;
        this.onFilterChange();
      } catch (error) {
        console.error('Error loading classes:', error);
      }
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
        this.selectedStudentId = 0;
        this.onFilterChange();
      } catch (error) {
        console.error('Error loading students:', error);
      }
    } else {
      this.students = [];
      this.selectedStudentId = 0;
      this.onFilterChange();
    }
  }

  onFilterChange() {
    this.showTable = false;
    this.showViewReportBtn = !!this.selectedSchoolId && !!this.selectedGradeId && 
                            !!this.selectedClassId && !!this.selectedStudentId;
    this.certificateReports = [];
  }

  async viewReport() {
    if (!this.selectedSchoolId || !this.selectedGradeId || !this.selectedClassId || !this.selectedStudentId) {
      Swal.fire({
        title: 'Incomplete Selection',
        text: 'Please select School, Grade, Class, and Student to generate the report.',
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
        this.certificateReportService.GetCertificateToStudentReport(
          this.selectedSchoolId,
          this.selectedGradeId,
          this.selectedClassId,
          this.selectedStudentId,
          domainName
        )
      );

      console.log('API Response:', response);
      
      if (Array.isArray(response)) {
        this.certificateReports = response;
        console.log('Certificate reports loaded:', this.certificateReports.length);
      } else {
        console.log('Response is not an array:', response);
        this.certificateReports = [];
      }

      this.prepareExportData();
      this.showTable = true;
    } catch (error) {
      console.error('Error loading certificate reports:', error);
      this.certificateReports = [];
      this.showTable = true;
      Swal.fire({
        title: 'Error',
        text: 'Failed to load certificate reports',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      this.isLoading = false;
    }
  }

private prepareExportData(): void {
  // For PDF (object format)
  this.reportsForExport = this.certificateReports.map((report) => ({
    'Medal ID': report.certificateTypeID,
    'Medal Name': report.certificateTypeName,
    'Added At': new Date(report.addedAt).toLocaleDateString(),
    'Added By': report.addedBy
  }));

  // For Excel (array format)
  this.reportsForExcel = this.certificateReports.map((report) => [
    report.certificateTypeID,
    report.certificateTypeName,
    new Date(report.addedAt).toLocaleDateString(),
    report.addedBy
  ]);
}

  getSchoolName(): string {
    return this.schools.find(s => s.id == this.selectedSchoolId)?.name || 'All Schools';
  }

  getGradeName(): string {
    return this.grades.find(g => g.id == this.selectedGradeId)?.name || 'All Grades';
  }

  getClassName(): string {
    return this.classes.find(c => c.id == this.selectedClassId)?.name || 'All Classes';
  }

  getStudentName(): string {
    return this.students.find(s => s.id == this.selectedStudentId)?.name || 'All Students';
  }

  getInfoRows(): any[] {
    return [
      { keyEn: 'School: ' + this.getSchoolName() },
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
        en: 'Certificate Student Report',
        ar: 'تقرير شهادات الطالب'
      },
      subHeaders: [
        {
          en: 'Student Certificate Records',
          ar: 'سجلات شهادات الطالب'
        }
      ],
      infoRows: [
        { key: 'School', value: this.getSchoolName() },
        { key: 'Grade', value: this.getGradeName() },
        { key: 'Class', value: this.getClassName() },
        { key: 'Student', value: this.getStudentName() }
      ],
      tables: [
        {
          // title: 'Certificate Report Data',
          headers: ['Medal ID', 'Medal Name', 'Added At', 'Added By'],
          data: this.reportsForExcel
        }
      ],
      filename: `Certificate_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    Swal.fire('Error', 'Failed to export to Excel', 'error');
  } finally {
    this.isExporting = false;
  }
}
}