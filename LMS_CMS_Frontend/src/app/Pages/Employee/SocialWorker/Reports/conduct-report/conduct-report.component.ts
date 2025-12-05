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
// import Swal from 'sweetalert2';
import { ConductTypeService } from '../../../../../Services/Employee/SocialWorker/conduct-type.service';
import { ProcedureTypeService } from '../../../../../Services/Employee/SocialWorker/procedure-type.service';
import { ConductType } from '../../../../../Models/SocialWorker/conduct-type';
import { ProcedureType } from '../../../../../Models/SocialWorker/procedure-type';
import { ConductReportItem } from '../../../../../Models/SocialWorker/conduct';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { TokenData } from '../../../../../Models/token-data';
import { AccountService } from '../../../../../Services/account.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../../../../Services/loading.service';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-conduct-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './conduct-report.component.html',
  styleUrl: './conduct-report.component.css'
})

@InitLoader()
export class ConductReportComponent implements OnInit {
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  reportType: string = 'employee';

  currentLang: string = 'en';

  // Filter properties
  dateFrom: string = '';
  dateTo: string = '';
  selectedSchoolId: number | null = null;
  selectedGradeId: number | null = null;
  selectedClassId: number | null = null;
  selectedStudentId: number | null = null;
  selectedConductTypeId: number | null = null;
  selectedProcedureTypeId: number | null = null;
  DomainName: string = '';

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
    public account: AccountService,
    private route: ActivatedRoute,
    private reportsService: ReportsService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.loadSchools();
    this.loadProcedureTypes();
    this.DomainName = this.apiService.GetHeader();
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.reportType = this.route.snapshot.data['reportType'] || 'employee';
    if (this.reportType == 'parent') {
      this.getStudentsByParentId()
    }

    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
      this.currentLang = direction === 'rtl' ? 'ar' : 'en'; 
    });
    this.isRtl = document.documentElement.dir === 'rtl';
    this.currentLang = this.isRtl ? 'ar' : 'en'; 
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getStudentsByParentId() {
    this.studentService.Get_By_ParentID(this.UserID, this.DomainName).subscribe((d) => {
      this.students = d
      console.log(this.students)
    })
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
        en_name: student.en_name || '',
        ar_name: student.ar_name || '',
        name: this.isRtl ? (student.ar_name || student.en_name || 'غير معروف') : 
                         (student.en_name || student.ar_name || 'Unknown'),
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
    if (this.reportType == 'parent') {
      this.showViewReportBtn = this.dateFrom !== '' && this.dateTo !== '' && !!this.selectedStudentId;
    }
    else {
      this.showViewReportBtn = this.dateFrom !== '' && this.dateTo !== '';
    }
    this.conductReports = [];
  }

  async viewReport() {
    const Swal = await import('sweetalert2').then(m => m.default);

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
      this.reportsForExport = []
      this.reportsForPDF = []
      this.showTable = true;
    } finally {
      this.isLoading = false;
    }
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
    if (this.reportType === 'employee') {
      return this.students.find(s => s.id == this.selectedStudentId)?.name || 'All Students';
    }
    else {
      return this.students.find(s => s.id == this.selectedStudentId)?.en_name || '';
    }
  }

  getConductTypeName(): string {
    return this.conductTypes.find(ct => ct.id == this.selectedConductTypeId)?.en_name || 'All Types';
  }

  getProcedureTypeName(): string {
    return this.procedureTypes.find(pt => pt.id == this.selectedProcedureTypeId)?.name || 'All Types';
  }


 
  // Revised getInfoRowsExcel method --77

  async DownloadAsPDF() {
    const Swal = await import('sweetalert2').then(m => m.default);

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

  async Print() {
    const Swal = await import('sweetalert2').then(m => m.default);

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

// Adding by Gaber---7777


async exportExcel() {        
  const Swal = await import('sweetalert2').then(m => m.default);

  if (this.conductReports.length === 0) {
    Swal.fire('Warning', 'No data to export!', 'warning');
    return;
  }

  try {

    const infoRows: { en: string; ar: string }[] = [];
    
    if (this.reportType === 'employee') {
      infoRows.push(
        { 
          en: `From Date: ${this.dateFrom || ''}`, 
          ar: `${this.dateFrom || ''}  :   من تاريخ` 
        },
        { 
          en: `To Date: ${this.dateTo || ''}`, 
          ar: `${this.dateTo || ''} :   إلى تاريخ` 
        },
        { 
          en: `School: ${this.getSchoolName() || 'All Schools'}`, 
          ar: ` ${this.getSchoolNameAr() || 'كل المدارس'} : المدرسة ` 
        },
        { 
          en: `Grade: ${this.getGradeName() || 'All Grades'}`, 
          ar: ` ${this.getGradeNameAr() || 'كل الصفوف'} : الصف ` 
        },
        { 
          en: `Class: ${this.getClassName() || 'All Classes'}`, 
          ar: `${this.getClassNameAr() || 'كل الفصول'} : الفصل ` 
        },
        { 
          en: `Student: ${this.getStudentName() || 'All Students'}`, 
          ar: ` ${this.getStudentNameAr() || 'كل الطلاب'} : الطالب ` 
        },
        { 
          en: `Conduct Type: ${this.getConductTypeName() || 'All Types'}`, 
          ar: ` ${this.getConductTypeNameAr() || 'كل الأنواع'} : نوع السلوك `
        },
        { 
          en: `Procedure Type: ${this.getProcedureTypeName() || 'All Types'}`, 
          ar: ` ${this.getProcedureTypeNameAr() || 'كل الأنواع'} : نوع الإجراء `
        }
      );
    } else {
      infoRows.push(
        { 
          en: `From Date: ${this.dateFrom || ''}`, 
          ar: `${this.dateFrom || ''}  :   من تاريخ` 
        },
        { 
          en: `To Date: ${this.dateTo || ''}`, 
          ar: `${this.dateTo || ''} :   إلى تاريخ` 
        },
        { 
          en: `Student: ${this.getStudentName() || ''}`, 
          ar: `الطالب: ${this.getStudentNameAr() || 'كل الطلاب'}` 
        },
        { 
          en: `Conduct Type: ${this.getConductTypeName() || 'All Types'}`, 
          ar: `${this.getConductTypeNameAr() || 'كل الأنواع'} : نوع السلوك`
        },
        { 
          en: `Procedure Type: ${this.getProcedureTypeName() || 'All Types'}`, 
          ar: `${this.getProcedureTypeNameAr() || 'كل الأنواع'} : نوع الإجراء`
        }
      );
    }
    
    infoRows.push(
      { 
        en: `Generated On: ${new Date().toLocaleDateString('en-GB')}`, 
        ar: `${new Date().toLocaleDateString('en-GB')} : تم الإنشاء في` 
      }
    );

    const isArabic = this.currentLang === 'ar';
    
    let tableHeaders: string[];
    let tableData: any[][];
    
    if (isArabic) {
      tableHeaders = ['التاريخ', 'اسم الطالب', 'نوع السلوك', 'نوع الإجراء', 'التفاصيل'];
      tableData = this.conductReports.map((report) => {
        const date = new Date(report.date);
        return [
          this.formatDateForArabic(date.toISOString()),
          report.studentArName || report.studentEnName || '-',
          report.conductType?.ar_name || report.conductType?.en_name || '-',
          report.procedureType?.name || report.procedureType?.name || '-',
          report.details || '-'
        ];
      });
    } else {
      tableHeaders = ['Date', 'Student Name', 'Conduct Type', 'Procedure Type', 'Details'];
      tableData = this.conductReports.map((report) => {
        const date = new Date(report.date);
        return [
          date.toLocaleDateString('en-GB'),
          report.studentEnName || '-',
          report.conductType?.en_name || '-',
          report.procedureType?.name || '-',
          report.details || '-'
        ];
      });
    }

    const excelOptions = {
      mainHeader: {
        en: 'Conduct Report',
        ar: 'تقرير السلوك'
      },
      subHeaders: [{
        en: 'Student Behavior Records',
        ar: 'سجلات سلوك الطلاب'
      }],
      infoRows: infoRows,
      tables: [{
        headers: tableHeaders,
        data: tableData
      }],
      isRtl: isArabic,
      filename: `Conduct_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
    };

    await this.reportsService.generateExcelReport(excelOptions);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    const Swal = await import('sweetalert2').then(m => m.default);
    Swal.fire('Error', 'Failed to export to Excel', 'error');
  }
}


private prepareExportData(): void {
  const isArabic = this.currentLang === 'ar';
  
  // For Excel (array format)
  this.reportsForExport = this.conductReports.map((report) => {
    const date = new Date(report.date);
    return [
      date.toLocaleDateString('en-GB'),
      isArabic ? (report.studentArName || report.studentEnName) : report.studentEnName,
      isArabic ? (report.conductType?.ar_name || report.conductType?.en_name) : report.conductType?.en_name,
      isArabic ? (report.procedureType?.name || report.procedureType?.name) : report.procedureType?.name,
      report.details || '-'
    ];
  });

  // For PDF (object format)
  this.reportsForPDF = this.conductReports.map((report) => ({
    'Date': new Date(report.date).toLocaleDateString(),
    'Student Name': isArabic ? (report.studentArName || report.studentEnName) : report.studentEnName,
    'Conduct Type': isArabic ? (report.conductType?.ar_name || report.conductType?.en_name) : report.conductType?.en_name,
    'Procedure Type': isArabic ? (report.procedureType?.name || report.procedureType?.name) : report.procedureType?.name,
    'Details': report.details || '-'
  }));
}

getInfoRows(): any[] {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fromAr = formatDate(this.dateFrom);
  const toAr = formatDate(this.dateTo);
  const genAr = formatDate(new Date().toISOString().split('T')[0]);

  const rows: any[] = [
    { keyEn: `From Date: ${this.dateFrom || ''}`, keyAr: `من تاريخ: ${fromAr}` },
    { keyEn: `To Date: ${this.dateTo || ''}`,     keyAr: `إلى تاريخ: ${toAr}` },
  ];

  if (this.reportType === 'employee') {
    rows.push(
      { keyEn: `School: ${this.getSchoolName() || 'All Schools'}`,       keyAr: `${this.getSchoolNameAr()} : المدرسة `},
      { keyEn: `Grade: ${this.getGradeName() || 'All Grades'}`,         keyAr: `${this.getGradeNameAr()} :الصف`},
      { keyEn: `Class: ${this.getClassName() || 'All Classes'}`,        keyAr: ` ${this.getClassNameAr()} :الفصل  `},
      { keyEn: `Student: ${this.getStudentName() || 'All Students'}`,   keyAr: ` ${this.getStudentNameAr()} :الطالب  `},
      { keyEn: `Conduct Type: ${this.getConductTypeName() || 'All Types'}`, keyAr: ` ${this.getConductTypeNameAr()} : نوع السلوك `},
      { keyEn: `Procedure Type: ${this.getProcedureTypeName() || 'All Types'}`, keyAr:` ${this.getProcedureTypeNameAr()} : نوع الإجراء `}
    );
  } else {
    rows.push(
      { keyEn: `Student: ${this.getStudentName() || ''}`,   keyAr: `الطالب: ${this.getStudentNameAr()}` },
      { keyEn: `Conduct Type: ${this.getConductTypeName() || 'All Types'}`, keyAr: `نوع السلوك: ${this.getConductTypeNameAr()}` },
      { keyEn: `Procedure Type: ${this.getProcedureTypeName() || 'All Types'}`, keyAr: `نوع الإجراء: ${this.getProcedureTypeNameAr()}` }
    );
  }

  rows.push(
    { keyEn: `Generated On: ${new Date().toLocaleDateString('en-GB')}`, keyAr: `تم الإنشاء في: ${genAr}` }
  );

  return rows;
}


private formatDateForArabic(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

GetDataForPrint(): Observable<any[]> {
  return of(this.conductReports).pipe(
    map((reports) => {
      if (reports.length === 0) {
        return [];
      }

      return [{
        header: {
          en: 'Conduct Report', 
          ar: 'تقرير السلوك'
        },
        summary: this.getInfoRows(), 
        table: {
          headers: {
            en: ['Date', 'Student Name', 'Conduct Type', 'Procedure Type', 'Details'],
            ar: ['التاريخ', 'اسم الطالب', 'نوع السلوك', 'نوع الإجراء', 'التفاصيل']
          },
          data: reports.map((item: any) => ({
            'Date': new Date(item.date).toLocaleDateString('en-GB'),
            'التاريخ': this.formatDateForArabic(item.date),
            'Student Name': item.studentEnName,
            'اسم الطالب': item.studentArName || item.studentEnName || '-',
            'Conduct Type': item.conductType?.en_name || '-',
            'نوع السلوك': item.conductType?.ar_name || item.conductType?.en_name || '-',
            'Procedure Type': item.procedureType?.name || '-',
            'نوع الإجراء': item.procedureType?.ar_name || item.procedureType?.name || '-',
            'Details': item.details || '-',
            'التفاصيل': item.details || '-'
          }))
        }
      }];
    })
  );
}


getInfoRowsExcel(): any[] {
  if (this.reportType === 'employee') {
    return [
      { key: 'From Date', value: this.dateFrom },
      { key: 'To Date', value: this.dateTo },
      { key: 'School', value: this.getSchoolName() },
      { key: 'Grade', value: this.getGradeName() },
      { key: 'Class', value: this.getClassName() },
      { key: 'Student', value: this.getStudentName() },
      { key: 'Conduct Type', value: this.getConductTypeName() },
      { key: 'Procedure Type', value: this.getProcedureTypeName() },
      { key: 'Generated On', value: new Date().toLocaleDateString('en-GB') }
    ];
  } else {
    return [
      { key: 'From Date', value: this.dateFrom },
      { key: 'To Date', value: this.dateTo },
      { key: 'Student', value: this.getStudentName() },
      { key: 'Conduct Type', value: this.getConductTypeName() },
      { key: 'Procedure Type', value: this.getProcedureTypeName() },
      { key: 'Generated On', value: new Date().toLocaleDateString('en-GB') }
    ];
  }
}
 

getSchoolNameAr(): string {
  const school = this.schools.find(s => s.id == this.selectedSchoolId);
  return school?.ar_name || school?.name || ' All Schools ';
}

getGradeNameAr(): string {
  const grade = this.grades.find(g => g.id == this.selectedGradeId);
  return grade?.ar_name || grade?.name || 'All Schools ';
}

getClassNameAr(): string {
  const classItem = this.classes.find(c => c.id == this.selectedClassId);
  return classItem?.ar_name || classItem?.name || 'All Schools ';
}

getStudentNameAr(): string {
  if (this.reportType === 'employee') {
    const student = this.students.find(s => s.id == this.selectedStudentId);
    return student?.ar_name || student?.name || 'All Students';
  } else {
    const student = this.students.find(s => s.id == this.selectedStudentId);
    return student?.ar_name || student?.en_name || 'All Students';
  }
}


getConductTypeNameAr(): string {
  const conductType = this.conductTypes.find(ct => ct.id == this.selectedConductTypeId);
  return conductType?.ar_name || conductType?.en_name || 'All Types ';
}

getProcedureTypeNameAr(): string {
  const procedureType = this.procedureTypes.find(pt => pt.id == this.selectedProcedureTypeId);
  return procedureType?.name || procedureType?.name || 'All Types ';
}


}