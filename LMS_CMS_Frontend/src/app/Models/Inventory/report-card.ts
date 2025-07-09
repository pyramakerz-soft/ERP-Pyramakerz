
export interface InventoryNetSummary {
  shopItemId: number;
  storeId: number;
  toDate: string;
  inQuantity: number;
  outQuantity: number;
  balance: number;
}

export interface InventoryNetTransaction {
  flagName: string;
  invoiceNumber: string;
  dayDate: string;
  notes: string | null;
  quantity: number;
  supplierName: string | null;
  studentName: string | null;
  storeToName: string | null;
  totalIn: number;
  totalOut: number;
  balance: number;
}

export interface CombinedReportData {
  isSummary: boolean;
  date: string;
  transactionType: string;
  invoiceNumber: string;
  authority: string;
  income: number | string;
  outcome: number | string;
  balance: number;
}
