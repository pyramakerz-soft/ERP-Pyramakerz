// Models/Accounting/account-balance-report.ts
export interface AccountBalanceReport {
  id: number;
  name: string;
  debit: number;
  credit: number;
}

export interface AccountTotals {
  totalDebit: number;
  totalCredit: number;
  differences: number;
}

export interface AccountBalanceResponse {
  data: AccountBalanceReport[];
  totals: AccountTotals;
  pagination: {
    totalRecords: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
  };
}