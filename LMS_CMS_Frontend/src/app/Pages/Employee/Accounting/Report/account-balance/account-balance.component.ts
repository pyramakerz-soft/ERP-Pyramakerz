import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import Swal from 'sweetalert2';

@Component({
  selector: 'app-account-balance',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './account-balance.component.html',
  styleUrl: './account-balance.component.css'
})
export class AccountBalanceComponent  implements OnInit {
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
    private accountingBalanceService: AccountingBalanceResponse,
    private accountingTreeChartService: AccountingTreeChartService,
    private menuService: MenuService,
    private languageService: LanguageService,
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router
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
    this.pageNumber = 1; // Reset to first page when filters change
  }

  viewReport() {
    if (!this.toDate || !this.linkFileID) {
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
    const account = this.accounts.find(acc => acc.id === id);
    return account ? account.name : 'All Accounts';
  }

}