import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { Subscription } from 'rxjs';
import { DailyPerformanceService } from '../../../../../Services/Employee/LMS/daily-performance.service';
import { ApiService } from '../../../../../Services/api.service';
import { StudentService } from '../../../../../Services/student.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
// import Swal from 'sweetalert2'; 
import { ClassroomService } from '../../../../../Services/Employee/LMS/classroom.service';
import { ActivatedRoute } from '@angular/router';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { GradeService } from '../../../../../Services/Employee/LMS/grade.service';
import { firstValueFrom } from 'rxjs';
import { TokenData } from '../../../../../Models/token-data';
import { AccountService } from '../../../../../Services/account.service';
import { PerformanceTypeService } from '../../../../../Services/Employee/LMS/performance-type.service';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../../Services/loading.service';

class PerformanceType {
  id: number = 0;
  englishName: string = '';
  arabicName: string = '';
}

class StudentPerformanceData {
  performanceTypeID: number = 0;
  performanceTypeEn: string = '';
  performanceTypeAr: string = '';
  stars?: number = 0;
  averageScore?: number = 0;
}

class StudentReportRow {
  date: string = '';
  studentId: number = 0;
  englishNameStudent: string = '';
  arabicNameStudent: string = '';
  studentPerformance: StudentPerformanceData[] = [];
  comment: string = '';
}

class ClassroomReportRow {
  date: string = '';
  classroomName: string = '';
  studentPerformance: StudentPerformanceData[] = [];
}

@Component({
  selector: 'app-daily-preformance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './daily-preformance-report.component.html',
  styleUrl: './daily-preformance-report.component.css',
})

@InitLoader()
export class DailyPreformanceReportComponent implements OnInit, OnDestroy {
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  DomainName: string = '';
  SelectedSchoolId: number = 0;
  SelectedGradeId: number = 0;
  SelectedClassroomId: number = 0;
  SelectedStudentId: number = 0;
  SelectedStartDate: string = '';
  SelectedEndDate: string = '';
  reportType: string = 'student';

  showTable: boolean = false;
  showViewReportBtn: boolean = false;
  showPDF: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  tableData: any[] = [];
  tableDataForExport: any[] = [];
  students: any[] = [];
  classrooms: any[] = [];
  schools: any[] = [];
  grades: any[] = [];
  isLoading: boolean = false;
  performanceTypes: PerformanceType[] = [];

  school = {
    reportHeaderOneEn: 'Daily Performance Report',
    reportHeaderTwoEn: 'Detailed Daily Performance Summary',
    reportHeaderOneAr: 'تقرير الأداء اليومي',
    reportHeaderTwoAr: 'ملخص الأداء اليومي التفصيلي',
    reportImage: '' // Add this if you have school logo
  };

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  constructor(
    public dailyPerformanceService: DailyPerformanceService,
    public apiService: ApiService,
    public studentService: StudentService,
    public classroomService: ClassroomService,
    public schoolService: SchoolService,
    public gradeService: GradeService,
    public performanceTypeService: PerformanceTypeService,
    private languageService: LanguageService, 
    private route: ActivatedRoute,
    public account: AccountService,
    private reportsService: ReportsService,
    private loadingService: LoadingService 
  ) {}

  ngOnInit() {
    this.DomainName = this.apiService.GetHeader();
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.reportType = this.route.snapshot.data['reportType'] || 'student';
    console.log(this.reportType);

    this.loadSchools();
    this.loadPerformanceTypes();

    if (this.reportType === 'student' || this.reportType === 'parent') {
      this.school.reportHeaderOneEn = 'Student Daily Performance Report';
      this.school.reportHeaderOneAr = 'تقرير أداء الطالب اليومي';
    } else {
      this.school.reportHeaderOneEn = 'Classroom Daily Performance Report';
      this.school.reportHeaderOneAr = 'تقرير أداء الفصل اليومي';
    }

    if (this.reportType === 'parent') {
      this.getStudentsByParentId();
    }
    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {  
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async loadPerformanceTypes() {
    try {
      const data = await firstValueFrom(
        this.performanceTypeService.Get(this.DomainName)
      );
      this.performanceTypes = data || [];
    } catch (error) {
      console.error('Error loading performance types:', error);
      this.performanceTypes = [];
    }
  }

  getStudentsByParentId() {
    this.studentService.Get_By_ParentID(this.UserID, this.DomainName).subscribe((d) => {
      this.students = d;
      console.log(this.students);
    });
  }

  async loadSchools() {
    try {
      const data = await firstValueFrom(this.schoolService.Get(this.DomainName));
      if (data && data.length > 0) {
        this.schools = data;
      } else {
        this.schools = [{ id: -1, name: 'No data available' }];
      }
    } catch (error) {
      console.error('Error loading schools:', error);
      this.schools = [{ id: -1, name: 'No data available' }];
    }
  }

  async loadGrades() {
    if (this.SelectedSchoolId > 0) {
      try {
        const data = await firstValueFrom(
          this.gradeService.GetBySchoolId(this.SelectedSchoolId, this.DomainName)
        );
        if (data && data.length > 0) {
          this.grades = data;
        } else {
          this.grades = [{ id: -1, name: 'No data available' }];
        }
        this.SelectedGradeId = 0;
        this.classrooms = [];
        this.SelectedClassroomId = 0;
        this.students = [];
        this.SelectedStudentId = 0;
        this.DateChange();
      } catch (error) {
        console.error('Error loading grades:', error);
        this.grades = [{ id: -1, name: 'No data available' }];
      }
    }
  }

  async loadClassrooms() {
    if (this.SelectedGradeId > 0) {
      try {
        const data = await firstValueFrom(
          this.classroomService.GetByGradeId(this.SelectedGradeId, this.DomainName)
        );
        if (data && data.length > 0) {
          this.classrooms = data;
        } else {
          this.classrooms = [{ id: -1, name: 'No data available' }];
        }
        this.SelectedClassroomId = 0;
        this.students = [];
        this.SelectedStudentId = 0;
        this.DateChange();
      } catch (error) {
        console.error('Error loading classrooms:', error);
        this.classrooms = [{ id: -1, name: 'No data available' }];
      }
    }
  }

  async loadStudents() {
    if (this.SelectedClassroomId > 0) {
      try {
        const data = await firstValueFrom(
          this.studentService.GetByClassID(this.SelectedClassroomId, this.DomainName)
        );
        if (data && data.length > 0) {
          this.students = data.map((student: any) => ({
            id: student.id,
            name: student.en_name || student.ar_name || 'Unknown',
          }));
        } else {
          this.students = [{ id: -1, name: 'No data available' }];
        }
        this.SelectedStudentId = 0;
        this.DateChange();
      } catch (error) {
        console.error('Error loading students:', error);
        this.students = [{ id: -1, name: 'No data available' }];
      }
    }
  }

  DateChange() {
    this.showTable = false;
  }

  async ViewReport() {
    if (this.SelectedStartDate > this.SelectedEndDate) {
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        title: 'Invalid Date Range',
        text: 'Start date cannot be later than end date.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
    } else {
      this.GetData();
    }
  }

  GetData() {
    this.isLoading = true;
    this.tableData = [];

    if (this.reportType === 'student' || this.reportType === 'parent') {
      this.dailyPerformanceService
        .GetDailyPerformanceReport(
          this.SelectedSchoolId,
          this.SelectedGradeId,
          this.SelectedClassroomId,
          this.SelectedStudentId,
          this.SelectedStartDate,
          this.SelectedEndDate,
          this.DomainName
        )
        .subscribe(
          (data) => {
            this.processData(data);
            console.log(data);
          },
          (error) => {
            this.handleError(error);
          }
        );
    } else {
      this.dailyPerformanceService
        .GetClassroomDailyPerformanceAverages(
          this.SelectedSchoolId,
          this.SelectedGradeId,
          this.SelectedClassroomId,
          this.SelectedStartDate,
          this.SelectedEndDate,
          this.DomainName
        )
        .subscribe(
          (data) => {
            this.processData(data);
          },
          (error) => {
            this.handleError(error);
          }
        );
    }
  }

  private processData(data: any[]) {
    this.tableData = data;
    this.prepareExportData();
    this.showTable = true;
    this.isLoading = false;
  }

  private handleError(error: any) {
    console.error('Error fetching daily performance report:', error);
    this.showTable = true;
    this.isLoading = false;
  }

  get fileName(): string {
    return this.reportType === 'student'
      ? 'Student Daily Performance Report'
      : 'Classroom Daily Performance Report';
  }

  getSchoolName(): string {
    const school = this.schools.find((s) => s.id == this.SelectedSchoolId);
    return school ? school.name : 'Undefined';
  }

  getGradeName(): string {
    const grade = this.grades.find((g) => g.id == this.SelectedGradeId);
    return grade ? grade.name : 'Undefined';
  }

  getClassroomName(): string {
    const classroom = this.classrooms.find((c) => c.id == this.SelectedClassroomId);
    return classroom ? classroom.name : 'Undefined';
  }

  getStudentName(): string {
    const student = this.students.find((s) => s.id == this.SelectedStudentId);
    return student ? student.name : 'Undefined';
  }

  OrCheck(): boolean {
    if (this.reportType === 'student') {
      return (
        !this.SelectedStartDate ||
        !this.SelectedEndDate ||
        !this.SelectedSchoolId ||
        !this.SelectedGradeId ||
        !this.SelectedClassroomId ||
        !this.SelectedStudentId ||
        this.isLoading
      );
    } else if (this.reportType === 'parent') {
      return (
        !this.SelectedStartDate ||
        !this.SelectedEndDate ||
        !this.SelectedStudentId ||
        this.isLoading
      );
    } else {
      return (
        !this.SelectedStartDate ||
        !this.SelectedEndDate ||
        !this.SelectedSchoolId ||
        !this.SelectedGradeId ||
        !this.SelectedClassroomId ||
        this.isLoading
      );
    }
  }

  AndCheck(): boolean {
    if (this.reportType === 'student') {
      return (
        !!this.SelectedStartDate &&
        !!this.SelectedEndDate &&
        !!this.SelectedSchoolId &&
        !!this.SelectedGradeId &&
        !!this.SelectedClassroomId &&
        !!this.SelectedStudentId &&
        !this.isLoading
      );
    } else if (this.reportType === 'parent') {
      return (
        !!this.SelectedStartDate &&
        !!this.SelectedEndDate &&
        !!this.SelectedStudentId &&
        !this.isLoading
      );
    } else {
      return (
        !!this.SelectedStartDate &&
        !!this.SelectedEndDate &&
        !!this.SelectedSchoolId &&
        !!this.SelectedGradeId &&
        !!this.SelectedClassroomId &&
        !this.isLoading
      );
    }
  }

  getInfoRows(): any[] {
    const baseInfo = [
      {
        keyEn: 'School: ' + this.getSchoolName(),
        keyAr: 'المدرسة: ' + this.getSchoolName()
      },
      {
        keyEn: 'Grade: ' + this.getGradeName(),
        keyAr: 'الصف: ' + this.getGradeName()
      },
      {
        keyEn: 'Classroom: ' + this.getClassroomName(),
        keyAr: 'الفصل: ' + this.getClassroomName()
      },
      {
        keyEn: 'Start Date: ' + this.SelectedStartDate,
        keyAr: 'تاريخ البدء: ' + this.SelectedStartDate
      },
      {
        keyEn: 'End Date: ' + this.SelectedEndDate,
        keyAr: 'تاريخ الانتهاء: ' + this.SelectedEndDate
      },
      {
        keyEn: 'Generated On: ' + new Date().toLocaleDateString(),
        keyAr: 'تم الإنشاء في: ' + new Date().toLocaleDateString()
      },
    ];

    if (this.reportType == 'student' || this.reportType == 'parent') {
      baseInfo.splice(3, 0, {
        keyEn: 'Student: ' + this.getStudentName(),
        keyAr: 'الطالب: ' + this.getStudentName()
      });
    }

    return baseInfo;
  }

  getStars(performanceData: StudentPerformanceData[], typeId: number): number {
    const perf = performanceData.find((p) => p.performanceTypeID === typeId);
    return perf?.stars ?? 0;
  }

  getAverageScore(performanceData: StudentPerformanceData[], typeId: number): number {
    const perf = performanceData.find((p) => p.performanceTypeID === typeId);
    return perf?.averageScore ?? 0;
  }

  getAverageScorePercentage(performanceData: StudentPerformanceData[], typeId: number): number {
    const avgScore = this.getAverageScore(performanceData, typeId);
    return avgScore * 100;
  }

  getStarFillPercentage(performanceData: StudentPerformanceData[], typeId: number, starPosition: number): number {
    const percentage = this.getAverageScorePercentage(performanceData, typeId);
    const stars = percentage / 20;
    
    if (starPosition <= Math.floor(stars)) {
      return 100;
    } else if (starPosition === Math.ceil(stars) && stars % 1 !== 0) {
      return (stars % 1) * 100;
    } else {
      return 0;
    }
  }

  getPerformanceTypeName(typeId: number): string {
    const type = this.performanceTypes.find((t) => t.id === typeId);
    return this.isRtl ? (type?.arabicName || '') : (type?.englishName || '');
  }

  private prepareExportData(): void {
    if (this.reportType === 'student' || this.reportType === 'parent') {
      this.tableDataForExport = this.tableData.map((item) => {
        const row: any = {
          Date: item.date,
        };
        
        this.performanceTypes.forEach((type) => {
          const stars = this.getStars(item.studentPerformance, type.id);
          row[type.englishName] = stars || 0;
        });
        
        row['Comment'] = item.comment || '-';
        return row;
      });
    } else {
      this.tableDataForExport = this.tableData.map((item) => {
        const row: any = {
          Date: item.date,
        };
        
        this.performanceTypes.forEach((type) => {
          const percentage = this.getAverageScorePercentage(item.studentPerformance, type.id);
          row[type.englishName] = percentage > 0 ? percentage.toFixed(0) + '%' : '0%';
        });
        
        return row;
      });
    }
  }

  getTableHeaders(): string[] {
    if (this.reportType === 'student' || this.reportType === 'parent') {
      return [
        'Date',
        ...this.performanceTypes.map(t => this.isRtl ? t.arabicName : t.englishName),
        'Comment'
      ];
    } else {
      return [
        'Date',
        ...this.performanceTypes.map(t => this.isRtl ? t.arabicName : t.englishName)
      ];
    }
  }

  getTableDataForPDF(): any[] {
    if (this.reportType === 'student' || this.reportType === 'parent') {
      return this.tableData.map((item) => {
        const row: any = {
          'Date': item.date,
        };
        
        this.performanceTypes.forEach((type) => {
          const stars = this.getStars(item.studentPerformance, type.id);
          const starDisplay = '★'.repeat(stars) + '☆'.repeat(5 - stars);
          const columnName = this.isRtl ? type.arabicName : type.englishName;
          row[columnName] = stars > 0 ? starDisplay : '-';
        });
        
        row['Comment'] = item.comment || '-';
        return row;
      });
    } else {
      // Classroom report - show percentage only in PDF/Print
      return this.tableData.map((item) => {
        const row: any = {
          'Date': item.date,
        };
        
        this.performanceTypes.forEach((type) => {
          const percentage = this.getAverageScorePercentage(item.studentPerformance, type.id);
          const columnName = this.isRtl ? type.arabicName : type.englishName;
          row[columnName] = percentage > 0 ? `${percentage.toFixed(0)}%` : '0%';
        });
        
        return row;
      });
    }
  }

  // Improved Print function
  async Print() {
    if (this.tableDataForExport.length === 0) {
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire('Warning', 'No data to print!', 'warning');
      return;
    }

    this.showPDF = true;
    setTimeout(() => {
      const printContents = document.getElementById('Data')?.innerHTML;
      if (!printContents) {
        console.error('Element not found!');
        this.showPDF = false;
        return;
      }

      const printStyle = `
        <style>
          @page { size: auto; margin: 10mm; }
          body { margin: 0; font-family: Arial, sans-serif; }
          @media print {
            body > *:not(#print-container) { display: none !important; }
            #print-container {
              display: block !important;
              position: static !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              margin: 0 !important;
              padding: 20px !important;
            }
            .print-table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            .print-table th, .print-table td {
              border: 1px solid #ddd !important;
              padding: 8px !important;
              text-align: center !important;
            }
            .print-table th {
              background-color: #f5f5f5 !important;
              font-weight: bold !important;
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

  // Improved PDF Download function
  async DownloadAsPDF() {
    if (this.tableDataForExport.length === 0) {
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }

    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }

  async DownloadAsExcel() {
    if (!this.tableData || this.tableData.length === 0) {
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        title: 'No Data',
        text: 'No data available for export.',
        icon: 'info',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      const infoRows = [
        { key: 'School', value: this.getSchoolName() },
        { key: 'Grade', value: this.getGradeName() },
        { key: 'Classroom', value: this.getClassroomName() },
        { key: 'Start Date', value: this.SelectedStartDate },
        { key: 'End Date', value: this.SelectedEndDate },
        { key: 'Generated On', value: new Date().toLocaleDateString() },
      ];

      if (this.reportType === 'student' || this.reportType === 'parent') {
        infoRows.splice(3, 0, { key: 'Student', value: this.getStudentName() });
      }

      const headers = (this.reportType === 'student' || this.reportType === 'parent')
        ? ['Date', ...this.performanceTypes.map(t => t.englishName), 'Comment']
        : ['Date', ...this.performanceTypes.map(t => t.englishName)];

      const tableData = this.tableData.map((item) => {
        if (this.reportType === 'student' || this.reportType === 'parent') {
          const row = [
            item.date,
          ];
          
          this.performanceTypes.forEach((type) => {
            const stars = this.getStars(item.studentPerformance, type.id);
            row.push(stars || 0);
          });
          
          row.push(item.comment || '-');
          return row;
        } else {
          const row = [item.date];
          
          this.performanceTypes.forEach((type) => {
            const percentage = this.getAverageScorePercentage(item.studentPerformance, type.id);
            row.push(percentage > 0 ? percentage.toFixed(0) + '%' : '0%');
          });
          
          return row;
        }
      });

      await this.reportsService.generateExcelReport({
        mainHeader: {
          en: (this.reportType === 'student' || this.reportType === 'parent')
            ? 'Student Daily Performance Report'
            : 'Classroom Daily Performance Report',
          ar: (this.reportType === 'student' || this.reportType === 'parent')
            ? 'تقرير أداء الطالب اليومي'
            : 'تقرير أداء الفصل اليومي',
        },
        infoRows: infoRows,
        tables: [
          {
            headers: headers,
            data: tableData,
          },
        ],
        filename: `${(this.reportType === 'student' || this.reportType === 'parent') ? 'Student' : 'Classroom'}_Daily_Performance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`,
      });
    } catch (error) {
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        title: 'Error',
        text: 'Failed to generate Excel report.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }
}