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

@Component({
  selector: 'app-daily-preformance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './daily-preformance-report.component.html',
  styleUrl: './daily-preformance-report.component.css'
})
export class DailyPreformanceReportComponent implements OnInit, OnDestroy {
  DomainName: string = '';
  SelectedStudentId: number = 0;
  SelectedStartDate: string = '';
  SelectedEndDate: string = '';

  showTable: boolean = false;
  showViewReportBtn: boolean = false;
  showPDF: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  tableData: any[] = [];
  tableDataForExport: any[] = [];
  students: any[] = [];
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
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService,
  ) {}

  ngOnInit() {
    this.DomainName = this.apiService.GetHeader();
    this.loadStudents();

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

  DateChange() {
    this.showTable = false;

    if (this.SelectedEndDate && this.SelectedStartDate && this.SelectedStudentId) {
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

    this.dailyPerformanceService
      .GetDailyPerformanceReport(
        this.SelectedStudentId,
        this.SelectedStartDate,
        this.SelectedEndDate,
        this.DomainName
      )
      .subscribe(
        (data) => {
          this.tableData = data;
          this.prepareExportData();
          this.showTable = true;
          this.isLoading = false;
        },
        (error) => {
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
      );
  }

  get fileName(): string {
    return 'Daily Performance Report';
  }

  get studentName(): string {
    const student = this.students.find(s => s.id == this.SelectedStudentId);
    return student ? student.name : 'Undefined';    
  }

  getInfoRows(): any[] {
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
  }

  private prepareExportData(): void {
    this.tableDataForExport = this.tableData.map((item) => ({
      'Date': item.date,
      'English Name': item.englishNameStudent,
      'Arabic Name': item.arabicNameStudent,
      'Student ID': item.studentId,
      'Performance Type (EN)': item.performanceTypeEn,
      'Performance Type (AR)': item.performanceTypeAr,
      'Comment': item.comment || 'N/A',
    }));
  }

  getTableDataWithHeader(): any[] {
    return [
      {
        header: 'Daily Performance Report',
        summary: this.getInfoRows(),
        table: {
          headers: [
            'Date',
            'English Name',
            'Arabic Name',
            'Student ID',
            'Performance Type (EN)',
            'Performance Type (AR)',
            'Comment',
          ],
          data: this.tableData.map((item) => ({
            Date: item.date,
            'English Name': item.englishNameStudent,
            'Arabic Name': item.arabicNameStudent,
            'Student ID': item.studentId,
            'Performance Type (EN)': item.performanceTypeEn,
            'Performance Type (AR)': item.performanceTypeAr,
            Comment: item.comment,
          })),
        },
      },
    ];
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
        v: 'DAILY PERFORMANCE REPORT',
        s: {
          font: { bold: true, sz: 16 },
          alignment: { horizontal: 'center' },
        },
      },
    ]);
    excelData.push([]); // empty row

    // Add filter information with styling
    const selectedStudent = this.students.find(s => s.id == this.SelectedStudentId);

    excelData.push([
      { v: 'Student:', s: { font: { bold: true } } },
      { v: selectedStudent?.name || 'All', s: { font: { bold: true } } },
    ]);
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
    const headers = [
      'Date',
      'English Name',
      'Arabic Name',
      'Student ID',
      'Performance Type (EN)',
      'Performance Type (AR)',
      'Comment',
    ];
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
        excelData.push([
          { v: row.date, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.englishNameStudent, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.arabicNameStudent, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.studentId, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.performanceTypeEn, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.performanceTypeAr, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
          { v: row.comment || 'N/A', s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } } },
        ]);
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
    worksheet['!cols'] = [
      { wch: 15 }, // Date
      { wch: 20 }, // English Name
      { wch: 20 }, // Arabic Name
      { wch: 10 }, // Student ID
      { wch: 20 }, // Performance Type (EN)
      { wch: 20 }, // Performance Type (AR)
      { wch: 30 }, // Comment
    ];

    // Create workbook and save
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Performance Report');

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Daily_Performance_Report_${dateStr}.xlsx`);
  }
}