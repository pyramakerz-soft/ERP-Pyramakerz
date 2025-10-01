export interface AccountSubledgerReport {
  id: number;
  name: string;
  debit: number;
  credit: number;
}

export interface PeriodTotals {
  totalCredit: number;
  totalDebit: number;
  difference: number;
}

export interface AccountSubledgerResponse {
  firstPeriodTotals: {
    balance: AccountSubledgerReport[];
    total: PeriodTotals;
  };
  transactionsPeriodTotals: {
    balance: AccountSubledgerReport[];
    total: PeriodTotals;
  };
  lastPeriodTotals: {
    balance: AccountSubledgerReport[];
    total: PeriodTotals;
  };
  pagination: {
    totalRecords: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
  };
}