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
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx-js-style';
import { ClassroomService } from '../../../../../Services/Employee/LMS/classroom.service';
import { ActivatedRoute } from '@angular/router';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { GradeService } from '../../../../../Services/Employee/LMS/grade.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-daily-preformance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './daily-preformance-report.component.html',
  styleUrl: './daily-preformance-report.component.css',
})
export class DailyPreformanceReportComponent implements OnInit, OnDestroy {
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

  school = {
    reportHeaderOneEn: 'Daily Performance Report',
    reportHeaderTwoEn: 'Detailed Daily Performance Summary',
    reportHeaderOneAr: 'تقرير الأداء اليومي',
    reportHeaderTwoAr: 'ملخص الأداء اليومي التفصيلي',
    // reportImage: 'assets/images/logo.png',
  };

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  constructor(
    public dailyPerformanceService: DailyPerformanceService,
    public apiService: ApiService,
    public studentService: StudentService,
    public classroomService: ClassroomService,
    public schoolService: SchoolService,
    public gradeService: GradeService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService,
    private route: ActivatedRoute,
    private reportsService: ReportsService
  ) {}

  ngOnInit() {
    this.DomainName = this.apiService.GetHeader();

    // Get report type from route data
    this.reportType = this.route.snapshot.data['reportType'] || 'student';

    this.loadSchools();

    if (this.reportType === 'student') {
      this.school.reportHeaderOneEn = 'Student Daily Performance Report';
      this.school.reportHeaderOneAr = 'تقرير أداء الطالب اليومي';
    } else {
      this.school.reportHeaderOneEn = 'Classroom Daily Performance Report';
      this.school.reportHeaderOneAr = 'تقرير أداء الفصل اليومي';
    }

    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
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

    // Check if all required fields are filled
    const hasRequiredFields = this.SelectedStartDate && this.SelectedEndDate;
    
    if (this.reportType === 'student') {
      const hasValidSelection = this.SelectedSchoolId > 0 && 
                               this.SelectedGradeId > 0 && 
                               this.SelectedClassroomId > 0 && 
                               this.SelectedStudentId > 0;
      // this.showViewReportBtn = hasRequiredFields && hasValidSelection;
    } else {
      const hasValidSelection = this.SelectedSchoolId > 0 && 
                               this.SelectedGradeId > 0 && 
                               this.SelectedClassroomId > 0;
      // this.showViewReportBtn = hasRequiredFields && hasValidSelection;
    }
  }

  ViewReport() {
    if (this.SelectedStartDate > this.SelectedEndDate) {
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

    if (this.reportType === 'student') {
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
    const school = this.schools.find(s => s.id == this.SelectedSchoolId);
    return school ? school.name : 'Undefined';
  }

  getGradeName(): string {
    const grade = this.grades.find(g => g.id == this.SelectedGradeId);
    return grade ? grade.name : 'Undefined';
  }

  getClassroomName(): string {
    const classroom = this.classrooms.find(c => c.id == this.SelectedClassroomId);
    return classroom ? classroom.name : 'Undefined';
  }

  getStudentName(): string {
    const student = this.students.find(s => s.id == this.SelectedStudentId);
    return student ? student.name : 'Undefined';
  }

  getInfoRows(): any[] {
    const baseInfo = [
      {
        keyEn: 'School: ' + this.getSchoolName(),
        keyAr: 'المدرسة: ' + this.getSchoolName(),
      },
      {
        keyEn: 'Grade: ' + this.getGradeName(),
        keyAr: 'الصف: ' + this.getGradeName(),
      },
      {
        keyEn: 'Classroom: ' + this.getClassroomName(),
        keyAr: 'الفصل: ' + this.getClassroomName(),
      },
      {
        keyEn: 'Start Date: ' + this.SelectedStartDate,
        keyAr: 'تاريخ البدء: ' + this.SelectedStartDate,
      },
      {
        keyEn: 'End Date: ' + this.SelectedEndDate,
        keyAr: 'تاريخ الانتهاء: ' + this.SelectedEndDate,
      },
      {
        keyEn: 'Generated On: ' + new Date().toLocaleDateString(),
        keyAr: 'تم الإنشاء في: ' + new Date().toLocaleDateString(),
      },
    ];

    if (this.reportType === 'student') {
      baseInfo.splice(3, 0, {
        keyEn: 'Student: ' + this.getStudentName(),
        keyAr: 'الطالب: ' + this.getStudentName(),
      });
    }

    return baseInfo;
  }

  private prepareExportData(): void {
    if (this.reportType === 'student') {
      this.tableDataForExport = this.tableData.map((item) => ({
        Date: item.date,
        'Name': item.englishNameStudent,
        'Ar Name': item.arabicNameStudent,
        'Student ID': item.studentId,
        'Performance Type': item.performanceTypeEn || item.performanceTypeAr ,
        Comment: item.comment || '-',
      }));
    } else {
      this.tableDataForExport = this.tableData.map((item) => ({
        Date: item.date,
        'Avg Score': item.averageScore || '-',
        'Performance Type': item.performanceTypeEn || item.performanceTypeAr ,
        Comment: item.comment || '-',
      }));
    }
  }

  getTableDataWithHeader(): any[] {
    if (this.reportType === 'student') {
      return [
        {
          header: 'Student Daily Performance Report',
          summary: this.getInfoRows(),
          table: {
            headers: [
              'Date',
              'Name',
              'Student ID',
              'Performance Type',
              'Comment',
            ],
            data: this.tableData.map((item) => ({
              Date: item.date,
              'Name': item.englishNameStudent,
              'Student ID': item.studentId,
              'Performance Type': item.performanceTypeEn || item.performanceTypeAr ,
              Comment: item.comment,
            })),
          },
        },
      ];
    } else {
      return [
        {
          header: 'Classroom Daily Performance Report',
          summary: this.getInfoRows(),
          table: {
            headers: [
              'Date',
              'Avg Score',
              'Performance Type',
              'Comment',
            ],
            data: this.tableData.map((item) => ({
              Date: item.date,
              'Avg Score': item.averageScore,
              'Performance Type': item.performanceTypeEn || item.performanceTypeAr ,
              Comment: item.comment,
            })),
          },
        },
      ];
    }
  }

  Print() {
    if (this.tableDataForExport.length === 0) {
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
              width: 100% !important;
              height: auto !important;
              background: white !important;
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

  DownloadAsPDF() {
    if (this.tableDataForExport.length === 0) {
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
      Swal.fire({
        title: 'No Data',
        text: 'No data available for export.',
        icon: 'info',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      // Prepare table data for export
      const tableData = this.tableData.map((item) => {
        if (this.reportType === 'student') {
          return [
            item.date,
            item.englishNameStudent,
            item.studentId,
            item.performanceTypeEn || item.performanceTypeAr ,
            item.comment || '-',
          ];
        } else {
          return [
            item.date,
            item.averageScore || '-',
            item.performanceTypeEn || item.performanceTypeAr ,
            item.comment || '-',
          ];
        }
      });

      // Prepare info rows
      const infoRows = [
        { key: 'School', value: this.getSchoolName() },
        { key: 'Grade', value: this.getGradeName() },
        { key: 'Classroom', value: this.getClassroomName() },
        { key: 'Start Date', value: this.SelectedStartDate },
        { key: 'End Date', value: this.SelectedEndDate },
        { key: 'Generated On', value: new Date().toLocaleDateString() }
      ];

      if (this.reportType === 'student') {
        infoRows.splice(3, 0, { key: 'Student', value: this.getStudentName() });
      }

      // Prepare headers based on report type
      const headers = this.reportType === 'student'
        ? ['Date', 'Name', 'Student ID', 'Performance Type', 'Comment']
        : ['Date', 'Avg Score', 'Performance Type', 'Comment'];

      // Generate the Excel report using the service
      await this.reportsService.generateExcelReport({
        mainHeader: {
          en: this.reportType === 'student'
            ? 'Student Daily Performance Report'
            : 'Classroom Daily Performance Report',
          ar: this.reportType === 'student'
            ? 'تقرير أداء الطالب اليومي'
            : 'تقرير أداء الفصل اليومي',
        },
        subHeaders: [
          {
            en: 'Detailed Daily Performance Summary',
            ar: 'ملخص الأداء اليومي التفصيلي',
          },
        ],
        infoRows: infoRows,
        tables: [
          {
            title: this.reportType === 'student'
              ? 'Student Performance Data'
              : 'Classroom Performance Data',
            headers: headers,
            data: tableData,
          },
        ],
        filename: `${this.reportType === 'student' ? 'Student' : 'Classroom'}_Daily_Performance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`,
      });
    } catch (error) {
      console.error('Error generating Excel report:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to generate Excel report.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }
}