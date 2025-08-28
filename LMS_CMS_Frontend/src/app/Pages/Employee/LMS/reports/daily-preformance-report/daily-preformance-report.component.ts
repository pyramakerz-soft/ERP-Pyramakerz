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

@Component({
  selector: 'app-daily-preformance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './daily-preformance-report.component.html',
  styleUrl: './daily-preformance-report.component.css'
})
export class DailyPreformanceReportComponent implements OnInit, OnDestroy {  DomainName: string = '';
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
    private route: ActivatedRoute // Add route
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

  loadStudents() {
    this.studentService.GetAll(this.DomainName).subscribe(
      (data) => {
        this.students = data.map(student => ({
          id: student.id,
          name: student.en_name || student.ar_name || 'Unknown'
        }));
      },
      (error) => {
        console.error('Error loading students:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load students.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }

  loadClassrooms() {
    this.classroomService.Get(this.DomainName).subscribe(
      (data) => {
        this.classrooms = data.map(classroom => ({
          id: classroom.id,
          name: classroom.name || 'Unknown'
        }));
      },
      (error) => {
        console.error('Error loading classrooms:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load classrooms.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }

  DateChange() {
    this.showTable = false;

    if (this.reportType === 'student') {
      if (this.SelectedEndDate && this.SelectedStartDate && this.SelectedStudentId) {
        this.showViewReportBtn = true;
      } else {
        this.showViewReportBtn = false;
      }
    } else {
      if (this.SelectedEndDate && this.SelectedStartDate && this.SelectedClassroomId) {
        this.showViewReportBtn = true;
      } else {
        this.showViewReportBtn = false;
      }
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
    Swal.fire({
      title: 'Error',
      text: 'Failed to fetch daily performance report data.',
      icon: 'error',
      confirmButtonText: 'OK',
    });
    this.showTable = true;
    this.isLoading = false;
  }

  get fileName(): string {
    return this.reportType === 'student' 
      ? 'Student Daily Performance Report' 
      : 'Classroom Daily Performance Report';
  }

  get studentName(): string {
    const student = this.students.find(s => s.id == this.SelectedStudentId);
    return student ? student.name : 'Undefined';    
  }

  get classroomName(): string {
    const classroom = this.classrooms.find(c => c.id == this.SelectedClassroomId);
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
      'Date': item.date,
      'En Name': item.englishNameStudent,
      'Ar Name': item.arabicNameStudent,
      'Student ID': item.studentId,
      'Performance Type': item.performanceTypeEn,
      'Performance Type AR': item.performanceTypeAr,
      'Comment': item.comment || 'N/A',
    }));
  } else {
    this.tableDataForExport = this.tableData.map((item) => ({
      'Date': item.date,
      'Avg Score': item.averageScore || 'N/A',
      'Performance Type': item.performanceTypeEn,
      'Performance Type AR': item.performanceTypeAr,
      'Comment': item.comment || 'N/A',
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
            'Ar Name',
            'Ar Name',
            'Student ID',
            'Performance Type',
            'Performance Type AR',
            'Comment',
          ],
          data: this.tableData.map((item) => ({
            Date: item.date,
            'En Name': item.englishNameStudent,
            'Ar Name': item.arabicNameStudent,
            'Student ID': item.studentId,
            'Performance Type': item.performanceTypeEn,
            'Performance Type AR': item.performanceTypeAr,
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
            'Performance Type AR',
            'Comment',
          ],
          data: this.tableData.map((item) => ({
            Date: item.date,
            'Avg Score': item.averageScore,
            'Performance Type': item.performanceTypeEn,
            'Performance Type AR': item.performanceTypeAr,
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

DownloadAsExcel() {
  if (!this.tableData || this.tableData.length === 0) {
    Swal.fire({
      title: 'No Data',
      text: 'No data available for export.',
      icon: 'info',
      confirmButtonText: 'OK',
    });
    return;
  }

  const excelData: any[] = [];

  // Add report title with styling
  excelData.push([
    {
      v: this.reportType === 'student' ? 'STUDENT DAILY PERFORMANCE REPORT' : 'CLASSROOM DAILY PERFORMANCE REPORT',
      s: {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'center' },
      },
    },
  ]);
  excelData.push([]); // empty row

  // Add filter information with styling
  if (this.reportType === 'student') {
    const selectedStudent = this.students.find(s => s.id == this.SelectedStudentId);
    excelData.push([
      { v: 'Student:', s: { font: { bold: true } } },
      { v: selectedStudent?.name || 'All', s: { font: { bold: true } } },
    ]);
  } else {
    const selectedClassroom = this.classrooms.find(c => c.id == this.SelectedClassroomId);
    excelData.push([
      { v: 'Classroom:', s: { font: { bold: true } } },
      { v: selectedClassroom?.name || 'All', s: { font: { bold: true } } },
    ]);
  }
  
  excelData.push([
    { v: 'Start Date:', s: { font: { bold: true } } },
    { v: this.SelectedStartDate, s: { font: { bold: true } } },
  ]);
  excelData.push([
    { v: 'End Date:', s: { font: { bold: true } } },
    { v: this.SelectedEndDate, s: { font: { bold: true } } },
  ]);
  excelData.push([]); // empty row

  // Table headers
  let headers: string[] = [];
  if (this.reportType === 'student') {
    headers = [
      'Date',
      'En Name',
      'Ar Name',
      'Student ID',
      'Performance Type',
      'Performance Type AR',
      'Comment',
    ];
  } else {
    headers = [
      'Date',
      'Avg Score',
      'Performance Type',
      'Performance Type AR',
      'Comment',
    ];
  }
  
  excelData.push(
    headers.map((header) => ({
      v: header,
      s: {
        font: { bold: true },
        fill: { fgColor: { rgb: '4472C4' } },
        color: { rgb: 'FFFFFF' },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        },
      },
    }))
  );

  // Table rows
  if (this.tableData && this.tableData.length > 0) {
    this.tableData.forEach((row, i) => {
      if (this.reportType === 'student') {
        excelData.push([
          { v: row.date, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.englishNameStudent, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.arabicNameStudent, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.studentId, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.performanceTypeEn, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.performanceTypeAr, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.comment || 'N/A', s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
        ]);
      } else {
        excelData.push([
          { v: row.date, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.averageScore || 'N/A', s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.performanceTypeEn, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.performanceTypeAr, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.comment || 'N/A', s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
        ]);
      }
    });
  } else {
    excelData.push([
      {
        v: 'No daily performance records found for the selected criteria',
        s: {
          font: { italic: true },
          alignment: { horizontal: 'center' },
        },
        colSpan: headers.length,
      },
    ]);
  }

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  // Merge cells for headers
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({
    s: { r: 0, c: 0 },
    e: { r: 0, c: headers.length - 1 },
  });

  // Apply column widths
  if (this.reportType === 'student') {
    worksheet['!cols'] = [
      { wch: 15 }, // Date
      { wch: 20 }, // En Name
      { wch: 20 }, // Ar Name
      { wch: 10 }, // Student ID
      { wch: 20 }, // Performance Type
      { wch: 20 }, // Performance Type AR
      { wch: 30 }, // Comment
    ];
  } else {
    worksheet['!cols'] = [
      { wch: 15 }, // Date
      { wch: 20 }, // Avg Score
      { wch: 20 }, // Performance Type
      { wch: 20 }, // Performance Type AR
      { wch: 30 }, // Comment
    ];
  }

  // Create workbook and save
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Performance Report');

  const dateStr = new Date().toISOString().slice(0, 10);
  const reportTypeStr = this.reportType === 'student' ? 'Student' : 'Classroom';
  XLSX.writeFile(workbook, `${reportTypeStr}_Daily_Performance_Report_${dateStr}.xlsx`);
}
}