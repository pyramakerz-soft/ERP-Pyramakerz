import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { CertificateStudent, CertificateStudentReportItem } from '../../../../../Models/SocialWorker/certificate-student';
import { firstValueFrom, Subscription } from 'rxjs';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { GradeService } from '../../../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../../../Services/Employee/LMS/classroom.service';
import { StudentService } from '../../../../../Services/student.service';
import { ApiService } from '../../../../../Services/api.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
// import Swal from 'sweetalert2'; 
import { CertificateStudentService } from '../../../../../Services/Employee/SocialWorker/certificate-student.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { ActivatedRoute } from '@angular/router';
import { TokenData } from '../../../../../Models/token-data';
import { AccountService } from '../../../../../Services/account.service';
import { Student } from '../../../../../Models/student';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../../Services/loading.service';


@Component({
  selector: 'app-certificate-student-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './certificate-student-report.component.html',
  styleUrl: './certificate-student-report.component.css'
})

@InitLoader()
export class CertificateStudentReportComponent implements OnInit {
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  reportType: string = 'employee';
  DomainName: string = '';

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
  certificateReports: CertificateStudent[] = [];
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
    public account: AccountService,
    private route: ActivatedRoute,
    private languageService: LanguageService,
    private reportsService: ReportsService,
    private loadingService: LoadingService

  ) { }

  ngOnInit() {
    this.loadSchools();
    this.DomainName = this.apiService.GetHeader();
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.reportType = this.route.snapshot.data['reportType'] || 'employee';
    console.log(this.reportType)
    if (this.reportType == 'parent') {
      this.getStudentsByParentId()
    }
    else if (this.reportType == 'student') {
      this.showTable = true;
      this.certificateReportService.GetByStudentID(this.UserID, this.DomainName).subscribe((s) => {
        this.certificateReports = s
        this.prepareExportData();
      })

      this.studentService.GetByIDByToken(this.DomainName).subscribe((d) => { 
        this.Student = d
      }, error => {
        console.log(error)
      })
    }

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
        en_name: student.en_name || '',
        ar_name: student.ar_name || '',
        name: this.isRtl ? (student.ar_name || student.en_name || 'غير معروف') : 
        (student.en_name || student.ar_name || 'Unknown'),
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
    else {
      this.showViewReportBtn = !!this.selectedSchoolId && !!this.selectedGradeId &&
        !!this.selectedClassId && !!this.selectedStudentId;
    }
    this.certificateReports = [];
  }

  async viewReport() {
    const Swal = await import('sweetalert2').then(m => m.default);

    if (this.reportType == 'employee') {
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
    else if (this.reportType == 'parent') {
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
        this.certificateReportService.GetByStudentID(
          this.selectedStudentId,
          domainName
        )
      );
      if (Array.isArray(response)) {
        this.certificateReports = response;
      } else {
        this.certificateReports = [];
      }

      this.prepareExportData();
      this.showTable = true;
    } catch (error: any) {
      this.certificateReports = [];
      this.showTable = true;
      if (error.status !== 404) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to load certificate reports',
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
    if (this.reportType === 'employee') {
      const student = this.students.find(s => s.id == this.selectedStudentId);
      return student?.name || 'All Students';
    }
    else if (this.reportType === 'parent') {
      const student = this.students.find(s => s.id == this.selectedStudentId);
      return student?.en_name || '';
    } else {
      return this.Student.en_name || '';
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



  getInfoRows(): any[] {
  const generatedOnAr = this.formatDateForArabic(new Date().toISOString().split('T')[0]);
    if (this.reportType === 'employee') {
      return [
      { keyEn: `School: ${this.getSchoolName() || 'All Schools'}`,       keyAr: `${this.getSchoolNameAr()} : المدرسة `},
      { keyEn: `Grade: ${this.getGradeName() || 'All Grades'}`,         keyAr: `${this.getGradeNameAr()} :الصف`},
      { keyEn: `Class: ${this.getClassName() || 'All Classes'}`,        keyAr: ` ${this.getClassNameAr()} :الفصل  `},
      { keyEn: `Student: ${this.getStudentName() || 'All Students'}`,   keyAr: ` ${this.getStudentNameAr()} :الطالب  `},
        { keyEn: `Generated On: ${new Date().toLocaleDateString()}`, keyAr: `تم الإنشاء في: ${generatedOnAr}` }
      ];
    }
    else {
      return [
        { keyEn: `Student: ${this.getStudentName()}`, keyAr: `الطالب: ${this.getStudentNameAr()}` },
        { keyEn: `Generated On: ${new Date().toLocaleDateString()}`, keyAr: `تم الإنشاء في: ${generatedOnAr}` }
      ];
    }
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


  getInfoRowsForPdf(): any[] {
    const generatedOnAr = new Date().toLocaleDateString('ar-EG');
    
    if (this.reportType === 'employee') {
      return [
        { keyEn: `School: ${this.getSchoolName()}`, keyAr: `المدرسة: ${this.getSchoolNameAr()}` },
        { keyEn: `Grade: ${this.getGradeName()}`, keyAr: `الصف: ${this.getGradeNameAr()}` },
        { keyEn: `Class: ${this.getClassName()}`, keyAr: `الفصل: ${this.getClassNameAr()}` },
        { keyEn: `Student: ${this.getStudentName()}`, keyAr: `الطالب: ${this.getStudentNameAr()}` },
        { keyEn: `Generated On: ${new Date().toLocaleDateString()}`, keyAr: `تم الإنشاء في: ${generatedOnAr}` }
      ];
    }
    else {
      return [
        { keyEn: `Student: ${this.getStudentName()}`, keyAr: `الطالب: ${this.getStudentNameAr()}` },
        { keyEn: `Generated On: ${new Date().toLocaleDateString()}`, keyAr: `تم الإنشاء في: ${generatedOnAr}` }
      ];
    }
  }

  getInfoRowsExcel(): any[] {
    if (this.reportType === 'employee') {
      return [
        { keyEn: `School: ${this.getSchoolName()}`, keyAr: `المدرسة: ${this.getSchoolNameAr()}` },
        { keyEn: `Grade: ${this.getGradeName()}`, keyAr: `الصف: ${this.getGradeNameAr()}` },
        { keyEn: `Class: ${this.getClassName()}`, keyAr: `الفصل: ${this.getClassNameAr()}` },
        { keyEn: `Student: ${this.getStudentName()}`, keyAr: `الطالب: ${this.getStudentNameAr()}` }
      ];
    }
    else {
      return [
        { keyEn: `Student: ${this.getStudentName()}`, keyAr: `الطالب: ${this.getStudentNameAr()}` }
      ];
    }
  }

  private prepareExportData(): void {
    // For PDF (object format) - keep only the fields shown in the table
    this.reportsForExport = this.certificateReports.map((report) => ({
      'Certificate Name': report.certificateTypeName,
      'Added By': report.insertedByUserName,
      
      // البيانات بالعربية
      'اسم الشهادة': report.certificateTypeName || report.certificateTypeName,
      'تم الإضافة بواسطة': report.insertedByUserName
    }));

    this.reportsForExcel = this.certificateReports.map((report) => [
      report.certificateTypeName,
      report.insertedByUserName
    ]);
  }

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

  async exportExcel() {
    const Swal = await import('sweetalert2').then(m => m.default);

    if (this.certificateReports.length === 0) {
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
        },
        );
      }
      
      infoRows.push(
        { 
          en: `Generated On: ${new Date().toLocaleDateString('en-GB')}`, 
          ar: `${new Date().toLocaleDateString('en-GB')} : تم الإنشاء في` 
        }
      );

      const currentLang = document.documentElement.lang || 'en';
      const isArabic = currentLang === 'ar' || this.isRtl;
      
      let tableHeaders: string[];
      let tableData: any[][];
      
      if (isArabic) {
        tableHeaders = ['اسم الشهادة', 'تم الإضافة بواسطة'];
        tableData = this.certificateReports.map((report) => {
          return [
            report.certificateTypeName || report.certificateTypeName || '-',
            report.insertedByUserName || '-'
          ];
        });
      } else {
        tableHeaders = ['Certificate Name', 'Added By'];
        tableData = this.certificateReports.map((report) => {
          return [
            report.certificateTypeName || '-',
            report.insertedByUserName || '-'
          ];
        });
      }

      const excelOptions = {
        mainHeader: {
          en: 'Certificate Student Report',
          ar: 'تقرير شهادات الطالب'
        },
        subHeaders: [{
          en: 'Student Certificate Records',
          ar: 'سجلات شهادات الطالب'
        }],
        infoRows: infoRows,
        tables: [{
          headers: tableHeaders,
          data: tableData
        }],
        isRtl: isArabic,
        filename: `Certificate_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      };

      await this.reportsService.generateExcelReport(excelOptions);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Swal.fire('Error', 'Failed to export to Excel', 'error');
    } finally {
      this.isExporting = false;
    }
  }

  downloadCertificate(row: CertificateStudent) {
    const imageUrl = row.certificateTypeFile;

    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const img = new Image();
          img.src = base64data;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const leftPx = (row.leftSpace / 100) * img.width;
            const topPx = (row.topSpace / 100) * img.height;
            const fontSize = Math.floor(img.height * 0.05);
            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = 'black';
            ctx.fillText(row.studentEnName, leftPx, topPx);

            const link = document.createElement('a');
            link.download = `${row.studentEnName}-certificate.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
          };
        };
        reader.readAsDataURL(blob);
      })
      .catch(err => console.error('Error loading image:', err));
  }
}