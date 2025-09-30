import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccountStatementResponse } from '../../../../../Models/Accounting/accounting-statement';
import { AccountingTreeChart } from '../../../../../Models/Accounting/accounting-tree-chart';
import { LinkFile } from '../../../../../Models/Accounting/link-file';
import { Subscription } from 'rxjs';
import { TokenData } from '../../../../../Models/token-data';
import { AccountStatementService } from '../../../../../Services/Employee/Accounting/accounting-statement.service';
import { AccountingTreeChartService } from '../../../../../Services/Employee/Accounting/accounting-tree-chart.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { AccountService } from '../../../../../Services/account.service';
import { ApiService } from '../../../../../Services/api.service';
import { DataAccordingToLinkFileService } from '../../../../../Services/Employee/Accounting/data-according-to-link-file.service';
import { LinkFileService } from '../../../../../Services/Employee/Accounting/link-file.service';
import Swal from 'sweetalert2';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { PdfPrintComponent } from "../../../../../Component/pdf-print/pdf-print.component";

@Component({
  selector: 'app-accounting-statement-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './accounting-statement-report.component.html',
  styleUrl: './accounting-statement-report.component.css'
})
export class AccountingStatementReportComponent implements OnInit {
  // Filter parameters
  fromDate: string = '';
  toDate: string = '';
  linkFileID: number = 0;
  subAccountID: number = 0;
  pageNumber: number = 1;
  pageSize: number = 10;

  // Data
  reportData: AccountStatementResponse | null = null;
  accounts: AccountingTreeChart[] = [];
  linkFileOptions: LinkFile[] = [];
  accountOptions: any[] = []; // For accounts based on selected link file

  // UI state
  isLoading: boolean = false;
  isLinkFilesLoading: boolean = false;
  isAccountsLoading: boolean = false;
  showTable: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  DomainName: string = '';


  // PDF/Excel/Print state
  showPDF: boolean = false;
  cachedTableDataForPDF: any[] = [];
  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;

  school = {
    reportHeaderOneEn: 'Account Statement Report',
    reportHeaderTwoEn: 'Detailed Account Statement Summary',
    reportHeaderOneAr: 'تقرير كشف الحساب',
    reportHeaderTwoAr: 'ملخص كشف الحساب التفصيلي',
    reportImage: 'assets/images/logo.png',
  };

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  constructor(
    private accountStatementService: AccountStatementService,
    private accountingTreeChartService: AccountingTreeChartService,
    private languageService: LanguageService,
    public account: AccountService,
    public ApiServ: ApiService,
    private dataAccordingToLinkFileService: DataAccordingToLinkFileService,
    private linkFileService: LinkFileService,
    private reportsService: ReportsService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.DomainName = this.ApiServ.GetHeader();
    this.loadLinkFiles();
    // this.loadAccounts();
    
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
        console.log('Loaded link files:', linkFiles);
        this.linkFileOptions = linkFiles;
        this.isLinkFilesLoading = false;
      },
      error: (error) => {
        console.error('Error loading link files:', error);
        this.isLinkFilesLoading = false;
      }
    });
  }

  // loadAccounts() {
  //   this.isLoading = true;
  //   this.accountingTreeChartService.Get(this.DomainName).subscribe({
  //     next: (accounts) => {
  //       console.log('Loaded accounts:', accounts);
  //       this.accounts = accounts;
  //       this.isLoading = false;
  //     },
  //     error: (error) => {
  //       console.error('Error loading accounts:', error);
  //       this.isLoading = false;
  //     }
  //   });
  // }

  onLinkFileChange() {
    this.subAccountID = 0; // Reset account selection
    this.accountOptions = []; // Clear previous account options
    this.showTable = false;
    this.reportData = null;
    
    if (this.linkFileID > 0) {
      this.loadAccountsByLinkFile();
    }
  }

loadAccountsByLinkFile() {
  this.isAccountsLoading = true;
  this.dataAccordingToLinkFileService.GetTableDataAccordingToLinkFile(this.DomainName, this.linkFileID).subscribe({
    next: (accounts) => {
      this.accountOptions = accounts.map(account => ({
        ...account,
        name: this.isRtl && account.ar_name ? account.ar_name : (account.en_name || account.user_Name || 'Unknown')
      }));
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


  viewReport() {
    if (!this.fromDate || !this.toDate || !this.linkFileID || !this.subAccountID) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please select Date Range, Account Type, and Account',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (new Date(this.fromDate) > new Date(this.toDate)) {
      Swal.fire({
        title: 'Invalid Date Range',
        text: 'Start date cannot be later than end date.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.isLoading = true;
    this.showTable = false;

    this.accountStatementService.GetAccountStatement(
      new Date(this.fromDate),
      new Date(this.toDate),
      this.linkFileID,
      this.subAccountID,
      this.CurrentPage,
      this.PageSize,
      this.DomainName
    ).subscribe({
      next: (response) => {
        this.reportData = response;
        this.showTable = true;
        this.isLoading = false;
        if (response.pagination) {
          this.CurrentPage = response.pagination.currentPage;
          this.TotalPages = response.pagination.totalPages;
          this.TotalRecords = response.pagination.totalRecords;
        }
      },
      error: (error) => {
        console.error('Error loading report:', error);
        this.reportData = null;
        this.showTable = true;
        this.isLoading = false;
        if (error.status === 404) {
          Swal.fire({
            title: 'No Data Found',
            text: 'No data available for the selected filters',
            icon: 'info',
            confirmButtonText: 'OK',
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Failed to load report data',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      }
    });
  }


  changeCurrentPage(currentPage: number) {
    if (currentPage > 0 && currentPage <= this.TotalPages) {
      this.CurrentPage = currentPage;
      this.viewReport();
    }
  }

  validatePageSize(event: any) {
    const value = event.target.value;
    if (isNaN(value) || value === '' || parseInt(value) <= 0) {
      this.PageSize = 1;
      event.target.value = 1;
    } else {
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

  getLinkFileName(id: number): string {
    const option = this.linkFileOptions.find(opt => opt.id === id);
    return option ? option.name : 'Unknown';
  }

  getAccountName(id: number): string {
    if (id === 0) return 'All Accounts';
    
    // First check in accountOptions (link file specific accounts)
    const accountFromLinkFile = this.accountOptions.find(acc => acc.id === id);
    if (accountFromLinkFile) {
      return accountFromLinkFile.name || accountFromLinkFile.en_name || 'Unknown';
    }
    
    // Fallback to general accounts
    const account = this.accounts.find(acc => acc.id === id);
    return account ? account.name : 'Unknown Account';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  // Add Math object for template usage
  Math = Math;


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

  // ===== EXPORT METHODS =====
  prepareExportData(): void {
    this.cachedTableDataForPDF = [];
    if (this.reportData && this.reportData.data.length > 0) {
      const section = {
        header: 'Account Statement',
        data: [
          { key: 'Opening Balance', value: this.reportData.firstPeriodBalance },
          { key: 'Total Debit', value: this.reportData.fullTotals.totalDebit },
          { key: 'Total Credit', value: this.reportData.fullTotals.totalCredit },
          { key: 'Difference', value: this.reportData.fullTotals.difference },
        ],
        tableHeaders: ['Date', 'Account', 'Serial', 'Sub Account', 'Debit', 'Credit', 'Balance', 'Notes'],
        tableData: this.reportData.data.map(item => ({
          Date: this.formatDate(item.date),
          Account: item.account,
          Serial: item.serial,
          'Sub Account': item.subAccount,
          Debit: item.debit,
          Credit: item.credit,
          Balance: item.balance,
          Notes: item.notes || '-'
        }))
      };
      this.cachedTableDataForPDF.push(section);
    }
  }

  getInfoRows(): any[] {
    return [
      {
        keyEn: 'Date From: ' + this.fromDate,
        keyAr: 'التاريخ من: ' + this.fromDate
      },
      {
        keyEn: 'Date To: ' + this.toDate,
        keyAr: 'التاريخ إلى: ' + this.toDate
      },
      {
        keyEn: 'Account Type: ' + this.getLinkFileName(this.linkFileID),
        keyAr: 'نوع الحساب: ' + this.getLinkFileName(this.linkFileID)
      },
      {
        keyEn: 'Account: ' + this.getAccountName(this.subAccountID),
        keyAr: 'الحساب: ' + this.getAccountName(this.subAccountID)
      },
      {
        keyEn: 'Generated On: ' + new Date().toLocaleDateString(),
        keyAr: 'تم الإنشاء في: ' + new Date().toLocaleDateString()
      }
    ];
  }

  Print() {
    this.prepareExportData();
    if (this.cachedTableDataForPDF.length === 0) {
      Swal.fire('Warning', 'No data to print!', 'warning');
      return;
    }
    this.showPDF = true;
    setTimeout(() => {
      const printContents = document.getElementById('accountStatementData')?.innerHTML;
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
    this.prepareExportData();
    if (this.cachedTableDataForPDF.length === 0) {
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
      Swal.fire({
        title: 'No Data',
        text: 'No data available for export.',
        icon: 'info',
        confirmButtonText: 'OK',
      });
      return;
    }
    try {
      const tableData = this.reportData.data.map(item => ([
        item.date,
        item.account,
        item.serial,
        item.subAccount,
        item.debit,
        item.credit,
        item.balance,
        item.notes || '-'
      ]));
      const totalsData = [
        ['Opening Balance', this.reportData.firstPeriodBalance],
        ['Total Debit', this.reportData.fullTotals.totalDebit],
        ['Total Credit', this.reportData.fullTotals.totalCredit],
        ['Difference', this.reportData.fullTotals.difference]
      ];
      await this.reportsService.generateExcelReport({
        mainHeader: {
          en: 'Account Statement Report',
          ar: 'تقرير كشف الحساب'
        },
        subHeaders: [{
          en: 'Detailed Account Statement Summary',
          ar: 'ملخص كشف الحساب التفصيلي'
        }],
        infoRows: [
          { key: 'Date From', value: this.fromDate },
          { key: 'Date To', value: this.toDate },
          { key: 'Account Type', value: this.getLinkFileName(this.linkFileID) },
          { key: 'Account', value: this.getAccountName(this.subAccountID) },
          { key: 'Generated On', value: new Date().toLocaleDateString() }
        ],
        tables: [
          {
            // title: 'Account Statement',
            headers: ['Date', 'Account', 'Serial', 'Sub Account', 'Debit', 'Credit', 'Balance', 'Notes'],
            data: tableData
          },
          {
            // title: 'Totals',
            headers: ['Description', 'Amount'],
            data: totalsData
          }
        ],
        filename: `Account_Statement_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
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