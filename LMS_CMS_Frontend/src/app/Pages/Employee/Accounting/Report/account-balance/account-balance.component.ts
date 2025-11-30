import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccountBalanceResponse } from '../../../../../Models/Accounting/accounting-balance';
import { AccountingTreeChart } from '../../../../../Models/Accounting/accounting-tree-chart';
import { Subscription } from 'rxjs';
import { TokenData } from '../../../../../Models/token-data';
import { AccountingBalanceResponse } from '../../../../../Services/Employee/Accounting/accounting-balance.service';
import { AccountingTreeChartService } from '../../../../../Services/Employee/Accounting/accounting-tree-chart.service';
import { MenuService } from '../../../../../Services/shared/menu.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { AccountService } from '../../../../../Services/account.service';
import { ApiService } from '../../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../../Services/shared/delete-edit-permission.service';
import { Router } from '@angular/router';
// import Swal from 'sweetalert2';
import { LinkFileService } from '../../../../../Services/Employee/Accounting/link-file.service';
import { LinkFile } from '../../../../../Models/Accounting/link-file';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../../Services/loading.service';

@Component({
  selector: 'app-account-balance',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './account-balance.component.html',
  styleUrl: './account-balance.component.css'
})

@InitLoader()
export class AccountBalanceComponent implements OnInit {
  // Filter parameters
  toDate: string = '';
  linkFileID: number = 0;
  accountID: number = 0;
  zeroBalance: boolean = true;
  positiveBalance: boolean = true;
  negativeBalance: boolean = true;
  pageNumber: number = 1;
  pageSize: number = 10;

  // Data
  reportData: AccountBalanceResponse | null = null;
  accounts: AccountingTreeChart[] = [];
  linkFileOptions: LinkFile[] = [];
  accountOptions: AccountingTreeChart[] = [];

  // UI state
  isLoading: boolean = false;
  isLinkFilesLoading: boolean = false;
  isAccountsLoading: boolean = false;
  showTable: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  DomainName: string = '';

  showPDF: boolean = false;
  cachedTableDataForPDF: any[] = [];

  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;

  
  school = {
    reportHeaderOneEn: 'Account Balance Report',
    reportHeaderTwoEn: 'Detailed Account Balance Summary',
    reportHeaderOneAr: 'تقرير أرصدة الحسابات',
    reportHeaderTwoAr: 'ملخص أرصدة الحسابات التفصيلي',
    reportImage: 'assets/images/logo.png',
  };

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  constructor(
    private accountingBalanceService: AccountingBalanceResponse,
    private accountingTreeChartService: AccountingTreeChartService,
    private menuService: MenuService,
    private languageService: LanguageService,
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    private linkFileService: LinkFileService,
    private reportsService: ReportsService,
    private loadingService: LoadingService 
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.DomainName = this.ApiServ.GetHeader();
    this.loadLinkFiles();
    this.loadAccounts();
    
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

  loadLinkFiles() {
    this.isLinkFilesLoading = true;
    this.linkFileService.Get(this.DomainName).subscribe({
      next: (linkFiles) => {
        this.linkFileOptions = linkFiles;
        this.isLinkFilesLoading = false;
      },
      error: (error) => {
        console.error('Error loading link files:', error);
        this.isLinkFilesLoading = false;
      }
    });
  }

  loadAccounts() {
    this.isLoading = true;
    this.accountingTreeChartService.Get(this.DomainName).subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.isLoading = false;
      }
    });
  }

  onLinkFileChange() {
    this.accountID = 0;
    this.accountOptions = [];
    this.showTable = false;
    this.reportData = null;
    
    if (this.linkFileID > 0) {
      this.loadAccountsByLinkFile();
    }
  }

  loadAccountsByLinkFile() {
    this.isAccountsLoading = true;
    this.accountingTreeChartService.GetByLinkFileId(this.linkFileID, this.DomainName).subscribe({
      next: (accounts) => {
        this.accountOptions = accounts;
        this.isAccountsLoading = false;
      },
      error: (error) => {
        console.error('Error loading accounts by link file:', error);
        this.isAccountsLoading = false;
      }
    });
  }

  onFilterChange() {
    this.showTable = false;
    this.reportData = null;
    this.pageNumber = 1;
  }

async viewReport() {
  if (!this.toDate || !this.linkFileID) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: 'Missing Information',
      text: 'Please select both Date and Account Type',
      icon: 'warning',
      confirmButtonText: 'OK',
    });
    return;
  }

  this.isLoading = true;
  this.showTable = false;

  this.accountingBalanceService.GetAccountBalance(
    new Date(this.toDate),
    this.linkFileID,
    this.accountID,
    this.zeroBalance,
    this.positiveBalance,
    this.negativeBalance,
    this.CurrentPage, // Changed from pageNumber
    this.PageSize,    // Changed from pageSize
    this.DomainName
  ).subscribe({
    next: (response) => {
      this.reportData = response;
      this.showTable = true;
      this.isLoading = false;
      
      // Update pagination properties from response
      if (response.pagination) {
        this.CurrentPage = response.pagination.currentPage;
        this.TotalPages = response.pagination.totalPages;
        this.TotalRecords = response.pagination.totalRecords;
      }
    },
    error: async (error) => {
       
      this.reportData = null;
      this.showTable = true;
      this.isLoading = false;

      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        title: 'Error',
        text: 'Failed to load report data',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  });
}

  changePage(newPage: number) {
    if (newPage > 0 && newPage <= (this.reportData?.pagination.totalPages || 1)) {
      this.pageNumber = newPage;
      this.viewReport();
    }
  }

  getLinkFileName(id: number): string {
    const option = this.linkFileOptions.find(opt => opt.id === id);
    return option ? option.name : 'Unknown';
  }

  getAccountName(id: number): string {
    if (id === 0) return 'All Accounts';
    
    const accountFromLinkFile = this.accountOptions.find(acc => acc.id === id);
    if (accountFromLinkFile) {
      return accountFromLinkFile.name;
    }
    
    const account = this.accounts.find(acc => acc.id === id);
    return account ? account.name : 'Unknown Account';
  }

  Math = Math;

  // ========== EXPORT METHODS ==========

  prepareExportData(): void {
    this.cachedTableDataForPDF = [];
    
    if (this.reportData && this.reportData.data.length > 0) {
      const section = {
        header: 'Totals',
        data: [
          { key: 'Total Debit : ', value: this.reportData.totals.totalDebit },
          { key: 'Total Credit : ', value: this.reportData.totals.totalCredit },
          { key: 'Diffrenece : ', value: this.reportData.totals.differences },
        ],
        tableHeaders: ['ID', 'Name', 'Debit', 'Credit'],
        tableData: this.reportData.data.map(item => ({
          ID: item.id,
          Name: item.name,
          Debit: item.debit,
          Credit: item.credit
        }))
      };
      
      this.cachedTableDataForPDF.push(section);
    }
  }

  getInfoRows(): any[] {
    return [
      {
        keyEn: 'Date To: ' + this.toDate,
        keyAr: 'التاريخ إلى: ' + this.toDate
      },
      {
        keyEn: 'Account Type: ' + this.getLinkFileName(this.linkFileID),
        keyAr: 'نوع الحساب: ' + this.getLinkFileName(this.linkFileID)
      },
      {
        keyEn: 'Account: ' + this.getAccountName(this.accountID),
        keyAr: 'الحساب: ' + this.getAccountName(this.accountID)
      },
      {
        keyEn: 'Generated On: ' + new Date().toLocaleDateString(),
        keyAr: 'تم الإنشاء في: ' + new Date().toLocaleDateString()
      }
    ];
  }

  async Print() {
    this.prepareExportData();
    if (this.cachedTableDataForPDF.length === 0) {
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire('Warning', 'No data to print!', 'warning');
      return;
    }

    this.showPDF = true;
    setTimeout(() => {
      const printContents = document.getElementById('accountBalanceData')?.innerHTML;
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

  async DownloadAsPDF() {
    this.prepareExportData();
    if (this.cachedTableDataForPDF.length === 0) {
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
    if (!this.reportData || this.reportData.data.length === 0) {
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
      const tableData = this.reportData.data.map(item => [
        item.id,
        item.name,
        item.debit,
        item.credit
      ]);

      const totalsData = [
        ['Total Debit', this.reportData.totals.totalDebit],
        ['Total Credit', this.reportData.totals.totalCredit],
        ['Difference', this.reportData.totals.differences]
      ];

      await this.reportsService.generateExcelReport({
        mainHeader: {
          en: 'Account Balance Report',
          ar: 'تقرير أرصدة الحسابات'
        },
        // subHeaders: [{
        //   en: 'Detailed Account Balance Summary',
        //   ar: 'ملخص أرصدة الحسابات التفصيلي'
        // }],
        infoRows: [
          { key: 'Date To', value: this.toDate },
          { key: 'Account Type', value: this.getLinkFileName(this.linkFileID) },
          { key: 'Account', value: this.getAccountName(this.accountID) },
          { key: 'Generated On', value: new Date().toLocaleDateString() }
        ],
        tables: [
          {
            // title: 'Account Balances',
            headers: ['ID', 'Name', 'Debit', 'Credit'],
            data: tableData
          },
          {
            // title: 'Totals',
            headers: ['Description', 'Amount'],
            data: totalsData
          }
        ],
        filename: `Account_Balance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
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

  changeCurrentPage(currentPage: number) {
  this.CurrentPage = currentPage;
  this.viewReport();
}

validatePageSize(event: any) { 
  const value = event.target.value;
  if (isNaN(value) || value === '' || parseInt(value) <= 0) {
    // Set to minimum valid value instead of empty
    this.PageSize = 1;
    event.target.value = 1;
  } else {
    // Ensure it's a valid integer
    this.PageSize = parseInt(value);
    event.target.value = parseInt(value);
  }
}

validateNumberForPagination(event: any): void {
  const value = event.target.value;
  if (value === '' || isNaN(value) || parseInt(value) <= 0) {
    event.target.value = this.PageSize;
  }
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