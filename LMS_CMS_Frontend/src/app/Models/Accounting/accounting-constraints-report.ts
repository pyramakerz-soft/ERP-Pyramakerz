export interface AccountingConstraintsEntry {
  masterID: number;
  detailsID: number;
  account: string | null;
  serial: number | null;
  invoiceNumber: string | null;
  mainAccountNo: number | null;
  mainAccount: string | null;
  subAccountNo: number | null;
  subAccount: string | null;
  debit: number | null;
  credit: number | null;
  date: string;
}

export interface DailyTotals {
  debit: number;
  credit: number;
  difference: number;
}

export interface DateGroup {
  date: string;
  entries: AccountingConstraintsEntry[];
  totals: DailyTotals;
}

export interface FullTotals {
  debit: number;
  credit: number;
  difference: number;
}

export interface AccountingConstraintsResponse {
  data: DateGroup[];
  fullTotals: FullTotals;
  pagination: {
    totalRecords: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
  };
}
