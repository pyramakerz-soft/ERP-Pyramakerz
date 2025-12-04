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
// import Swal from 'sweetalert2'; 
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { TokenData } from '../../../../../Models/token-data';
import { AccountService } from '../../../../../Services/account.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../../../../Services/loading.service';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.css'
})

@InitLoader()
export class AttendanceReportComponent implements OnInit {
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  reportType: string = 'employee';
  DomainName: string = '';

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
  current: any;
  constructor(
    private attendanceService: AttendanceService,
    private schoolService: SchoolService,
    public account: AccountService,
    private academicYearService: AcadimicYearService,
    private gradeService: GradeService,
    private classroomService: ClassroomService,
    private studentService: StudentService,
    private apiService: ApiService,
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
    if (this.reportType == 'parent') {
      this.getStudentsByParentId()
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
    if (this.reportType == 'parent') {
      this.showViewReportBtn = this.dateFrom !== '' && this.dateTo !== '' && !!this.selectedStudentId;
    }
    else {
      this.showViewReportBtn = this.dateFrom !== '' && this.dateTo !== '';
    }
    this.attendanceReports = [];
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
      this.reportsForExport = []
      this.reportsForExcel = []
      this.showTable = true;
    } finally {
      this.isLoading = false;
    }
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
    if (this.reportType === 'employee') {
      return this.students.find(s => s.id == this.selectedStudentId)?.name || 'All Students';
    }
    else {
      return this.students.find(s => s.id == this.selectedStudentId)?.en_name || '';
    }
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


// Adding BY Gaber ---77
async exportExcel() {
  const Swal = await import('sweetalert2').then(m => m.default);

  if (this.attendanceReports.length === 0) {
    Swal.fire('Warning', 'No data to export!', 'warning');
    return;
  }

  this.isExporting = true;

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
          en: `Academic Year: ${this.getAcademicYearName() || 'All Academic Years'}`, 
          ar: ` ${this.getAcademicYearNameAr() || 'كل السنوات الأكاديمية'} : السنة الأكاديمية ` 
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
        }
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
      tableHeaders = ['التاريخ', 'اسم الطالب', 'الحالة', 'وقت التأخير (دقائق)', 'ملاحظات'];
      tableData = this.attendanceReports.map((report) => {
        const date = new Date(report.date);
        return [
          date.toLocaleDateString('ar-EG'),
          report.studentArName || report.studentEnName || '-',
          report.isLate ? 'متأخر' : 'حاضر',
          report.isLate ? report.lateTimeInMinutes : '-',
          report.notes || '-'
        ];
      });
    } else {
      tableHeaders = ['Date', 'Student Name', 'Status', 'Late Time (minutes)', 'Notes'];
      tableData = this.attendanceReports.map((report) => {
        const date = new Date(report.date);
        return [
          date.toLocaleDateString('en-GB'),
          report.studentEnName || '-',
          report.isLate ? 'Late' : 'Present',
          report.isLate ? report.lateTimeInMinutes : '-',
          report.notes || '-'
        ];
      });
    }

    const excelOptions = {
      mainHeader: {
        en: 'Attendance Report',
        ar: 'تقرير الحضور'
      },
      subHeaders: [{
        en: 'Student Attendance Records',
        ar: 'سجلات حضور الطلاب'
      }],
      infoRows: infoRows,
      tables: [{
        headers: tableHeaders,
        data: tableData
      }],
      isRtl: isArabic,
      filename: `Attendance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
    };

    await this.reportsService.generateExcelReport(excelOptions);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    Swal.fire('Error', 'Failed to export to Excel', 'error');
  } finally {
    this.isExporting = false;
  }
}

getSchoolNameAr(): string {
  const school = this.schools.find(s => s.id == this.selectedSchoolId);
  return school?.ar_name || school?.name || ' All Schools ';
}

getAcademicYearNameAr(): string {
  const AcademicYearName = this.academicYears.find(a => a.id == this.selectedAcademicYearId);
  return AcademicYearName?.ar_name || AcademicYearName?.name || 'All AcademicYear' ;
}

getGradeNameAr(): string {
  const grade = this.grades.find(g => g.id == this.selectedGradeId);
  return grade?.ar_name || grade?.name || 'All Grades ';
}

getClassNameAr(): string {
  const classItem = this.classes.find(c => c.id == this.selectedClassId);
  return classItem?.ar_name || classItem?.name || 'All Classes ';
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
   const rows = [];
  if (this.reportType === 'employee') {
    return [
      { keyEn: `From Date: ${this.dateFrom}`, keyAr: `من تاريخ: ${this.dateFrom}` },
      { keyEn: `To Date: ${this.dateTo}`, keyAr: `إلى تاريخ: ${this.dateTo}` },
      { keyEn: `School: ${this.getSchoolName() || 'All Schools'}`,       keyAr: `${this.getSchoolNameAr()} : المدرسة `},
      { keyEn: `Academic Year: ${this.getAcademicYearName() || 'All Academic Years'}`,    keyAr: `${this.getAcademicYearNameAr()} :السنة الأكاديمية`},

      { keyEn: `Grade: ${this.getGradeName() || 'All Grades'}`,         keyAr: `${this.getGradeNameAr()} :الصف`},
      { keyEn: `Class: ${this.getClassName() || 'All Classes'}`,        keyAr: ` ${this.getClassNameAr()} :الفصل  `},
      { keyEn: `Student: ${this.getStudentName() || 'All Students'}`,   keyAr: ` ${this.getStudentNameAr()} :الطالب  `},
      { keyEn: `Generated On: ${new Date().toLocaleDateString()}`, keyAr: `تم الإنشاء في: ${generatedOnAr}` }
    ];
  } else {
    return [
      { keyEn: `From Date: ${this.dateFrom}`, keyAr: `من تاريخ: ${this.dateFrom}` },
      { keyEn: `To Date: ${this.dateTo}`, keyAr: `إلى تاريخ: ${this.dateTo}` },
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

getInfoRowsExcel(): any[] {
  if (this.reportType === 'employee') {
    return [
      { keyEn: `From Date: ${this.dateFrom}`, keyAr: `من تاريخ: ${this.dateFrom}` },
      { keyEn: `To Date: ${this.dateTo}`, keyAr: `إلى تاريخ: ${this.dateTo}` },
      { keyEn: `School: ${this.getSchoolName()}`, keyAr: `المدرسة: ${this.getSchoolNameAr()}` },
      { keyEn: `Academic Year: ${this.getAcademicYearName()}`, keyAr: `السنة الأكاديمية: ${this.getAcademicYearNameAr()}` },
      { keyEn: `Grade: ${this.getGradeName()}`, keyAr: `الصف: ${this.getGradeNameAr()}` },
      { keyEn: `Class: ${this.getClassName()}`, keyAr: `الفصل: ${this.getClassNameAr()}` },
      { keyEn: `Student: ${this.getStudentName()}`, keyAr: `الطالب: ${this.getStudentNameAr()}` }
    ];
  } else {
    return [
      { keyEn: `From Date: ${this.dateFrom}`, keyAr: `من تاريخ: ${this.dateFrom}` },
      { keyEn: `To Date: ${this.dateTo}`, keyAr: `إلى تاريخ: ${this.dateTo}` },
      { keyEn: `Student: ${this.getStudentName()}`, keyAr: `الطالب: ${this.getStudentNameAr()}` }
    ];
  }
}

getInfoRowsForPdf(): any[] {
  const generatedOnAr = new Date().toLocaleDateString('ar-EG');
  
  if (this.reportType === 'employee') {
    return [
      { keyEn: `From Date: ${this.dateFrom}`, keyAr: `من تاريخ: ${this.dateFrom}` },
      { keyEn: `To Date: ${this.dateTo}`, keyAr: `إلى تاريخ: ${this.dateTo}` },
      { keyEn: `School: ${this.getSchoolName()}`, keyAr: `المدرسة: ${this.getSchoolNameAr()}` },
      { keyEn: `Academic Year: ${this.getAcademicYearName()}`, keyAr: `السنة الأكاديمية: ${this.getAcademicYearNameAr()}` },
      { keyEn: `Grade: ${this.getGradeName()}`, keyAr: `الصف: ${this.getGradeNameAr()}` },
      { keyEn: `Class: ${this.getClassName()}`, keyAr: `الفصل: ${this.getClassNameAr()}` },
      { keyEn: `Student: ${this.getStudentName()}`, keyAr: `الطالب: ${this.getStudentNameAr()}` },
      { keyEn: `Generated On: ${new Date().toLocaleDateString()}`, keyAr: `تم الإنشاء في: ${generatedOnAr}` }
    ];
  } else {
    return [
      { keyEn: `From Date: ${this.dateFrom}`, keyAr: `من تاريخ: ${this.dateFrom}` },
      { keyEn: `To Date: ${this.dateTo}`, keyAr: `إلى تاريخ: ${this.dateTo}` },
      { keyEn: `Student: ${this.getStudentName()}`, keyAr: `الطالب: ${this.getStudentNameAr()}` },
      { keyEn: `Generated On: ${new Date().toLocaleDateString()}`, keyAr: `تم الإنشاء في: ${generatedOnAr}` }
    ];
  }
}

private prepareExportData(): void {
  const isArabic = this.isRtl;
  
  this.reportsForExport = this.attendanceReports.map((report) => {
    const studentName = isArabic ? 
      (report.studentArName || report.studentEnName || '-') : 
      (report.studentEnName || '-');
    
    const status = isArabic ? 
      (report.isLate ? 'متأخر' : 'حاضر') : 
      (report.isLate ? 'Late' : 'Present');
    
    return {
      'Date': new Date(report.date).toLocaleDateString(),
      'Student Name': studentName,
      'Status': status,
      'Late Time(minutes)': report.isLate ? report.lateTimeInMinutes : '-',
      'Notes': report.notes || '-',
      
      'التاريخ': this.formatDateForArabic(report.date),
      'اسم الطالب': studentName,
      'الحالة': status,
      'وقت التأخير (دقائق)': report.isLate ? report.lateTimeInMinutes : '-',
      'ملاحظات': report.notes || '-'
    };
  });
}


}