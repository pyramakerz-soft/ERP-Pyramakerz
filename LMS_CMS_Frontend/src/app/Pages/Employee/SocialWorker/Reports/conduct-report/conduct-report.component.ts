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
      this.currentLang = direction === 'rtl' ? 'ar' : 'en'; // أضف هذا السطر7777
    });
    this.isRtl = document.documentElement.dir === 'rtl';
    this.currentLang = this.isRtl ? 'ar' : 'en'; // أضف هذا السطر7777
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
      // Swal.fire({
      //   title: 'Error',
      //   text: 'Failed to load conduct reports',
      //   icon: 'error',
      //   confirmButtonText: 'OK',
      // });
    } finally {
      this.isLoading = false;
    }
  }

  private prepareExportData(): void {
    this.reportsForExport = this.conductReports.map((report) => [
      new Date(report.date).toLocaleDateString(),
      report.studentEnName,
      report.conductType?.en_name || '-',
      report.procedureType?.name || '-',
      report.details || '-'
    ]);

    this.reportsForPDF = this.conductReports.map((report) => ({
      'Date': new Date(report.date).toLocaleDateString(),
      'Student Name': this.currentLang === 'en' ? report.studentEnName : (report.studentArName || report.studentEnName),
      'Conduct Type': report.conductType?.en_name || '-',
      'Procedure Type': report.procedureType?.name || '-',
      'Details': report.details || '-'
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
    if (this.reportType === 'employee') {
      return this.students.find(s => s.id == this.selectedStudentId)?.name || '';
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

  // 
  // getInfoRows(): any[] {
  //   if(this.reportType === 'employee'){
  //      return [
  //       { keyEn: 'From Date: ' + this.dateFrom },
  //       { keyEn: 'To Date: ' + this.dateTo },
  //       { keyEn: 'School: ' + this.getSchoolName() },
  //       { keyEn: 'Grade: ' + this.getGradeName() },
  //       { keyEn: 'Class: ' + this.getClassName() },
  //       { keyEn: 'Student: ' + this.getStudentName() },
  //       { keyEn: 'Conduct Type: ' + this.getConductTypeName() },
  //       { keyEn: 'Procedure Type: ' + this.getProcedureTypeName() }
  //     ];
  //  }
  //   else{
  //     return [
  //       { keyEn: 'From Date: ' + this.dateFrom },
  //       { keyEn: 'To Date: ' + this.dateTo },
  //       { keyEn: 'Student: ' + this.getStudentName() },
  //     ];
  //   }
  // }

  // Revised getInfoRows method
  getInfoRows(): any[] {
    if (this.reportType === 'employee') {
      return [
        {
          keyEn: 'From Date: ' + this.dateFrom,
          keyAr: 'من تاريخ: ' + this.dateFrom
        },
        {
          keyEn: 'To Date: ' + this.dateTo,
          keyAr: 'إلى تاريخ: ' + this.dateTo
        },
        {
          keyEn: 'School: ' + this.getSchoolName(),
          keyAr: 'المدرسة: ' + this.getSchoolName()
        },
        {
          keyEn: 'Grade: ' + this.getGradeName(),
          keyAr: 'الصف: ' + this.getGradeName()
        },
        {
          keyEn: 'Class: ' + this.getClassName(),
          keyAr: 'الفصل: ' + this.getClassName()
        },
        {
          keyEn: 'Student: ' + this.getStudentName(),
          keyAr: 'الطالب: ' + this.getStudentName()
        },
        {
          keyEn: 'Conduct Type: ' + this.getConductTypeName(),
          keyAr: 'نوع السلوك: ' + this.getConductTypeName()
        },
        {
          keyEn: 'Procedure Type: ' + this.getProcedureTypeName(),
          keyAr: 'نوع الإجراء: ' + this.getProcedureTypeName()
        },
        {
          keyEn: 'Generated On: ' + new Date().toLocaleDateString(),
          keyAr: 'تم الإنشاء في: ' + new Date().toLocaleDateString()
        }
      ];
    }
    else {
      return [
        {
          keyEn: 'From Date: ' + this.dateFrom,
          keyAr: 'من تاريخ: ' + this.dateFrom
        },
        {
          keyEn: 'To Date: ' + this.dateTo,
          keyAr: 'إلى تاريخ: ' + this.dateTo
        },
        {
          keyEn: 'Student: ' + this.getStudentName(),
          keyAr: 'الطالب: ' + this.getStudentName()
        },
        {
          keyEn: 'Generated On: ' + new Date().toLocaleDateString(),
          keyAr: 'تم الإنشاء في: ' + new Date().toLocaleDateString()
        }
      ];
    }
  }

  // Gaber -- 77
  GetDataForPrint(): Observable<any[]> {
    return of(this.conductReports).pipe(
      map((reports) => {
        if (reports.length === 0) {
          return [];
        }

        return [{
          header: {
            en: this.reportType === 'employee' ? 'Conduct Report' : 'Parent Conduct Report',
            ar: this.reportType === 'employee' ? 'تقرير السلوك' : 'تقرير سلوك ولي الأمر'
          },
          summary: this.getInfoRowsExcel(),
          table: {
            headers: {
              en: ['Date', 'Student Name', 'Conduct Type', 'Procedure Type', 'Details'],
              ar: ['التاريخ', 'اسم الطالب', 'نوع السلوك', 'نوع الإجراء', 'التفاصيل']
            },
            data: reports.map((item: any) => ({
              'Date': new Date(item.date).toLocaleDateString(),
              'التاريخ': new Date(item.date).toLocaleDateString(),
              'Student Name': item.studentEnName,
              'اسم الطالب': item.studentEnName || item.studentArName || '-',
              'Conduct Type': item.conductType?.en_name || item.conductType?.en_name || '-',
              'نوع السلوك': item.conductType?.ar_name || item.conductType?.ar_name || '-',
              'Procedure Type': item.procedureType?.en_name || item.procedureType?.name || '-',
              'نوع الإجراء': item.procedureType?.ar_name || item.procedureType?.name || '-',
              'Details': item.details || '-',
              'التفاصيل': item.details || '-'
            }))
          }
        }];
      })
    );
  }

  // --77 

  // New method for Excel info rows
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
        { key: 'Procedure Type', value: this.getProcedureTypeName() }
      ];
    }
    else {
      return [
        { key: 'From Date', value: this.dateFrom },
        { key: 'To Date', value: this.dateTo },
        { key: 'Student', value: this.getStudentName() },
        { key: 'Conduct Type', value: this.getConductTypeName() },
        { key: 'Procedure Type', value: this.getProcedureTypeName() }
      ];
    }
  }

  // Revised getInfoRowsExcel method--77
  async exportExcel() {
    const Swal = await import('sweetalert2').then(m => m.default);

    if (this.conductReports.length === 0) {
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }

    try {
      const excelOptions = {
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
        infoRows: this.getInfoRowsExcel(),
        tables: [
          {
            headers: ['Date', 'Student Name', 'Conduct Type', 'Procedure Type', 'Details', 'التاريخ', 'اسم الطالب', 'نوع السلوك', 'نوع الإجراء', 'التفاصيل'],
            data: this.conductReports.map((report) => [
              new Date(report.date).toLocaleDateString(),
              report.studentEnName,
              report.conductType?.en_name || report.conductType?.en_name || '-',
              report.procedureType?.name || report.procedureType?.name || '-',
              report.details || '-',
              new Date(report.date).toLocaleDateString(),
              report.studentEnName || report.studentEnName,
              report.conductType?.ar_name || report.conductType?.ar_name || '-',
              report.procedureType?.name || report.procedureType?.name || '-',
              report.details || '-'
            ])
          }
        ],
        filename: `Conduct_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      };

      await this.reportsService.generateExcelReport(excelOptions);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Swal.fire('Error', 'Failed to export to Excel', 'error');
    }
  }

  // ``77
  getSchoolNameAr(): string {
    return this.schools.find(s => s.id == this.selectedSchoolId)?.ar_name || this.schools.find(s => s.id == this.selectedSchoolId)?.name || 'كل المدارس';
  }

  getGradeNameAr(): string {
    return this.grades.find(g => g.id == this.selectedGradeId)?.ar_name || this.grades.find(g => g.id == this.selectedGradeId)?.name || 'كل الصفوف';
  }

  getClassNameAr(): string {
    return this.classes.find(c => c.id == this.selectedClassId)?.ar_name || this.classes.find(c => c.id == this.selectedClassId)?.name || 'كل الفصول';
  }

  getStudentNameAr(): string {
    if (this.reportType === 'employee') {
      return this.students.find(s => s.id == this.selectedStudentId)?.ar_name || this.students.find(s => s.id == this.selectedStudentId)?.name || '';
    }
    else {
      return this.students.find(s => s.id == this.selectedStudentId)?.ar_name || this.students.find(s => s.id == this.selectedStudentId)?.en_name || '';
    }
  }

  getConductTypeNameAr(): string {
    return this.conductTypes.find(ct => ct.id == this.selectedConductTypeId)?.ar_name || this.conductTypes.find(ct => ct.id == this.selectedConductTypeId)?.ar_name || 'كل الأنواع';
  }

  getProcedureTypeNameAr(): string {
    return this.procedureTypes.find(pt => pt.id == this.selectedProcedureTypeId)?.name || this.procedureTypes.find(pt => pt.id == this.selectedProcedureTypeId)?.name || 'كل الأنواع';
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

  // async exportExcel() {
  //   if (this.reportsForExport.length === 0) {
  //     Swal.fire('Warning', 'No data to export!', 'warning');
  //     return;
  //   }

  //   try {
  //     await this.reportsService.generateExcelReport({
  //       mainHeader: {
  //         en: 'Conduct Report',
  //         ar: 'تقرير السلوك'
  //       },
  //       subHeaders: [
  //         {
  //           en: 'Student Behavior Records',
  //           ar: 'سجلات سلوك الطلاب'
  //         }
  //       ],
  //       infoRows: this.getInfoRowsExcel(),
  //       tables: [
  //         {
  //           // title: 'Conduct Report Data',
  //           headers: ['Date', 'Student Name', 'Conduct Type', 'Procedure Type', 'Details'],
  //           data: this.reportsForExport
  //         }
  //       ],
  //       filename: `Conduct_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
  //     });
  //   } catch (error) {
  //     console.error('Error exporting to Excel:', error);
  //     Swal.fire('Error', 'Failed to export to Excel', 'error');
  //   }
  // }






}