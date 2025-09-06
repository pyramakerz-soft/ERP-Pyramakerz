import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-accounting-subledger',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
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
  linkFileOptions: any[] = [
    { id: 2, name: 'Suppliers' },
    { id: 3, name: 'Debits' },
    { id: 4, name: 'Credits' },
    { id: 5, name: 'Saves' },
    { id: 6, name: 'Banks' },
    { id: 7, name: 'Incomes' },
    { id: 8, name: 'Outcomes' },
    { id: 9, name: 'Assets' },
    { id: 10, name: 'Employees' },
    { id: 11, name: 'Tuition Fees Types' },
    { id: 12, name: 'Tuition Discount Types' },
    { id: 13, name: 'Students' }
  ];

  // UI state
  isLoading: boolean = false;
  showTable: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  DomainName: string = '';

  constructor(
    private accountingSubledgerService: AccountingSubledgerService,
    private accountingTreeChartService: AccountingTreeChartService,
    private languageService: LanguageService,
    public account: AccountService,
    public ApiServ: ApiService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.DomainName = this.ApiServ.GetHeader();
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
      this.pageNumber,
      this.pageSize,
      this.DomainName
    ).subscribe({
      next: (response) => {
        this.reportData = response;
        this.showTable = true;
        this.isLoading = false;
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
    const account = this.accounts.find(acc => acc.id === id);
    return account ? account.name : 'All Accounts';
  }

  // Add Math object for template usage
  Math = Math;

  // Pagination methods similar to accounting-constraints component
  get visiblePages(): number[] {
    const total = this.reportData?.pagination.totalPages || 1;
    const current = this.pageNumber;
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

  validatePageSize(event: any) {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
    }
  }

  validateNumberForPagination(event: any): void {
    const value = event.target.value;
    this.pageSize = 0;
  }
}