export interface AccountStatementItem {
  date: string;
  account: string;
  serial: number;
  subAccount: string;
  credit: number;
  debit: number;
  balance: number;
  notes: string | null;
}

export interface AccountStatementTotals {
  totalDebit: number;
  totalCredit: number;
  difference: number;
}

export interface AccountStatementPagination {
  totalRecords: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export interface AccountStatementResponse {
  data: AccountStatementItem[];
  firstPeriodBalance: number;
  fullTotals: AccountStatementTotals;
  pagination: AccountStatementPagination;
}