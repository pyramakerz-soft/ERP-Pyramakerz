export class AccountStatementItem {
  constructor(
    public date: string = '',
    public account: string = '',
    public serial: number = 0,
    public subAccount: string = '',
    public credit: number = 0,
    public debit: number = 0,
    public balance: number = 0,
    public notes: string | null = null
  ) {}
}

export class AccountStatementTotals {
  constructor(
    public totalDebit: number = 0,
    public totalCredit: number = 0,
    public difference: number = 0
  ) {}
}

export class AccountStatementPagination {
  constructor(
    public totalRecords: number = 0,
    public pageSize: number = 0,
    public currentPage: number = 0,
    public totalPages: number = 0
  ) {}
}

export class AccountStatementResponse {
  data: AccountStatementItem[];
  firstPeriodBalance: number;
  fullTotals: AccountStatementTotals;
  pagination: AccountStatementPagination;

  constructor(init?: Partial<AccountStatementResponse>) {
    this.data = init?.data || [];
    this.firstPeriodBalance = init?.firstPeriodBalance ?? 0;
    this.fullTotals = init?.fullTotals || new AccountStatementTotals();
    this.pagination = init?.pagination || new AccountStatementPagination();
  }
}