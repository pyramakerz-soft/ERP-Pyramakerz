import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { ConductService } from '../../../../../Services/Employee/SocialWorker/conduct.service';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { GradeService } from '../../../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../../../Services/Employee/LMS/classroom.service';
import { StudentService } from '../../../../../Services/student.service';
import { ApiService } from '../../../../../Services/api.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import Swal from 'sweetalert2';
import { ConductTypeService } from '../../../../../Services/Employee/SocialWorker/conduct-type.service';
import { ProcedureTypeService } from '../../../../../Services/Employee/SocialWorker/procedure-type.service';
import { ConductType } from '../../../../../Models/SocialWorker/conduct-type';
import { ProcedureType } from '../../../../../Models/SocialWorker/procedure-type';
import { ConductReportItem } from '../../../../../Models/SocialWorker/conduct';
import { ReportsService } from '../../../../../Services/shared/reports.service';

@Component({
  selector: 'app-conduct-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './conduct-report.component.html',
  styleUrl: './conduct-report.component.css'
})
export class ConductReportComponent implements OnInit {
  // Filter properties
  dateFrom: string = '';
  dateTo: string = '';
  selectedSchoolId: number | null = null;
  selectedGradeId: number | null = null;
  selectedClassId: number | null = null;
  selectedStudentId: number | null = null;
  selectedConductTypeId: number | null = null;
  selectedProcedureTypeId: number | null = null;

  // Data sources
  schools: any[] = [];
  grades: any[] = [];
  classes: any[] = [];
  students: any[] = [];
  conductTypes: ConductType[] = [];
  procedureTypes: ProcedureType[] = [];

  // Report data
  conductReports: ConductReportItem[] = [];
  showTable: boolean = false;
  isLoading: boolean = false;
  showViewReportBtn: boolean = false;
  reportsForPDF: any[] = [];


  // Language and RTL
  isRtl: boolean = false;
  subscription!: Subscription;

  // PDF Export
  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  showPDF = false;
  reportsForExport: any[] = [];
  school = {
    reportHeaderOneEn: 'Conduct Report',
    reportHeaderTwoEn: 'Student Behavior Records',
    reportHeaderOneAr: 'تقرير السلوك',
    reportHeaderTwoAr: 'سجلات سلوك الطلاب'
  };

constructor(
  private conductService: ConductService,
  private conductTypeService: ConductTypeService,
  private procedureTypeService: ProcedureTypeService,
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
    this.loadProcedureTypes();
    
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

  async loadConductTypes() {
    if (this.selectedSchoolId) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.conductTypeService.GetBySchool(this.selectedSchoolId, domainName)
        );
        this.conductTypes = data;
        console.log('seif')
        console.log('Conduct types loaded:', this.conductTypes);
      } catch (error) {
        console.error('Error loading conduct types:', error);
        this.conductTypes = [];
      }
    } else {
      this.conductTypes = [];
    }
  }

  async loadProcedureTypes() {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(
        this.procedureTypeService.Get(domainName)
      );
      this.procedureTypes = data;
    } catch (error) {
      console.error('Error loading procedure types:', error);
      this.procedureTypes = [];
    }
  }

  onSchoolChange() {
    this.loadGrades();
    this.loadConductTypes();
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
    this.conductReports = [];
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
        this.conductService.GetConductReport(
          domainName,
          this.dateFrom,
          this.dateTo,
          this.selectedSchoolId || undefined,
          this.selectedGradeId || undefined,
          this.selectedClassId || undefined,
          this.selectedStudentId || undefined,
          this.selectedConductTypeId || undefined,
          this.selectedProcedureTypeId || undefined
        )
      );

      console.log('API Response:', response);
      
      // Handle the response directly as an array
      if (Array.isArray(response)) {
        this.conductReports = response;
        console.log('Conduct reports loaded:', this.conductReports.length);
      } else {
        console.log('Response is not an array:', response);
        this.conductReports = [];
      }

      this.prepareExportData();
      this.showTable = true;
    } catch (error) {
      console.error('Error loading conduct reports:', error);
      this.conductReports = [];
      this.showTable = true;
      Swal.fire({
        title: 'Error',
        text: 'Failed to load conduct reports',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      this.isLoading = false;
    }
  }

private prepareExportData(): void {
  // For Excel (array format)
  this.reportsForExport = this.conductReports.map((report) => [
    new Date(report.date).toLocaleDateString(),
    report.studentEnName,
    report.conductType?.name || 'N/A',
    report.procedureType?.name || 'N/A',
    report.details || 'N/A'
  ]);

  // For PDF (object format with proper keys)
  this.reportsForPDF = this.conductReports.map((report) => ({
    'Date': new Date(report.date).toLocaleDateString(),
    'Student Name': report.studentEnName,
    'Conduct Type': report.conductType?.name || 'N/A',
    'Procedure Type': report.procedureType?.name || 'N/A',
    'Details': report.details || 'N/A'
  }));
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

  getConductTypeName(): string {
    return this.conductTypes.find(ct => ct.id == this.selectedConductTypeId)?.en_name || 'All Types';
  }

  getProcedureTypeName(): string {
    return this.procedureTypes.find(pt => pt.id == this.selectedProcedureTypeId)?.name || 'All Types';
  }

  getInfoRows(): any[] {
    return [
      { keyEn: 'From Date: ' + this.dateFrom },
      { keyEn: 'To Date: ' + this.dateTo },
      { keyEn: 'School: ' + this.getSchoolName() },
      { keyEn: 'Grade: ' + this.getGradeName() },
      { keyEn: 'Class: ' + this.getClassName() },
      { keyEn: 'Student: ' + this.getStudentName() },
      { keyEn: 'Conduct Type: ' + this.getConductTypeName() },
      { keyEn: 'Procedure Type: ' + this.getProcedureTypeName() }
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
  if (this.reportsForExport.length === 0) {
    Swal.fire('Warning', 'No data to export!', 'warning');
    return;
  }

  try {
    await this.reportsService.generateExcelReport({
      mainHeader: {
        en: 'Conduct Report',
        ar: 'تقرير السلوك'
      },
      subHeaders: [
        {
          en: 'Student Behavior Records',
          ar: 'سجلات سلوك الطلاب'
        }
      ],
      infoRows: [
        { key: 'From Date', value: this.dateFrom },
        { key: 'To Date', value: this.dateTo },
        { key: 'School', value: this.getSchoolName() },
        { key: 'Grade', value: this.getGradeName() },
        { key: 'Class', value: this.getClassName() },
        { key: 'Student', value: this.getStudentName() },
        { key: 'Conduct Type', value: this.getConductTypeName() },
        { key: 'Procedure Type', value: this.getProcedureTypeName() }
      ],
      tables: [
        {
          title: 'Conduct Report Data',
          headers: ['Date', 'Student Name', 'Conduct Type', 'Procedure Type', 'Details'],
          data: this.reportsForExport
        }
      ],
      filename: `Conduct_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    Swal.fire('Error', 'Failed to export to Excel', 'error');
  }
}
}