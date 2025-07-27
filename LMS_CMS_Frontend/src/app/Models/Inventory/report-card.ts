
export interface InventoryNetSummary {
  shopItemId: number;
  storeId: number;
  toDate: Date;
  inQuantity: number;
  outQuantity: number;
  quantitybalance: number;
  costBalance: number;
}

export interface InventoryNetTransaction {
  flagName: string;
  invoiceNumber: string;
  date: Date;
  notes: string | null;
  quantity: number;
  supplierName: string | null;
  studentName: string | null;
  storeToName: string | null;
  totalIn: number;
  totalOut: number;
  quantitybalance: number;
  averageCost: number | null;
  price: number;
  totalPrice: number;
  itemInOut: number;
}

export interface CombinedReportData {
  isSummary: boolean;
  date: string;
  transactionType: string;
  invoiceNumber: string;
  authority: string;
  income: number | string;
  outcome: number | string;
  quantitybalance: number;
}
