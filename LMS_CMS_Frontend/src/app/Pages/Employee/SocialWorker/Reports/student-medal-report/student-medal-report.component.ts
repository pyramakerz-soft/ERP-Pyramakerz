import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core'; 
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component'; 
import { firstValueFrom, Subscription } from 'rxjs';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { GradeService } from '../../../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../../../Services/Employee/LMS/classroom.service';
import { StudentService } from '../../../../../Services/student.service';
import { ApiService } from '../../../../../Services/api.service';
import { LanguageService } from '../../../../../Services/shared/language.service'; 
// import Swal from 'sweetalert2';
import { SocialWorkerMedalStudentService } from '../../../../../Services/Employee/SocialWorker/social-worker-medal-student.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { ActivatedRoute } from '@angular/router';
import { TokenData } from '../../../../../Models/token-data';
import { AccountService } from '../../../../../Services/account.service';
import { SocialWorkerMedalStudent } from '../../../../../Models/SocialWorker/social-worker-medal-student';
import { Student } from '../../../../../Models/student';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../../Services/loading.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-student-medal-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './student-medal-report.component.html',
  styleUrl: './student-medal-report.component.css'
})

@InitLoader()
export class StudentMedalReportComponent implements OnInit {
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  reportType: string = 'employee';
  DomainName: string = '';

  currentLang: string = 'en';

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
  Student: Student = new Student();

  // Report data
  medalReports: SocialWorkerMedalStudent[] = [];
  showTable: boolean = false;
  isLoading: boolean = false;
  isExporting: boolean = false;
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
    reportHeaderOneEn: 'Medal Student Report',
    reportHeaderTwoEn: 'Student Medal Records',
    reportHeaderOneAr: 'تقرير ميداليات الطالب',
    reportHeaderTwoAr: 'سجلات ميداليات الطالب'
  };

  constructor(
    private medalReportService: SocialWorkerMedalStudentService,
    private schoolService: SchoolService,
    private gradeService: GradeService,
    private classroomService: ClassroomService,
    private studentService: StudentService,
    private apiService: ApiService,
    public account: AccountService,   
    private route: ActivatedRoute,
    private languageService: LanguageService, 
    private reportsService: ReportsService,
    private loadingService: LoadingService 
  ) {}

  ngOnInit() {
    this.loadSchools();
    this.DomainName = this.apiService.GetHeader();
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.reportType = this.route.snapshot.data['reportType'] || 'employee';
    console.log(this.reportType)
    
    if(this.reportType == 'parent'){
      this.getStudentsByParentId()
    }
    else if(this.reportType == 'student'){
      this.showTable = true;
      this.medalReportService.GetByStudentID(this.UserID,this.DomainName).subscribe((s)=>{
        this.medalReports=s
        this.prepareExportData();
      })
    
      this.studentService.GetByID(this.UserID,this.DomainName).subscribe((d)=>{
        console.log(d)
        this.Student = d
      },error=>{
        console.log(error)
      })
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

  getStudentsByParentId(){ 
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
        this.selectedGradeId = 0;
        this.classes = [];
        this.selectedClassId = 0;
        this.students = [];
        this.selectedStudentId = 0;
        this.onFilterChange();
      } catch (error) {
        console.error('Error loading grades:', error);
      }
    } else {
      this.grades = [];
      this.selectedGradeId = 0;
      this.classes = [];
      this.selectedClassId = 0;
      this.students = [];
      this.selectedStudentId = 0;
      this.onFilterChange();
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
    } else {
      this.classes = [];
      this.selectedClassId = 0;
      this.students = [];
      this.selectedStudentId = 0;
      this.onFilterChange();
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
    if (this.reportType == 'parent') {
      this.showViewReportBtn = !!this.selectedStudentId;
    }
    else if (this.reportType == 'employee') {
      this.showViewReportBtn = !!this.selectedSchoolId && !!this.selectedGradeId &&
        !!this.selectedClassId && !!this.selectedStudentId;
    }
    this.medalReports = [];
  }

  async viewReport() {
    const Swal = await import('sweetalert2').then(m => m.default);

    if(this.reportType == 'employee'){
      if (!this.selectedSchoolId || !this.selectedGradeId || !this.selectedClassId || !this.selectedStudentId) {
        Swal.fire({
          title: 'Incomplete Selection',
          text: 'Please select School, Grade, Class, and Student to generate the report.',
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        return;
      }
    }
    else if(this.reportType == 'parent'){
      if (!this.selectedStudentId) {
        Swal.fire({
          title: 'Incomplete Selection',
          text: 'Please select Student to generate the report.',
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        return;
      }
    }

    this.isLoading = true;
    this.showTable = false;

    try {
      const domainName = this.apiService.GetHeader();
      const response = await firstValueFrom(
        this.medalReportService.GetByStudentID(this.selectedStudentId,domainName)
      ); 
      
      if (Array.isArray(response)) {
        this.medalReports = response;
        console.log('Medal reports loaded:', this.medalReports.length);
      } else {
        console.log('Response is not an array:', response);
        this.medalReports = [];
      }

      this.prepareExportData();
      this.showTable = true;
    } catch (error: any) { 
      this.medalReports = [];
      this.reportsForExport = []
      this.reportsForPDF = []
      this.showTable = true;
      if(error.status !== 404){
        Swal.fire({
          title: 'Error',
          text: 'Failed to load medal reports',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
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
   if(this.reportType === 'employee'){
     return this.students.find(s => s.id == this.selectedStudentId)?.name || 'All Students';
   }
   else if(this.reportType === 'parent'){
    const student = this.students.find(s => s.id == this.selectedStudentId);
    return student?.en_name || '';
   } else {
     return this.Student.en_name || '';
   }
  }

  // إضافة الدوال العربية
  getSchoolNameAr(): string {
    const school = this.schools.find(s => s.id == this.selectedSchoolId);
    return school?.ar_name || school?.name || 'كل المدارس';
  }

  getGradeNameAr(): string {
    const grade = this.grades.find(g => g.id == this.selectedGradeId);
    return grade?.ar_name || grade?.name || 'كل الصفوف';
  }

  getClassNameAr(): string {
    const classItem = this.classes.find(c => c.id == this.selectedClassId);
    return classItem?.ar_name || classItem?.name || 'كل الفصول';
  }

  getStudentNameAr(): string {
    if (this.reportType === 'employee') {
      const student = this.students.find(s => s.id == this.selectedStudentId);
      return student?.ar_name || student?.name || 'كل الطلاب';
    }
    else if (this.reportType === 'parent') {
      const student = this.students.find(s => s.id == this.selectedStudentId);
      return student?.ar_name || student?.en_name || 'كل الطلاب';
    } else {
      return this.Student.ar_name || this.Student.en_name || 'الطالب';
    }
  }

  getInfoRows(): any[] {
    const generatedOnAr = this.formatDateForArabic(new Date().toISOString().split('T')[0]);

    if(this.reportType === 'employee'){
      return [
        { keyEn: `School: ${this.getSchoolName()}`,  keyAr: `${this.getSchoolNameAr()} :المدرسة `},
        { keyEn: `Grade: ${this.getGradeName()}`, keyAr: ` ${this.getGradeNameAr()} :الصف`},
        { keyEn: `Class: ${this.getClassName()}`, keyAr:`${this.getClassNameAr()}:الفصل `},
        { keyEn: `Student: ${this.getStudentName()}`, keyAr: `${this.getStudentNameAr()} :الطالب `},    
        { keyEn: `Generated On: ${new Date().toLocaleDateString()}`, keyAr: `تم الإنشاء في: ${generatedOnAr}` }
      ]; 
   }
    else{
      return [
        { keyEn: `Student: ${this.getStudentName()}`, keyAr: `الطالب : ${this.getStudentNameAr()}` },
        { keyEn: `Generated On: ${new Date().toLocaleDateString()}`, keyAr: `تم الإنشاء في: ${generatedOnAr}` }
      ];
    }
  }

  // دوال التحقق التي كانت مفقودة
  OrCheck(): boolean {
    if (this.reportType === 'employee') {
      return !this.selectedSchoolId || !this.selectedGradeId || !this.selectedClassId || !this.selectedStudentId;
    }
    else if (this.reportType === 'parent') {
      return !this.selectedStudentId;
    }
    return false;
  }

  AndCheck(): boolean {
    if (this.reportType === 'employee') {
      return (!!this.selectedSchoolId && !!this.selectedGradeId && !!this.selectedClassId && !!this.selectedStudentId && !this.isLoading);
    }
    else if (this.reportType === 'parent') {
      return (!!this.selectedStudentId && !this.isLoading);
    }
    return false;
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
    return of(this.medalReports).pipe(
      map((reports) => {
        if (reports.length === 0) {
          return [];
        }

        return [{
          header: {
            en: 'Medal Student Report',
            ar: 'تقرير ميداليات الطالب'
          },
          summary: this.getInfoRows(), 
          table: {
            headers: {
              en: ['Medal Name', 'Added By'],
              ar: ['اسم الميدالية', 'تم الإضافة بواسطة']
            },
            data: reports.map((item: any) => ({
              'Medal Name': item.socialWorkerMedalName || '-',
              'اسم الميدالية': item.socialWorkerMedalArName || item.socialWorkerMedalName || '-',
              'Added By': item.insertedByUserName || '-',
              'تم الإضافة بواسطة': item.insertedByUserName || '-'
            }))
          }
        }];
      })
    );
  }

  getInfoRowsExcel(): any[] {
    if(this.reportType === 'employee'){
      return [
        { keyEn: `School: ${this.getSchoolName()}`,  keyAr: `${this.getSchoolNameAr()} :المدرسة `},
        { keyEn: `Grade: ${this.getGradeName()}`, keyAr: ` ${this.getGradeNameAr()} :الصف`},
        { keyEn: `Class: ${this.getClassName()}`, keyAr:`${this.getClassNameAr()}:الفصل `},
        { keyEn: `Student: ${this.getStudentName()}`, keyAr: `${this.getStudentNameAr()} :الطالب `}, 
      ]; 
    }
    else{
      return [
        { keyEn: `Student: ${this.getStudentName()}`, keyAr: `الطالب: ${this.getStudentNameAr()}` }
      ];
    }
  }

  private prepareExportData(): void {
    const isArabic = this.currentLang === 'ar';
    
    // For PDF (object format)
    this.reportsForPDF = this.medalReports.map((report) => ({
      'Medal Name': isArabic ? (report.socialWorkerMedalName || report.socialWorkerMedalName) : report.socialWorkerMedalName,
      'Added By': report.insertedByUserName,
      'اسم الميدالية': report.socialWorkerMedalName || report.socialWorkerMedalName,
      'تم الإضافة بواسطة': report.insertedByUserName
    }));

    // For Excel (array format)
    this.reportsForExport = this.medalReports.map((report) => [
      report.socialWorkerMedalName,
      report.insertedByUserName
    ]);
  }

  async DownloadAsPDF() {
    const Swal = await import('sweetalert2').then(m => m.default);

    if (this.reportsForPDF.length === 0) {
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

    if (this.reportsForPDF.length === 0) {
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
    const Swal = await import('sweetalert2').then(m => m.default);

    if (this.medalReports.length === 0) {
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }

    this.isExporting = true;
    
    try {
      const infoRows: { en: string; ar: string }[] = [];
      
      if (this.reportType === 'employee') {
    infoRows.push(
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
      );
      } else {
        infoRows.push(
          { 
            en: `Student: ${this.getStudentName() || ''}`, 
            ar: `الطالب: ${this.getStudentNameAr() || 'كل الطلاب'}` 
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
        tableHeaders = ['اسم الميدالية', 'تم الإضافة بواسطة'];
        tableData = this.medalReports.map((report) => {
          return [
            report.socialWorkerMedalName || report.socialWorkerMedalName || '-',
            report.insertedByUserName || '-'
          ];
        });
      } else {
        tableHeaders = ['Medal Name', 'Added By'];
        tableData = this.medalReports.map((report) => {
          return [
            report.socialWorkerMedalName || '-',
            report.insertedByUserName || '-'
          ];
        });
      }

      const excelOptions = {
        mainHeader: {
          en: 'Medal Student Report',
          ar: 'تقرير ميداليات الطالب'
        },
        subHeaders: [{
          en: 'Student Medal Records',
          ar: 'سجلات ميداليات الطالب'
        }],
        infoRows: infoRows,
        tables: [{
          headers: tableHeaders,
          data: tableData
        }],
        isRtl: isArabic,
        filename: `Medal_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      };

      await this.reportsService.generateExcelReport(excelOptions);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Swal.fire('Error', 'Failed to export to Excel', 'error');
    } finally {
      this.isExporting = false;
    }
  }
}