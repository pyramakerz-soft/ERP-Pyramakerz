import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ViolationReport } from '../../../../../Models/Violation/violation-report';
import { EmployeeTypeGet } from '../../../../../Models/Administrator/employee-type-get';
import { ViolationType } from '../../../../../Models/Violation/violation-type';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { ViolationService } from '../../../../../Services/Employee/Violation/violation.service';
import { EmployeeTypeService } from '../../../../../Services/Employee/employee-type.service';
import { ViolationTypeService } from '../../../../../Services/Employee/Violation/violation-type.service';
import { ApiService } from '../../../../../Services/api.service';
import { AccountService } from '../../../../../Services/account.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import * as XLSX from 'xlsx-js-style';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';


@Component({
  selector: 'app-violation-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './violation-report.component.html',
  styleUrl: './violation-report.component.css',
})
export class ViolationReportComponent {
  DomainName: string = '';
  SelectedEmployeeTypeId: number = 0;
  SelectedViolationTypeId: number = 0;
  SelectedStartDate: string = '';
  SelectedEndDate: string = '';

  showTable: boolean = false;
  showViewReportBtn: boolean = false;
  showPDF: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  tableData: ViolationReport[] = [];
  DataToPrint: any = null;

  empTypes: EmployeeTypeGet[] = [];
  violationTypes: ViolationType[] = [];
    tableDataForExport: any[] = []; // Added for PDF export

  school = {
    reportHeaderOneEn: 'Violation Report',
    reportHeaderTwoEn: 'Detailed Violation Summary',
    reportHeaderOneAr: 'تقرير المخالفات',
    reportHeaderTwoAr: 'ملخص المخالفات التفصيلي',
    reportImage: 'assets/images/logo.png',
  };

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  constructor(
    public violationService: ViolationService,
    public employeeTypeService: EmployeeTypeService,
    public violationTypeService: ViolationTypeService,
    public apiService: ApiService,
    public accountService: AccountService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService,
  ) {}

  ngOnInit() {
    this.DomainName = this.apiService.GetHeader();
    this.GetEmployeeTypes();

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

  GetEmployeeTypes() {
    this.employeeTypeService.Get(this.DomainName).subscribe((data) => {
      this.empTypes = data;
    });
  }

  GetViolationTypes() {
    if (this.SelectedEmployeeTypeId) {
      this.violationTypeService
        .GetByEmployeeType(this.SelectedEmployeeTypeId, this.DomainName)
        .subscribe((data) => {
          this.violationTypes = data;
          this.SelectedViolationTypeId = 0;
        });
    } else {
      this.violationTypes = [];
      this.SelectedViolationTypeId = 0;
    }
    this.DateChange();
  }

  DateChange() {
    this.showTable = false;

    if (
      this.SelectedEndDate &&
      this.SelectedStartDate &&
      this.SelectedEmployeeTypeId
    ) {
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
      this.showTable = true;
    }
  }

  GetData() {
    this.tableData = [];

    this.violationService
      .GetViolationReport(
        this.SelectedEmployeeTypeId,
        this.SelectedViolationTypeId,
        this.SelectedStartDate,
        this.SelectedEndDate,
        this.DomainName
      )
      .subscribe(
        (data) => {
          this.tableData = data;
          this.prepareExportData(); // Prepare data for export
          this.showTable = true;
        },
        (error) => {
          console.error('Error fetching violation report:', error);
          Swal.fire({
            title: 'Error',
            text: 'Failed to fetch violation report data.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          this.showTable = true;
        }
      );
  }
  get fileName(): string {
    return 'Violation Report';
  }

  getInfoRows(): any[] {
    const selectedEmpType = this.empTypes.find(
      (e) => e.id == this.SelectedEmployeeTypeId
    );
    const selectedViolationType = this.violationTypes.find(
      (v) => v.id == this.SelectedViolationTypeId
    );

    return [
      {
        keyEn: 'Employee Type: ' + (selectedEmpType?.name),
        keyAr: 'نوع الموظف: ' + (selectedEmpType?.name ),
      },
      {
        keyEn: 'Violation Type: ' + (selectedViolationType?.name),
        keyAr: 'نوع المخالفة: ' + (selectedViolationType?.name),
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
      'ID': item.id,
      'Date': item.date,
      'Violation Type': item.violationType,
      'Employee Type': item.employeeType,
      'Employee Name': item.employeeName,
      'Details': item.details || 'N/A',
    }));
  }

  getSelectedEmployeeTypeName(): string {
    return this.empTypes.find(e => e.id === this.SelectedEmployeeTypeId)?.name || 'All';
  }

  getSelectedViolationTypeName(): string {
    return this.violationTypes.find(v => v.id === this.SelectedViolationTypeId)?.name || 'All';
  }


  getTableDataWithHeader(): any[] {
    return [
      {
        header: 'Violation Report',
        summary: this.getInfoRows(),
        table: {
          headers: [
            'ID',
            'Date',
            'Violation Type',
            'Employee Type',
            'Employee Name',
            'Details',
          ],
          data: this.tableData.map((item) => ({
            ID: item.id,
            Date: item.date,
            'Violation Type': item.violationType,
            'Employee Type': item.employeeType,
            'Employee Name': item.employeeName,
            Details: item.details,
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
        v: 'VIOLATION REPORT DETAILED',
        s: {
          font: { bold: true, sz: 16 },
          alignment: { horizontal: 'center' },
        },
      },
    ]);
    excelData.push([]); // empty row

    // Add filter information with styling
    const selectedEmpType = this.empTypes.find(
      (e) => e.id === this.SelectedEmployeeTypeId
    );
    const selectedViolationType = this.violationTypes.find(
      (v) => v.id === this.SelectedViolationTypeId
    );

    excelData.push([
      { v: 'Employee Type:', s: { font: { bold: true } } },
      { v: selectedEmpType?.name || 'All', s: { font: { bold: true } } },
    ]);
    excelData.push([
      { v: 'Violation Type:', s: { font: { bold: true } } },
      { v: selectedViolationType?.name || 'All', s: { font: { bold: true } } },
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
      'ID',
      'Date',
      'Violation Type',
      'Employee Type',
      'Employee Name',
      'Details',
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
        excelData.push(
          headers.map((header) => ({
            v:
              row[
                header.toLowerCase().replace(' ', '') as keyof ViolationReport
              ] || '',
            s: {
              fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } },
              border: { left: { style: 'thin' }, right: { style: 'thin' } },
            },
          }))
        );
      });
    } else {
      excelData.push([
        {
          v: 'No violations found for the selected criteria',
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
    worksheet['!cols'] = Array(headers.length).fill({ wch: 20 });

    // Create workbook and save
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Violation Report');

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Violation_Report_${dateStr}.xlsx`);
  }
}