export class AccountingConstraintsEntry {
  constructor(
    public masterID: number = 0,
    public detailsID: number = 0,
    public account: string | null = null,
    public serial: number | null = null,
    public invoiceNumber: string | null = null,
    public mainAccountNo: number | null = null,
    public mainAccount: string | null = null,
    public subAccountNo: number | null = null,
    public subAccount: string | null = null,
    public debit: number | null = null,
    public credit: number | null = null,
    public date: string = ''
  ) {}
}

export class DailyTotals {
  constructor(
    public debit: number = 0,
    public credit: number = 0,
    public difference: number = 0
  ) {}
}

export class DateGroup {
  constructor(
    public date: string = '',
    public entries: AccountingConstraintsEntry[] = [],
    public totals: DailyTotals = new DailyTotals()
  ) {}
}

export class FullTotals {
  constructor(
    public debit: number = 0,
    public credit: number = 0,
    public difference: number = 0
  ) {}
}

export class AccountingConstraintsResponse {
  data: DateGroup[];
  fullTotals: FullTotals;
  pagination: { totalRecords: number; pageSize: number; currentPage: number; totalPages: number };

  constructor(init?: Partial<AccountingConstraintsResponse>) {
    this.data = init?.data || [];
    this.fullTotals = init?.fullTotals || new FullTotals();
    this.pagination = init?.pagination || { totalRecords: 0, pageSize: 0, currentPage: 0, totalPages: 0 };
  }
}
