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

@Component({
  selector: 'app-daily-preformance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './daily-preformance-report.component.html',
  styleUrl: './daily-preformance-report.component.css',
})
export class DailyPreformanceReportComponent implements OnInit, OnDestroy {
  DomainName: string = '';
  SelectedStudentId: number = 0;
  SelectedClassroomId: number = 0; // Add classroom selection
  SelectedStartDate: string = '';
  SelectedEndDate: string = '';
  reportType: string = 'student'; // Default to student report

  showTable: boolean = false;
  showViewReportBtn: boolean = false;
  showPDF: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  tableData: any[] = [];
  tableDataForExport: any[] = [];
  students: any[] = [];
  classrooms: any[] = []; // Add classrooms array
  isLoading: boolean = false;

  school = {
    reportHeaderOneEn: 'Daily Performance Report',
    reportHeaderTwoEn: 'Detailed Daily Performance Summary',
    reportHeaderOneAr: 'تقرير الأداء اليومي',
    reportHeaderTwoAr: 'ملخص الأداء اليومي التفصيلي',
    reportImage: 'assets/images/logo.png',
  };

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  constructor(
    public dailyPerformanceService: DailyPerformanceService,
    public apiService: ApiService,
    public studentService: StudentService,
    public classroomService: ClassroomService, // Add classroom service
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService,
    private route: ActivatedRoute,
    private reportsService: ReportsService // Add this line
  ) {}

  ngOnInit() {
    this.DomainName = this.apiService.GetHeader();

    // Get report type from route data
    this.reportType = this.route.snapshot.data['reportType'] || 'student';

    if (this.reportType === 'student') {
      this.loadStudents();
      this.school.reportHeaderOneEn = 'Student Daily Performance Report';
      this.school.reportHeaderOneAr = 'تقرير أداء الطالب اليومي';
    } else {
      this.loadClassrooms();
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

  // In the loadStudents() method, update the error handling:
  loadStudents() {
    this.studentService.GetAll(this.DomainName).subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.students = data.map((student) => ({
            id: student.id,
            name: student.en_name || student.ar_name || 'Unknown',
          }));
        } else {
          // If no students found, add a "No data" option
          this.students = [{ id: -1, name: 'No data available' }];
        }
      },
      (error) => {
        console.error('Error loading students:', error);
        // Add "No data" option on error too
        this.students = [{ id: -1, name: 'No data available' }];
      }
    );
  }

  // In the loadClassrooms() method, update the error handling:
  loadClassrooms() {
    this.classroomService.Get(this.DomainName).subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.classrooms = data.map((classroom) => ({
            id: classroom.id,
            name: classroom.name || 'Unknown',
          }));
        } else {
          // If no classrooms found, add a "No data" option
          this.classrooms = [{ id: -1, name: 'No data available' }];
        }
      },
      (error) => {
        console.error('Error loading classrooms:', error);
        // Add "No data" option on error too
        this.classrooms = [{ id: -1, name: 'No data available' }];
      }
    );
  }

  // Update the DateChange() method to handle the "No data" case:
  DateChange() {
    this.showTable = false;

    // Disable button if "No data" is selected or no valid selection
    const hasValidSelection =
      (this.reportType === 'student' && this.SelectedStudentId > 0) ||
      (this.reportType === 'classroom' && this.SelectedClassroomId > 0);

    if (this.SelectedEndDate && this.SelectedStartDate && hasValidSelection) {
      this.showViewReportBtn = true;
    } else {
      this.showViewReportBtn = false;
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
    // Swal.fire({
    //   title: 'Error',
    //   text: 'Failed to fetch daily performance report data.',
    //   icon: 'error',
    //   confirmButtonText: 'OK',
    // });
    this.showTable = true;
    this.isLoading = false;
  }

  get fileName(): string {
    return this.reportType === 'student'
      ? 'Student Daily Performance Report'
      : 'Classroom Daily Performance Report';
  }

  get studentName(): string {
    const student = this.students.find((s) => s.id == this.SelectedStudentId);
    return student ? student.name : 'Undefined';
  }

  get classroomName(): string {
    const classroom = this.classrooms.find(
      (c) => c.id == this.SelectedClassroomId
    );
    return classroom ? classroom.name : 'Undefined';
  }

  getInfoRows(): any[] {
    if (this.reportType === 'student') {
      return [
        {
          keyEn: 'Student: ' + this.studentName,
          keyAr: 'الطالب: ' + this.studentName,
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
    } else {
      return [
        {
          keyEn: 'Classroom: ' + this.classroomName,
          keyAr: 'الفصل: ' + this.classroomName,
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
    }
  }

  private prepareExportData(): void {
    if (this.reportType === 'student') {
      this.tableDataForExport = this.tableData.map((item) => ({
        Date: item.date,
        'Name': item.englishNameStudent,
        'Ar Name': item.arabicNameStudent,
        'Student ID': item.studentId,
        'Performance Type': item.performanceTypeEn,
        // 'Performance Type AR': item.performanceTypeAr,
        Comment: item.comment || '-',
      }));
    } else {
      this.tableDataForExport = this.tableData.map((item) => ({
        Date: item.date,
        'Avg Score': item.averageScore || '-',
        'Performance Type': item.performanceTypeEn,
        // 'Performance Type AR': item.performanceTypeAr,
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
              // 'Ar Name',
              'Student ID',
              'Performance Type',
              // 'Performance Type AR',
              'Comment',
            ],
            data: this.tableData.map((item) => ({
              Date: item.date,
              'Name': item.englishNameStudent,
              // 'Ar Name': item.arabicNameStudent,
              'Student ID': item.studentId,
              'Performance Type': item.performanceTypeEn,
              // 'Performance Type AR': item.performanceTypeAr,
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
              // 'Performance Type AR',
              'Comment',
            ],
            data: this.tableData.map((item) => ({
              Date: item.date,
              'Avg Score': item.averageScore,
              'Performance Type': item.performanceTypeEn,
              // 'Performance Type AR': item.performanceTypeAr,
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
            // item.arabicNameStudent,
            item.studentId,
            item.performanceTypeEn,
            // item.performanceTypeAr,
            item.comment || '-',
          ];
        } else {
          return [
            item.date,
            item.averageScore || '-',
            item.performanceTypeEn,
            // item.performanceTypeAr,
            item.comment || '-',
          ];
        }
      });

      // Prepare info rows
      const infoRows = [];

      if (this.reportType === 'student') {
        const selectedStudent = this.students.find(
          (s) => s.id == this.SelectedStudentId
        );
        infoRows.push({
          key: 'Student',
          value: selectedStudent?.name || 'All',
        });
      } else {
        const selectedClassroom = this.classrooms.find(
          (c) => c.id == this.SelectedClassroomId
        );
        infoRows.push({
          key: 'Classroom',
          value: selectedClassroom?.name || 'All',
        });
      }

      infoRows.push(
        { key: 'Start Date', value: this.SelectedStartDate },
        { key: 'End Date', value: this.SelectedEndDate },
        { key: 'Generated On', value: new Date().toLocaleDateString() }
      );

      // Prepare headers based on report type
      const headers =
        this.reportType === 'student'
          ? [
              'Date',
              'Name',
              // 'Ar Name',
              'Student ID',
              'Performance Type',
              // 'Performance Type AR',
              'Comment',
            ]
          : [
              'Date',
              'Avg Score',
              'Performance Type',
              // 'Performance Type AR',
              'Comment',
            ];

      // Generate the Excel report using the service
      await this.reportsService.generateExcelReport({
        mainHeader: {
          en:
            this.reportType === 'student'
              ? 'Student Daily Performance Report'
              : 'Classroom Daily Performance Report',
          ar:
            this.reportType === 'student'
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
        // reportImage: this.school.reportImage,
        tables: [
          {
            title:
              this.reportType === 'student'
                ? 'Student Performance Data'
                : 'Classroom Performance Data',
            headers: headers,
            data: tableData,
          },
        ],
        filename: `${
          this.reportType === 'student' ? 'Student' : 'Classroom'
        }_Daily_Performance_Report_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`,
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