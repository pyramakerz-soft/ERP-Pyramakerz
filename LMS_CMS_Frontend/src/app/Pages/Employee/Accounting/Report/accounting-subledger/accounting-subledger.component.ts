import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountSubledgerResponse } from '../../../../../Models/Accounting/account-subledger-report';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccountingTreeChart } from '../../../../../Models/Accounting/accounting-tree-chart';
import { Subscription } from 'rxjs';
import { TokenData } from '../../../../../Models/token-data';
import { AccountingSubledgerService } from '../../../../../Services/Employee/Accounting/accounting-subledger.service';
import { AccountingTreeChartService } from '../../../../../Services/Employee/Accounting/accounting-tree-chart.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { AccountService } from '../../../../../Services/account.service';
import { ApiService } from '../../../../../Services/api.service';
import Swal from 'sweetalert2';
import { LinkFileService } from '../../../../../Services/Employee/Accounting/link-file.service';
import { LinkFile } from '../../../../../Models/Accounting/link-file';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';

@Component({
  selector: 'app-accounting-subledger',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './accounting-subledger.component.html',
  styleUrl: './accounting-subledger.component.css'
})
export class AccountingSubledgerComponent implements OnInit {
  // Filter parameters
  fromDate: string = '';
  toDate: string = '';
  linkFileID: number = 0;
  accountID: number = 0;
  pageNumber: number = 1;
  pageSize: number = 10;

  // Data
  reportData: AccountSubledgerResponse | null = null;
  accounts: AccountingTreeChart[] = [];
  linkFileOptions: LinkFile[] = [];
  accountOptions: AccountingTreeChart[] = []; // For accounts based on selected link file

  // UI state
  isLoading: boolean = false;
  isLinkFilesLoading: boolean = false;
  isAccountsLoading: boolean = false;
  showTable: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  DomainName: string = '';

  // PDF Export properties
  showPDF: boolean = false;
  cachedTableDataForPDF: any[] = [];

  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;

  
  school = {
    reportHeaderOneEn: 'Accounts Subledger Report',
    reportHeaderTwoEn: 'Detailed Subledger Summary',
    reportHeaderOneAr: 'تقرير دفتر الأستاذ المساعد',
    reportHeaderTwoAr: 'ملخص دفتر الأستاذ المساعد التفصيلي',
    reportImage: 'assets/images/logo.png',
  };

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  constructor(
    private accountingSubledgerService: AccountingSubledgerService,
    private accountingTreeChartService: AccountingTreeChartService,
    private languageService: LanguageService,
    public account: AccountService,
    public ApiServ: ApiService,
    private linkFileService: LinkFileService,
    private reportsService: ReportsService
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
    this.accountingTreeChartService.GetBySubID(this.DomainName).subscribe({
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
    this.accountID = 0; // Reset account selection
    this.accountOptions = []; // Clear previous account options
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

viewReport() {
  if (!this.fromDate || !this.toDate || !this.linkFileID) {
    Swal.fire({
      title: 'Missing Information',
      text: 'Please select Date Range and Account Type',
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

  this.accountingSubledgerService.GetAccountsLedger(
    new Date(this.fromDate),
    new Date(this.toDate),
    this.linkFileID,
    this.accountID,
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
    
    // First check in accountOptions (link file specific accounts)
    const accountFromLinkFile = this.accountOptions.find(acc => acc.id === id);
    if (accountFromLinkFile) {
      return accountFromLinkFile.name;
    }
    
    // Fallback to general accounts
    const account = this.accounts.find(acc => acc.id === id);
    return account ? account.name : 'Unknown Account';
  }

  // Add Math object for template usage
  Math = Math;

  // ========== EXPORT METHODS ==========

  prepareExportData(): void {
    this.cachedTableDataForPDF = [];
    
    if (this.reportData) {
      // Opening Balance Section
      if (this.reportData.firstPeriodTotals.balance.length > 0) {
        const openingSection = {
          header: 'Opening Balance',
          data: [
            { key: 'Total Debit : ', value: this.reportData.firstPeriodTotals.total.totalDebit },
            { key: 'Total Credit : ', value: this.reportData.firstPeriodTotals.total.totalCredit },
            { key: 'Difference : ', value: this.reportData.firstPeriodTotals.total.difference },
          ],
          tableHeaders: ['ID', 'Name', 'Debit', 'Credit'],
          tableData: this.reportData.firstPeriodTotals.balance.map(item => ({
            ID: item.id,
            Name: item.name,
            Debit: item.debit,
            Credit: item.credit
          }))
        };
        this.cachedTableDataForPDF.push(openingSection);
      }

      // Transactions Period Section
      if (this.reportData.transactionsPeriodTotals.balance.length > 0) {
        const transactionsSection = {
          header: 'Transactions Period',
          data: [
            { key: 'Total Debit : ', value: this.reportData.transactionsPeriodTotals.total.totalDebit },
            { key: 'Total Credit : ', value: this.reportData.transactionsPeriodTotals.total.totalCredit },
            { key: 'Difference : ', value: this.reportData.transactionsPeriodTotals.total.difference },
          ],
          tableHeaders: ['ID', 'Name', 'Debit', 'Credit'],
          tableData: this.reportData.transactionsPeriodTotals.balance.map(item => ({
            ID: item.id,
            Name: item.name,
            Debit: item.debit,
            Credit: item.credit
          }))
        };
        this.cachedTableDataForPDF.push(transactionsSection);
      }

      // Closing Balance Section
      if (this.reportData.lastPeriodTotals.bakance.length > 0) {
        const closingSection = {
          header: 'Closing Balance',
          data: [
            { key: 'Total Debit : ', value: this.reportData.lastPeriodTotals.total.totalDebit },
            { key: 'Total Credit : ', value: this.reportData.lastPeriodTotals.total.totalCredit },
            { key: 'Difference : ', value: this.reportData.lastPeriodTotals.total.difference },
          ],
          tableHeaders: ['ID', 'Name', 'Debit', 'Credit'],
          tableData: this.reportData.lastPeriodTotals.bakance.map(item => ({
            ID: item.id,
            Name: item.name,
            Debit: item.debit,
            Credit: item.credit
          }))
        };
        this.cachedTableDataForPDF.push(closingSection);
      }
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
        keyEn: 'Account: ' + this.getAccountName(this.accountID),
        keyAr: 'الحساب: ' + this.getAccountName(this.accountID)
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
      const printContents = document.getElementById('accountSubledgerData')?.innerHTML;
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
    if (!this.reportData) {
      Swal.fire({
        title: 'No Data',
        text: 'No data available for export.',
        icon: 'info',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      // Prepare data for Excel export
      const tables = [];

      // Opening Balance
      if (this.reportData.firstPeriodTotals.balance.length > 0) {
        const openingData = this.reportData.firstPeriodTotals.balance.map(item => [
          item.id,
          item.name,
          item.debit,
          item.credit
        ]);
        
        const openingTotals = [
          ['Total Debit', this.reportData.firstPeriodTotals.total.totalDebit],
          ['Total Credit', this.reportData.firstPeriodTotals.total.totalCredit],
          ['Difference', this.reportData.firstPeriodTotals.total.difference]
        ];

        tables.push({
          title: 'Opening Balance',
          headers: ['ID', 'Name', 'Debit', 'Credit'],
          data: openingData
        });

        tables.push({
          title: 'Opening Balance Totals',
          headers: ['Description', 'Amount'],
          data: openingTotals
        });
      }

      // Transactions Period
      if (this.reportData.transactionsPeriodTotals.balance.length > 0) {
        const transactionsData = this.reportData.transactionsPeriodTotals.balance.map(item => [
          item.id,
          item.name,
          item.debit,
          item.credit
        ]);
        
        const transactionsTotals = [
          ['Total Debit', this.reportData.transactionsPeriodTotals.total.totalDebit],
          ['Total Credit', this.reportData.transactionsPeriodTotals.total.totalCredit],
          ['Difference', this.reportData.transactionsPeriodTotals.total.difference]
        ];

        tables.push({
          title: 'Transactions Period',
          headers: ['ID', 'Name', 'Debit', 'Credit'],
          data: transactionsData
        });

        tables.push({
          title: 'Transactions Period Totals',
          headers: ['Description', 'Amount'],
          data: transactionsTotals
        });
      }

      // Closing Balance
      if (this.reportData.lastPeriodTotals.bakance.length > 0) {
        const closingData = this.reportData.lastPeriodTotals.bakance.map(item => [
          item.id,
          item.name,
          item.debit,
          item.credit
        ]);
        
        const closingTotals = [
          ['Total Debit', this.reportData.lastPeriodTotals.total.totalDebit],
          ['Total Credit', this.reportData.lastPeriodTotals.total.totalCredit],
          ['Difference', this.reportData.lastPeriodTotals.total.difference]
        ];

        tables.push({
          title: 'Closing Balance',
          headers: ['ID', 'Name', 'Debit', 'Credit'],
          data: closingData
        });

        tables.push({
          title: 'Closing Balance Totals',
          headers: ['Description', 'Amount'],
          data: closingTotals
        });
      }

      if (tables.length === 0) {
        Swal.fire({
          title: 'No Data',
          text: 'No data available for export.',
          icon: 'info',
          confirmButtonText: 'OK',
        });
        return;
      }

      await this.reportsService.generateExcelReport({
        mainHeader: {
          en: 'Accounts Subledger Report',
          ar: 'تقرير دفتر الأستاذ المساعد'
        },
        subHeaders: [{
          en: 'Detailed Subledger Summary',
          ar: 'ملخص دفتر الأستاذ المساعد التفصيلي'
        }],
        infoRows: [
          { key: 'Date From', value: this.fromDate },
          { key: 'Date To', value: this.toDate },
          { key: 'Account Type', value: this.getLinkFileName(this.linkFileID) },
          { key: 'Account', value: this.getAccountName(this.accountID) },
          { key: 'Generated On', value: new Date().toLocaleDateString() }
        ],
        tables: tables,
        filename: `Accounts_Subledger_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
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
  // Validate and ensure it's a positive number
  if (value === '' || isNaN(value) || parseInt(value) <= 0) {
    event.target.value = this.PageSize; // Reset to previous valid value
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