// models/inventory/report-card.model.ts

export interface InventoryNetSummary {
  openingBalance: number;
  totalIn: number;
  totalOut: number;
  closingBalance: number;
}

export interface InventoryNetTransaction {
  date: Date | string;
  transactionType: string;
  invoiceNumber: string;
  authority: string;
  quantity: number;
  price: number;
  total: number;
  balance: number;
  notes?: string;
}

export interface CombinedReportData {
  isSummary: boolean;
  date: Date | string;
  transactionType: string;
  invoiceNumber: string;
  authority: string;
  income: number | string;
  outcome: number | string;
  balance: number;
}
