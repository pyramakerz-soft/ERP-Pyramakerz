// supplier-statement.component.ts
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx-js-style';
import { Subscription } from 'rxjs';
import { PdfPrintComponent } from '../../../../../../Component/pdf-print/pdf-print.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../../../Services/account.service';
import { ApiService } from '../../../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../../../Services/shared/delete-edit-permission.service';
import { SupplierStatementService } from '../../../../../../Services/Employee/Accounting/supplier-statement.service';
import { LanguageService } from '../../../../../../Services/shared/language.service';
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-supplier-statement',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './supplier-statement.component.html',
  styleUrl: './supplier-statement.component.css',
})
export class SupplierStatementComponent {
  type: string = 'Supplier Statement';
  SubAccountNumber: number | null = null;
  DomainName: string = '';
  SelectedStartDate: string = '';
  SelectedEndDate: string = '';
  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;
  firstPeriodBalance: number = 0;
  fullTotals: any = {};

  showPDF: boolean = false;
  showTable: boolean = false;
  showViewReportBtn: boolean = true;
  DataToPrint: any = null;
  isRtl: boolean = false;
  subscription!: Subscription;
  tableData: any[] = [];
  direction: string = '';

  school = {
    reportHeaderOneEn: 'Supplier Statement Report',
    reportHeaderTwoEn: 'Detailed Supplier Transactions',
    reportHeaderOneAr: 'كشف حساب المورد',
    reportHeaderTwoAr: 'تفاصيل معاملات المورد',
    reportImage: 'assets/images/logo.png',
  };

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    private supplierStatementService: SupplierStatementService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.DomainName = this.ApiServ.GetHeader();
    this.direction = document.dir || 'ltr';

    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  InputChange() {
    this.showTable = false;
    // this.showViewReportBtn = 
    //   this.SelectedStartDate && 
    //   this.SelectedEndDate && 
    //   this.SubAccountNumber !== null;
  }

  async ViewReport() {
    if (this.SelectedStartDate > this.SelectedEndDate) {
      Swal.fire({
        title: 'Invalid Date Range',
        text: 'Start date cannot be later than end date.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
    } else if (this.SubAccountNumber === null) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please enter a Sub Account Number.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
    } else {
      await this.GetData(this.CurrentPage, this.PageSize);
      this.showTable = true;
    }
  }

  GetData(pageNumber: number, pageSize: number) {
    this.tableData = [];
    this.CurrentPage = 1;
    this.TotalPages = 1;
    this.TotalRecords = 0;

    this.supplierStatementService
      .GetSupplierStatement(
        this.SelectedStartDate,
        this.SelectedEndDate,
        this.SubAccountNumber!,
        this.DomainName,
        pageNumber,
        pageSize
      )
      .subscribe(
        (data) => {
          console.log(data);
          this.CurrentPage = data.pagination.currentPage;
          this.PageSize = data.pagination.pageSize;
          this.TotalPages = data.pagination.totalPages;
          this.TotalRecords = data.pagination.totalRecords;
          this.tableData = data.data;
          this.firstPeriodBalance = data.firstPeriodBalance;
          this.fullTotals = data.fullTotals;
        },
        (error) => {
          if (error.status == 404 && this.TotalRecords != 0) {
            let lastPage = Math.ceil(this.TotalRecords / this.PageSize);
            if (lastPage >= 1) {
              this.CurrentPage = lastPage;
              this.GetData(this.CurrentPage, this.PageSize);
            }
          }
        }
      );
  }

  changeCurrentPage(currentPage: number) {
    this.CurrentPage = currentPage;
    this.GetData(this.CurrentPage, this.PageSize);
  }

  validatePageSize(event: any) {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
    }
  }

  validateNumberForPagination(event: any): void {
    const value = event.target.value;
    this.PageSize = 0;
  }

  get visiblePages(): number[] {
    const total = this.TotalPages;
    const current = this.CurrentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = current - half;
    let end = current + half;

    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  getInfoRows(): any[] {
    return [
      {
        keyEn: 'Report Type: ' + this.type,
        keyAr: 'نوع التقرير: ' + this.type,
      },
      {
        keyEn: 'Sub Account Number: ' + this.SubAccountNumber,
        keyAr: 'رقم الحساب الفرعي: ' + this.SubAccountNumber,
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

  getTableDataWithHeader(): any[] {
    return this.DataToPrint.map((item: any) => ({
      header: item.header,
      data: item.summary,
      tableHeaders: item.table.headers,
      tableData: item.table.data,
    }));
  }

  // Print() {
  //   this.DataToPrint = [];
  //   this.GetDataForPrint().subscribe((result) => {
  //     this.DataToPrint = result;
  //     this.showPDF = true;
  //     setTimeout(() => {
  //       const printContents = document.getElementById('Data')?.innerHTML;
  //       if (!printContents) {
  //         console.error('Element not found!');
  //         return;
  //       }

  //       const printStyle = `
  //         <style>
  //           @page { size: auto; margin: 0mm; }
  //           body { margin: 0; }
  //           @media print {
  //             body > *:not(#print-container) { display: none !important; }
  //             #print-container {
  //               display: block !important;
  //               position: static !important;
  //               width: 100% !important;
  //               height: auto !important;
  //               background: white !important;
  //               margin: 0 !important;
  //             }
  //           }
  //         </style>
  //       `;

  //       const printContainer = document.createElement('div');
  //       printContainer.id = 'print-container';
  //       printContainer.innerHTML = printStyle + printContents;

  //       document.body.appendChild(printContainer);
  //       window.print();

  //       setTimeout(() => {
  //         document.body.removeChild(printContainer);
  //         this.showPDF = false;
  //       }, 100);
  //     }, 500);
  //   });
  // }

  // DownloadAsPDF() {
  //   this.DataToPrint = [];
  //   this.GetDataForPrint().subscribe((result) => {
  //     this.DataToPrint = result;
  //     this.showPDF = true;
  //     setTimeout(() => {
  //       this.pdfComponentRef.downloadPDF();
  //       setTimeout(() => (this.showPDF = false), 2000);
  //     }, 500);
  //   });
  // }

  // GetDataForPrint(): Observable<any[]> {
  //   return this.supplierStatementService
  //     .GetSupplierStatement(
  //       this.SelectedStartDate,
  //       this.SelectedEndDate,
  //       this.SubAccountNumber!,
  //       this.DomainName,
  //       1,
  //       this.TotalRecords
  //     )
  //     .pipe(
  //       map((data) => {
  //         // Add opening balance as first row
  //         const openingBalanceRow = {
  //           masterID: 0,
  //           detailsID: 0,
  //           account: 'Opening Balance',
  //           serial: 0,
  //           mainAccountNo: 0,
  //           mainAccount: '',
  //           subAccountNo: 0,
  //           subAccount: '',
  //           debit: 0,
  //           credit: 0,
  //           date: this.SelectedStartDate,
  //           balance: data.firstPeriodBalance,
  //           linkFileID: 0,
  //           notes: ''
  //         };

  //         const allData = [openingBalanceRow, ...data.data];

  //         return [{
  //           header: `Supplier Statement - Sub Account ${this.SubAccountNumber}`,
  //           summary: [
  //             { key: 'Sub Account Number', value: this.SubAccountNumber },
  //             { key: 'Start Date', value: this.SelectedStartDate },
  //             { key: 'End Date', value: this.SelectedEndDate },
  //             { key: 'Opening Balance', value: data.firstPeriodBalance },
  //             { key: 'Total Debit', value: data.fullTotals.totalDebit },
  //             { key: 'Total Credit', value: data.fullTotals.totalCredit },
  //             { key: 'Difference', value: data.fullTotals.difference },
  //           ],
  //           table: {
  //             headers: [
  //               'Serial',
  //               'Date',
  //               'Account',
  //               'Main Account',
  //               'Sub Account',
  //               'Debit',
  //               'Credit',
  //               'Balance',
  //               'Notes'
  //             ],
  //             data: allData.map((item: any) => ({
  //               Serial: item.serial,
  //               Date: item.date,
  //               Account: item.account,
  //               'Main Account': item.mainAccount,
  //               'Sub Account': item.subAccount,
  //               Debit: item.debit,
  //               Credit: item.credit,
  //               Balance: item.balance,
  //               Notes: item.notes || 'N/A'
  //             }))
  //           }
  //         }];
  //       }),
  //       catchError((error) => {
  //         if (error.status === 404) {
  //           return of([]);
  //         }
  //         throw error;
  //       })
  //     );
  // }

  // DownloadAsExcel() {
  //   this.GetDataForPrint().subscribe((result) => {
  //     if (!result || result.length === 0) {
  //       Swal.fire({
  //         title: 'No Data',
  //         text: 'No data available for export.',
  //         icon: 'info',
  //         confirmButtonText: 'OK',
  //       });
  //       return;
  //     }

  //     const exportData = Array.isArray(result) ? result : [];
  //     const excelData: any[] = [];

  //     // Add report title with styling
  //     excelData.push([
  //       {
  //         v: `${this.type.toUpperCase()} REPORT DETAILED`,
  //         s: {
  //           font: { bold: true, sz: 16 },
  //           alignment: { horizontal: 'center' },
  //         },
  //       },
  //     ]);
  //     excelData.push([]); // empty row

  //     // Add filter information with styling
  //     excelData.push([
  //       { v: 'Sub Account Number:', s: { font: { bold: true } } },
  //       { v: this.SubAccountNumber, s: { font: { bold: true } } },
  //     ]);
  //     excelData.push([
  //       { v: 'Start Date:', s: { font: { bold: true } } },
  //       { v: this.SelectedStartDate, s: { font: { bold: true } } },
  //     ]);
  //     excelData.push([
  //       { v: 'End Date:', s: { font: { bold: true } } },
  //       { v: this.SelectedEndDate, s: { font: { bold: true } } },
  //     ]);
  //     excelData.push([
  //       { v: 'Opening Balance:', s: { font: { bold: true } } },
  //       { v: this.firstPeriodBalance, s: { font: { bold: true } } },
  //     ]);
  //     excelData.push([]); // empty row

  //     // Add each section
  //     exportData.forEach((section: any, sectionIdx: number) => {
  //       // Section header
  //       excelData.push([
  //         {
  //           v: section.header,
  //           s: {
  //             font: { bold: true, color: { rgb: 'FFFFFF' } },
  //             fill: { fgColor: { rgb: '4472C4' } },
  //           },
  //         },
  //       ]);

  //       // Section summary/details
  //       section.summary.forEach((row: any, i: number) => {
  //         excelData.push([
  //           {
  //             v: row.key,
  //             s: {
  //               font: { bold: true },
  //               fill: { fgColor: { rgb: i % 2 === 0 ? 'D9E1F2' : 'FFFFFF' } },
  //             },
  //           },
  //           {
  //             v: row.value,
  //             s: {
  //               fill: { fgColor: { rgb: i % 2 === 0 ? 'D9E1F2' : 'FFFFFF' } },
  //             },
  //           },
  //         ]);
  //       });

  //       excelData.push([]); // empty row

  //       // Table headers
  //       excelData.push(
  //         section.table.headers.map((header: string) => ({
  //           v: header,
  //           s: {
  //             font: { bold: true },
  //             fill: { fgColor: { rgb: '4472C4' } },
  //             color: { rgb: 'FFFFFF' },
  //             border: {
  //               top: { style: 'thin' },
  //               bottom: { style: 'thin' },
  //               left: { style: 'thin' },
  //               right: { style: 'thin' },
  //             },
  //           },
  //         }))
  //       );

  //       // Table rows
  //       if (section.table.data && section.table.data.length > 0) {
  //         section.table.data.forEach((row: any, i: number) => {
  //           excelData.push(
  //             section.table.headers.map((header: string) => ({
  //               v: row[header],
  //               s: {
  //                 fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } },
  //                 border: { left: { style: 'thin' }, right: { style: 'thin' } },
  //               },
  //             }))
  //           );
  //         });
  //       } else {
  //         excelData.push([
  //           {
  //             v: 'No items found',
  //             s: {
  //               font: { italic: true },
  //               alignment: { horizontal: 'center' },
  //             },
  //             colSpan: section.table.headers.length,
  //           },
  //         ]);
  //       }

  //       excelData.push([]); // empty row for spacing between sections
  //     });

  //     // Create worksheet
  //     const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  //     // Merge cells for headers and special cells
  //     if (!worksheet['!merges']) worksheet['!merges'] = [];
  //     worksheet['!merges'].push({
  //       s: { r: 0, c: 0 },
  //       e: { r: 0, c: (exportData[0]?.table?.headers?.length || 9) - 1 },
  //     });

  //     // Apply column widths
  //     worksheet['!cols'] = Array(exportData[0]?.table?.headers?.length || 9).fill({ wch: 18 });

  //     // Create workbook and save
  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Supplier Statement');

  //     const dateStr = new Date().toISOString().slice(0, 10);
  //     XLSX.writeFile(workbook, `Supplier_Statement_${dateStr}.xlsx`);
  //   });
  // }
}