// Models/Accounting/account-balance-report.ts

export class AccountBalanceReport {
  constructor(
    public id: number = 0,
    public name: string = '',
    public debit: number = 0,
    public credit: number = 0
  ) {}
}


export class AccountTotals {
  constructor(
    public totalDebit: number = 0,
    public totalCredit: number = 0,
    public differences: number = 0
  ) {}
}


export class AccountBalanceResponse {
  data: AccountBalanceReport[];
  totals: AccountTotals;
  pagination: { totalRecords: number; pageSize: number; currentPage: number; totalPages: number };

  constructor(init?: Partial<AccountBalanceResponse>) {
    this.data = init?.data || [];
    this.totals = init?.totals || new AccountTotals();
    this.pagination = init?.pagination || { totalRecords: 0, pageSize: 0, currentPage: 0, totalPages: 0 };
  }
}