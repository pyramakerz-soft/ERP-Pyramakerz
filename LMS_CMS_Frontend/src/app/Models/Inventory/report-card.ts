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
  balance: number;
  averageCost: number | null;
  price: number;
  totalPrice: number;
  itemInOut: number;
  inQuantity: number;
  outQuantity: number;
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

export interface InventoryNetCombinedResponse {
  summary: {
    fromDate: string;
    shopItemId: number;
    storeId: number;
    toDate: string;
    inQuantity: number;
    outQuantity: number;
    quantitybalance: number;
    costBalance: number;
  };
  transactions: InventoryNetCombinedTransaction[];
}

export interface InventoryNetCombinedTransaction {
  date: string;
  flagId: number;
  flagName: string;
  invoiceNumber: string;
  notes: string | null;
  inQuantity: number;
  outQuantity: number;
  quantity: number;
  balance: number;
  price: number;
  totalPrice: number;
  averageCost: number;
  itemInOut: number;
  supplierName: string | null;
  studentName: string | null;
  storeName: string | null;
  storeToName: string | null;
}
