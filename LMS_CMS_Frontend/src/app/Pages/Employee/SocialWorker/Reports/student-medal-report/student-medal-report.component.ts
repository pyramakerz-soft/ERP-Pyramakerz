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
        this.grades = [];
        this.selectedGradeId = 0;
        this.classes = [];
        this.selectedClassId = 0;
        this.students = [];
        this.selectedStudentId = 0;
        this.onFilterChange();
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
        this.classes = [];
        this.selectedClassId = 0;
        this.students = [];
        this.selectedStudentId = 0;
        this.onFilterChange();
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
      this.selectedStudentId = 0;
      this.students =[]
      this.onFilterChange();
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
    // For employee view, try to get Arabic name from the medal reports
    if (this.medalReports.length > 0) {
      return this.medalReports[0].studentArName || this.medalReports[0].studentEnName || '';
    }
    // Fallback to finding student in the students array
    const student = this.students.find(s => s.id == this.selectedStudentId);
    return student?.ar_name || student?.name || '';
  }
  else if (this.reportType === 'parent') {
    const student = this.students.find(s => s.id == this.selectedStudentId);
    return student?.ar_name || student?.en_name || '';
  } 
  else {
    // For student view, use the Student object
    return this.Student.ar_name || this.Student.en_name || '';
  }
}

  getInfoRows(): any[] {
    const generatedOnAr = this.formatDateForArabic(new Date().toISOString().split('T')[0]);

    if(this.reportType === 'employee'){
      return [
        { keyEn: `School: ${this.getSchoolName()}`,  keyAr: `${this.getSchoolNameAr()} :المدرسة `},
        { keyEn: `Grade: ${this.getGradeName()}`, keyAr: ` ${this.getGradeNameAr()} :الصف`},
        { keyEn: `Class: ${this.getClassName()}`, keyAr:`${this.getClassNameAr()}:الفصل `},
      { keyEn: `Student: ${this.getStudentName() || 'All Students'}`,   keyAr: `(${this.getStudentNameAr()}) : الطالب/ة`},
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
              en: ['Medal', 'Medal Name', 'Added By'], // Add Medal column
              ar: ['الميدالية', 'اسم الميدالية', 'تم الإضافة بواسطة'] // Add Arabic for Medal
            },
            data: reports.map((item: any) => ({
              'Medal': item.socialWorkerMedalFile || '', // Add medal image
              'الميدالية': item.socialWorkerMedalFile || '',
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
    
    // For PDF (object format) - Add Medal image
    this.reportsForPDF = this.medalReports.map((report) => ({
      'Medal': report.socialWorkerMedalFile || '', // Add medal image URL
      'Medal Name': isArabic ? (report.socialWorkerMedalName || report.socialWorkerMedalName) : report.socialWorkerMedalName,
      'Added By': report.insertedByUserName,
      'اسم الميدالية': report.socialWorkerMedalName || report.socialWorkerMedalName,
      'تم الإضافة بواسطة': report.insertedByUserName
    }));

    // For Excel (array format) - Add medal image URL as text
    this.reportsForExport = this.medalReports.map((report) => [
      report.socialWorkerMedalFile || '', // Add medal image URL
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

  // Convert images to base64 before exporting
  this.isExporting = true;
  try {
    this.reportsForPDF = await this.convertImagesToBase64(this.reportsForPDF);
  } catch (error) {
    console.error('Image conversion failed, proceeding with original URLs:', error);
  }
  
  this.showPDF = true;
  setTimeout(() => {
    this.pdfComponentRef.downloadPDF();
    setTimeout(() => {
      this.showPDF = false;
      this.isExporting = false;
    }, 2000);
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
      // In the exportExcel() method, update the tableHeaders and tableData:
let tableHeaders: string[];
let tableData: any[][];

if (isArabic) {
  tableHeaders = ['الميدالية', 'اسم الميدالية', 'تم الإضافة بواسطة']; // Add Arabic header
  tableData = this.medalReports.map((report) => {
    return [
      report.socialWorkerMedalFile || '', // Add medal image URL
      report.socialWorkerMedalName || report.socialWorkerMedalName || '-',
      report.insertedByUserName || '-'
    ];
  });
} else {
  tableHeaders = ['Medal', 'Medal Name', 'Added By']; // Add English header
  tableData = this.medalReports.map((report) => {
    return [
      report.socialWorkerMedalFile || '', // Add medal image URL
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

  // Add this method to student-medal-report.component.ts
private async convertImagesToBase64(data: any[]): Promise<any[]> {
  const convertedData = [];
  
  for (const item of data) {
    const convertedItem = { ...item };
    
    // Check if this item has a medal image
    if (item['Medal'] && (item['Medal'].startsWith('http') || item['Medal'].startsWith('https'))) {
      try {
        convertedItem['Medal'] = await this.convertImgToBase64URL(item['Medal']);
        if (convertedItem['الميدالية']) {
          convertedItem['الميدالية'] = convertedItem['Medal'];
        }
      } catch (error) {
        console.error('Failed to convert image to base64:', error);
        // Keep original URL if conversion fails
      }
    }
    
    convertedData.push(convertedItem);
  }
  
  return convertedData;
}

private convertImgToBase64URL(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('Could not get canvas context');
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (e) {
        console.error('toDataURL failed:', e);
        reject(e);
      }
    };
    img.onerror = (e) => {
      console.error('Failed to load image', e);
      reject(e);
    };
    img.src = url;
  });
}
}