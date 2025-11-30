import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../../Services/account.service';
import { DeleteEditPermissionService } from '../../../../../Services/shared/delete-edit-permission.service';
import { ApiService } from '../../../../../Services/api.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
// import Swal from 'sweetalert2';
import { ReportsService } from '../../../../../Services/Employee/Accounting/reports.service';
import { SupplierService } from '../../../../../Services/Employee/Accounting/supplier.service';
import { Supplier } from '../../../../../Models/Accounting/supplier';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../../Services/loading.service';

@Component({
  selector: 'app-account-statements',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './account-statements.component.html',
  styleUrl: './account-statements.component.css'
})

@InitLoader()
export class AccountStatementsComponent {
  type: string = '';
  SubAccountNumber: number | null = null;
  suppliers: Supplier[] = [];
  selectedSupplier: number | null = null;
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
  DataToPrint: any = null;
  isRtl: boolean = false;
  subscription!: Subscription;
  tableData: any[] = [];
  direction: string = '';
  isLoading: boolean = false;

  school = {
    reportHeaderOneEn: 'Account Statement',
    reportHeaderTwoEn: 'Detailed Transaction Summary',
    reportHeaderOneAr: 'كشف الحساب',
    reportHeaderTwoAr: 'ملخص المعاملات التفصيلي',
    reportImage: 'assets/images/logo.png',
  };

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    public reportsService: ReportsService,
    private router: Router,
    private languageService: LanguageService,
    private supplierService: SupplierService,
    private loadingService: LoadingService 
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;
    if (currentUrl.includes('Supplier%20Statement') || currentUrl.includes('Supplier Statement')) {
      this.type = 'Supplier Statement';
      this.school.reportHeaderOneEn = 'Supplier Statement';
      this.school.reportHeaderOneAr = 'كشف حساب المورد';
    } else if (currentUrl.includes('Safe%20Statement') || currentUrl.includes('Safe Statement')) {
      this.type = 'Safe Statement';
      this.school.reportHeaderOneEn = 'Safe Statement';
      this.school.reportHeaderOneAr = 'كشف حساب الخزنة';
    } else if (currentUrl.includes('Bank%20Statement') || currentUrl.includes('Bank Statement')) {
      this.type = 'Bank Statement';
      this.school.reportHeaderOneEn = 'Bank Statement';
      this.school.reportHeaderOneAr = 'كشف حساب البنك';
    }

    this.DomainName = this.ApiServ.GetHeader();
    this.direction = document.dir || 'ltr';

    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
    this.isRtl = document.documentElement.dir === 'rtl';
    
    this.loadSuppliers();
  }

  ngOnDestroy(): void { 
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  } 

  InputChange() {
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
      return;
    }

    if (this.selectedSupplier === null) {
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        title: 'Missing Information',
        text: 'Please select a Supplier.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.SubAccountNumber = this.selectedSupplier;
    this.showTable = true;
    this.GetData(this.CurrentPage, this.PageSize);
  }

  GetData(pageNumber: number, pageSize: number) {
    this.isLoading = true;
    this.tableData = [];
    this.CurrentPage = 1;
    this.TotalPages = 1;
    this.TotalRecords = 0;
    this.firstPeriodBalance = 0;
    this.fullTotals = {
      totalDebit: 0,
      totalCredit: 0,
      difference: 0
    };

    if (this.selectedSupplier !== null) {
      this.SubAccountNumber = this.selectedSupplier;
    }

    let dataObservable;

    switch (this.type) {
      case 'Supplier Statement':
        dataObservable = this.reportsService.GetSupplierStatement(
          this.SelectedStartDate,
          this.SelectedEndDate,
          this.SubAccountNumber!,
          this.DomainName,
          pageNumber,
          pageSize
        );
        break;

      case 'Safe Statement':
        dataObservable = this.reportsService.GetSafeStatement(
          this.SelectedStartDate,
          this.SelectedEndDate,
          this.SubAccountNumber!,
          this.DomainName,
          pageNumber,
          pageSize
        );
        break;

      case 'Bank Statement':
        dataObservable = this.reportsService.GetBankStatement(
          this.SelectedStartDate,
          this.SelectedEndDate,
          this.SubAccountNumber!,
          this.DomainName,
          pageNumber,
          pageSize
        );
        break;

      default:
        console.error('Unknown report type:', this.type);
        this.isLoading = false;
        return;
    }

    dataObservable.subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage;
        this.PageSize = data.pagination.pageSize;
        this.TotalPages = data.pagination.totalPages;
        this.TotalRecords = data.pagination.totalRecords;
        this.tableData = data.data;
        this.firstPeriodBalance = data.firstPeriodBalance;
        this.fullTotals = data.fullTotals;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
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

  loadSuppliers() {
    this.isLoading = true;
    this.supplierService.Get(this.DomainName).subscribe(
      (suppliers) => {
        this.suppliers = suppliers;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading suppliers:', error);
        this.isLoading = false;
      }
    );
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
    if (this.selectedSupplier !== null) {
      this.SubAccountNumber = this.selectedSupplier;
    }

    let dataObservable;

    switch (this.type) {
      case 'Supplier Statement':
        dataObservable = this.reportsService.GetSupplierStatement(
          this.SelectedStartDate,
          this.SelectedEndDate,
          this.SubAccountNumber!,
          this.DomainName,
          1,
          this.TotalRecords
        );
        break;

      case 'Safe Statement':
        dataObservable = this.reportsService.GetSafeStatement(
          this.SelectedStartDate,
          this.SelectedEndDate,
          this.SubAccountNumber!,
          this.DomainName,
          1,
          this.TotalRecords
        );
        break;

      case 'Bank Statement':
        dataObservable = this.reportsService.GetBankStatement(
          this.SelectedStartDate,
          this.SelectedEndDate,
          this.SubAccountNumber!,
          this.DomainName,
          1,
          this.TotalRecords
        );
        break;

      default:
        return of([]);
    }

    return dataObservable.pipe(
      map((data) => {
        if (data.data.length === 0) {
          return [];
        }

        const openingBalanceRow = {
          masterID: 0,
          detailsID: 0,
          account: 'Opening Balance',
          serial: 0,
          mainAccountNo: 0,
          mainAccount: '',
          subAccountNo: 0,
          subAccount: '',
          debit: 0,
          credit: 0,
          date: this.SelectedStartDate,
          balance: data.firstPeriodBalance,
          linkFileID: 0,
          notes: ''
        };

        const allData = [openingBalanceRow, ...data.data];

        return [{
          header: `${this.type} - Sub Account ${this.SubAccountNumber}`,
          summary: [
            { key: 'Sub Account Number', value: this.SubAccountNumber },
            { key: 'Start Date', value: this.SelectedStartDate },
            { key: 'End Date', value: this.SelectedEndDate },
            { key: 'Opening Balance', value: data.firstPeriodBalance },
            { key: 'Total Debit', value: data.fullTotals.totalDebit },
            { key: 'Total Credit', value: data.fullTotals.totalCredit },
            { key: 'Difference', value: data.fullTotals.difference },
          ],
          table: {
            headers: [
              'Serial',
              'Date',
              'Account',
              'Main Account',
              'Sub Account',
              'Debit',
              'Credit',
              'Balance',
              'Notes'
            ],
            data: allData.map((item: any) => ({
              Serial: item.serial,
              Date: item.date,
              Account: item.account,
              'Main Account': item.mainAccount || '-',
              'Sub Account': item.subAccount || '-',
              Debit: item.debit,
              Credit: item.credit,
              Balance: item.balance,
              Notes: item.notes || '-'
            }))
          }
        }];
      }),
      catchError((error) => {
        if (error.status === 404) {
          return of([]);
        }
        throw error;
      })
    );
  }

  // UNCOMMENTED AND FIXED DownloadAsExcel METHOD
  async DownloadAsExcel() {
    this.DataToPrint = [];
    const Swal = await import('sweetalert2').then(m => m.default);

    this.GetDataForPrint().subscribe((result) => {
      if (!result || result.length === 0) {
        
        Swal.fire({
          title: 'No Data',
          text: 'No data available for export.',
          icon: 'info',
          confirmButtonText: 'OK',
        });
        return;
      }

      const reportData = result[0]; // Get the first (and only) report section

      // Prepare the Excel options
      const excelOptions = {
        mainHeader: {
          en: this.school.reportHeaderOneEn,
          ar: this.school.reportHeaderOneAr
        },
        subHeaders: [
          {
            en: this.school.reportHeaderTwoEn,
            ar: this.school.reportHeaderTwoAr
          }
        ],
        infoRows: [
          { key: 'Report Type', value: this.type },
          { key: 'Sub Account Number', value: this.SubAccountNumber },
          { key: 'Start Date', value: this.SelectedStartDate },
          { key: 'End Date', value: this.SelectedEndDate },
          { key: 'Opening Balance', value: reportData.summary.find((s: any) => s.key === 'Opening Balance')?.value || 0 },
          { key: 'Total Debit', value: reportData.summary.find((s: any) => s.key === 'Total Debit')?.value || 0 },
          { key: 'Total Credit', value: reportData.summary.find((s: any) => s.key === 'Total Credit')?.value || 0 },
          { key: 'Difference', value: reportData.summary.find((s: any) => s.key === 'Difference')?.value || 0 }
        ],
        tables: [
          {
            title: `${this.type} Transactions`,
            headers: reportData.table.headers,
            data: reportData.table.data.map((item: any) => [
              item.Serial,
              item.Date,
              item.Account,
              item['Main Account'],
              item['Sub Account'],
              item.Debit,
              item.Credit,
              item.Balance,
              item.Notes
            ])
          }
        ],
        filename: `${this.type.replace(' ', '_')}_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      };

      // Call the reports service to generate Excel
      // this.reportsService.generateExcelReport(excelOptions);
    });
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
}