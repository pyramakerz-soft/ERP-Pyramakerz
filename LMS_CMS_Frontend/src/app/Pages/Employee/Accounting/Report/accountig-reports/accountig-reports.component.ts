import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { ReportsService } from '../../../../../Services/Employee/Accounting/reports.service';
import { ReportsService as SharedReportsService } from '../../../../../Services/shared/reports.service';
import { Payable } from '../../../../../Models/Accounting/payable';
import { DeleteEditPermissionService } from '../../../../../Services/shared/delete-edit-permission.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../../Services/account.service';
import { ApiService } from '../../../../../Services/api.service';
// import Swal from 'sweetalert2';
import { catchError, map, Observable, of } from 'rxjs';
import { BankService } from '../../../../../Services/Employee/Accounting/bank.service';
import { SaveService } from '../../../../../Services/Employee/Accounting/save.service'; 
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs'; 
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../../Services/loading.service';

@Component({
  selector: 'app-accountig-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './accountig-reports.component.html',
  styleUrl: './accountig-reports.component.css',
})

@InitLoader()
export class AccountigReportsComponent {
  type: string = '';

  DomainName: string = '';
  SelectedStartDate: string = '';
  SelectedEndDate: string = '';
  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;

  showPDF: boolean = false;
  showTable: boolean = false;
  showViewReportBtn: boolean = false;
  DataToPrint: any = null;
  isRtl: boolean = false;
  subscription!: Subscription;
  tableData: any[] = [];
  direction: string = '';
  isLoading: boolean = false;

  school = {
    reportHeaderOneEn: 'Accounting Report',
    reportHeaderTwoEn: 'Detailed Transaction Summary',
    reportHeaderOneAr: 'تقرير المحاسبة',
    reportHeaderTwoAr: 'ملخص المعاملات التفصيلي',
     
  };

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  collapsedItems: Set<number> = new Set();

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    public reportsService: ReportsService,
    public sharedReportsService: SharedReportsService,
    private router: Router,
    public bankService: BankService,
    public saveService: SaveService,
    private languageService: LanguageService, 
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;
    if (currentUrl.includes('Receivable')) {
      this.type = 'Receivable';
    } else if (currentUrl.includes('Payable')) {
      this.type = 'Payable';
    } else if (currentUrl.includes('Installment')) {
      this.type = 'Installment Deduction';
    } else if (currentUrl.includes('Accounting')) {
      this.type = 'Accounting Entries';
    }

    this.DomainName = this.ApiServ.GetHeader();
    this.direction = document.dir || 'ltr';

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
      await this.GetData(this.CurrentPage, this.PageSize);
      this.showTable = true;
    }
  }

  DateChange() {
    this.showTable = false;

    if (this.SelectedEndDate != '' && this.SelectedStartDate != '') {
      this.showViewReportBtn = true;
    } else {
      this.showViewReportBtn = false;
    }
  }

GetData(pageNumber: number, pageSize: number) {
  this.isLoading = true; // Start loading
  this.tableData = [];
  this.CurrentPage = 1;
  this.TotalPages = 1;
  this.TotalRecords = 0;

  let dataObservable;

  switch (this.type) {
    case 'Payable':
      dataObservable = this.reportsService.GetPayablesByDate(
        this.SelectedStartDate,
        this.SelectedEndDate,
        this.DomainName,
        pageNumber,
        pageSize
      );
      break;

    case 'Receivable':
      dataObservable = this.reportsService.GetReceivablesByDate(
        this.SelectedStartDate,
        this.SelectedEndDate,
        this.DomainName,
        pageNumber,
        pageSize
      );
      break;

    case 'Installment Deduction':
      dataObservable = this.reportsService.GetInstallmentDeductionsByDate(
        this.SelectedStartDate,
        this.SelectedEndDate,
        this.DomainName,
        pageNumber,
        pageSize
      );
      break;

    case 'Accounting Entries':
      dataObservable = this.reportsService.GetAccountingEntriesByDate(
        this.SelectedStartDate,
        this.SelectedEndDate,
        this.DomainName,
        pageNumber,
        pageSize
      );
      break;

    default:
      console.error('Unknown report type:', this.type);
      this.isLoading = false; // End loading on error
      return;
  }

  dataObservable.subscribe(
    (data) => {
      this.CurrentPage = data.pagination.currentPage;
      this.PageSize = data.pagination.pageSize;
      this.TotalPages = data.pagination.totalPages;
      this.TotalRecords = data.pagination.totalRecords;
      this.tableData = data.data;
      let count = 0;
      this.tableData.forEach((element) => {
        this.collapsedItems.add(count);
        count++;
      });
      this.isLoading = false; // End loading
    },
    (error) => {
      this.isLoading = false; // End loading even on error
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

  toggleCollapse(index: number) {
    if (this.collapsedItems.has(index)) {
      this.collapsedItems.delete(index);
    } else {
      this.collapsedItems.add(index);
    }
  }

  getDetails(data: any): any[] {
    if (this.type === 'Payable') {
      return data.payableDetails || [];
    } else if (this.type === 'Receivable') {
      return data.receivableDetails || [];
    } else if (this.type === 'Installment Deduction') {
      return data.installmentDeductionDetails || [];
    } else if (this.type === 'Accounting Entries') {
      return data.accountingEntriesDetails || [];
    }
    return [];
  }

  get fileName(): string {
    switch (this.type) {
      case 'Payable':
        return 'Payable Report';
      case 'Receivable':
        return 'Receivable Report';
      case 'Installment Deduction':
        return 'Installment Deduction Report';
      case 'Accounting Entries':
        return 'Accounting Entries Report';
      default:
        return 'Accounting Report';
    }
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

  Print() {
    this.DataToPrint = [];

    this.GetDataForPrint().subscribe((result) => {
      this.DataToPrint = result;
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
    });
  }

  DownloadAsPDF() {
    this.DataToPrint = [];

    this.GetDataForPrint().subscribe((result) => {
      this.DataToPrint = result;

      this.showPDF = true;

      setTimeout(() => {
        this.pdfComponentRef.downloadPDF();
        setTimeout(() => (this.showPDF = false), 2000);
      }, 500);
    });
  }

  GetDataForPrint(): Observable<any[]> {
    switch (this.type) {
      case 'Payable':
        return this.reportsService
          .GetPayablesByDate(
            this.SelectedStartDate,
            this.SelectedEndDate,
            this.DomainName,
            1,
            this.TotalRecords
          )
          .pipe(
            map((data) => {
              return data.data.map((t: any) => ({
                header: `${this.type} Invoice ${t.id}`,
                summary: [
                  { key: 'Doc Type', value: t.payableDocTypesName },
                  { key: 'Doc Number', value: t.docNumber },
                  { key: 'Date', value: t.date },
                  { key: 'Bank Or Save ?', value: t.linkFileName },
                  { key: 'Bank Or Save Data', value: t.bankOrSaveName },
                  { key: 'Notes', value: t.notes || '-' },
                ],
                table: {
                  headers: ['ID', 'Amount', 'Link File', 'Link File Type'],
                  data:
                    t.payableDetails?.map((d: any) => ({
                      ID: d.id,
                      Amount: d.amount,
                      'Link File': d.linkFileName,
                      'Link File Type': d.linkFileTypeName,
                    })) || [],
                },
              }));
            }),
            catchError((error) => {
              if (error.status === 404) {
                return of([]);
              }
              throw error;
            })
          );
      case 'Receivable':
        return this.reportsService
          .GetReceivablesByDate(
            this.SelectedStartDate,
            this.SelectedEndDate,
            this.DomainName,
            1,
            this.TotalRecords
          )
          .pipe(
            map((data) => {
              return data.data.map((t: any) => ({
                header: `${this.type} Invoice ${t.id}`,
                summary: [
                  { key: 'Doc Type', value: t.receivableDocTypesName },
                  { key: 'Doc Number', value: t.docNumber },
                  { key: 'Date', value: t.date },
                  { key: 'Bank Or Save ?', value: t.linkFileName },
                  { key: 'Bank Or Save Data', value: t.bankOrSaveName },
                  { key: 'Notes', value: t.notes || '-' },
                ],
                table: {
                  headers: ['ID', 'Amount', 'Link File', 'Link File Type'],
                  data:
                    t.receivableDetails?.map((d: any) => ({
                      ID: d.id,
                      Amount: d.amount,
                      'Link File': d.linkFileName,
                      'Link File Type': d.linkFileTypeName,
                    })) || [],
                },
              }));
            }),
            catchError((error) => {
              if (error.status === 404) {
                return of([]);
              }
              throw error;
            })
          );
      case 'Installment Deduction':
        return this.reportsService
          .GetInstallmentDeductionsByDate(
            this.SelectedStartDate,
            this.SelectedEndDate,
            this.DomainName,
            1,
            this.TotalRecords
          )
          .pipe(
            map((data) => {
              return data.data.map((t: any) => ({
                header: `${this.type} Invoice ${t.id}`,
                summary: [
                  { key: 'Doc Number', value: t.docNumber },
                  { key: 'Date', value: t.date },
                  { key: 'Employee Name', value: t.employeeName },
                  { key: 'Student  Name', value: t.studentName },
                  { key: 'Notes', value: t.notes || '-' },
                ],
                table: {
                  headers: ['ID', 'Amount', 'Date', 'Fee Type'],
                  data:
                    t.installmentDeductionDetails?.map((d: any) => ({
                      ID: d.id,
                      Amount: d.amount,
                      Date: d.date,
                      'Fee Type': d.feeTypeName,
                    })) || [],
                },
              }));
            }),
            catchError((error) => {
              if (error.status === 404) {
                return of([]);
              }
              throw error;
            })
          );
      case 'Accounting Entries':
        return this.reportsService
          .GetAccountingEntriesByDate(
            this.SelectedStartDate,
            this.SelectedEndDate,
            this.DomainName,
            1,
            this.TotalRecords
          )
          .pipe(
            map((data) => {
              return data.data.map((t: any) => ({
                header: `${this.type} Invoice ${t.id}`,
                summary: [
                  { key: 'Doc Type', value: t.accountingEntriesDocTypeName },
                  { key: 'Doc Number', value: t.docNumber },
                  { key: 'Date', value: t.date },
                  { key: 'Notes', value: t.notes || '-' },
                ],
                table: {
                  headers: [
                    'ID',
                    'Credit Amount',
                    'Debit Amount',
                    'Accounting Tree Chart',
                    'Sub Accounting',
                  ],
                  data:
                    t.accountingEntriesDetails?.map((d: any) => ({
                      ID: d.id,
                      'Credit Amount': d.creditAmount,
                      'Debit Amount': d.debitAmount,
                      'Accounting Tree Chart': d.accountingTreeChartName,
                      'Sub Accounting': d.subAccountingName,
                    })) || [],
                },
              }));
            }),
            catchError((error) => {
              if (error.status === 404) {
                return of([]);
              }
              throw error;
            })
          );
    }
    return of([]);
  }

async DownloadAsExcel() {
  try {
    // Get the data for export
    const exportData = await this.GetDataForPrint().toPromise();
    
    if (!exportData || exportData.length === 0) {
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        title: 'No Data',
        text: 'No data available for export.',
        icon: 'info',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Prepare tables for the Excel report
    const tables = exportData.map((section: any, index: number) => {
      // Create table data
      const tableData = section.table.data.map((row: any) => {
        return section.table.headers.map((header: string) => {
          // Handle different data types appropriately
          const value = row[header];
          if (header.toLowerCase().includes('amount') || header.toLowerCase().includes('id')) {
            return isNaN(Number(value)) ? 0 : Number(value);
          }
          return value || '';
        });
      });

      return {
        title: section.header,
        headers: section.table.headers,
        data: tableData
      };
    });

    // Prepare info rows
    const infoRows = [
      { key: 'Report Type', value: this.type },
      { key: 'Start Date', value: this.SelectedStartDate },
      { key: 'End Date', value: this.SelectedEndDate },
      { key: 'Total Records', value: this.TotalRecords },
      { key: 'Generated On', value: new Date().toLocaleDateString() }
    ];

    // Add section summaries as additional info
    if (exportData.length > 0) {
      infoRows.push({ key: 'Number of Invoices', value: exportData.length });
    }

    // Generate the Excel report using the shared service
    await this.sharedReportsService.generateExcelReport({
      mainHeader: {
        en: `${this.type.toUpperCase()} REPORT`,
        ar: this.getArabicReportTitle()
      },
      subHeaders: [
        { 
          en: 'Detailed Transaction Summary', 
          ar: 'ملخص المعاملات التفصيلي' 
        }
      ],
      infoRows: infoRows,
      reportImage: '', // Add your logo URL if needed
      filename: `${this.type.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.xlsx`,
      tables: tables
    });

    const Swal = await import('sweetalert2').then(m => m.default);

    // Show success message
    Swal.fire({
      title: 'Export Successful',
      text: `${this.type} report has been exported to Excel successfully.`,
      icon: 'success',
      confirmButtonColor: '#089B41',
      timer: 2000,
      showConfirmButton: false
    });

  } catch (error) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: 'Export Failed',
      text: 'There was an error exporting the report to Excel. Please try again.',
      icon: 'error',
      confirmButtonColor: '#089B41',
    });
  }
}

// Helper method to get Arabic title
private getArabicReportTitle(): string {
  switch (this.type) {
    case 'Payable':
      return 'تقرير الدفع';
    case 'Receivable':
      return 'تقرير الاستحقاق';
    case 'Installment Deduction':
      return 'تقرير خصم الأقساط';
    case 'Accounting Entries':
      return 'تقرير القيود المحاسبية';
    default:
      return 'تقرير المحاسبة';
  }
}
}
