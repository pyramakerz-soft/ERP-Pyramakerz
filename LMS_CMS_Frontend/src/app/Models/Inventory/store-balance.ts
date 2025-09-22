export interface StoreBalanceReport {
  reportType: 'QuantityOnly' | 'PurchasePrice' | 'SalesPrice' | 'Cost' | 'ItemsUnderLimit';
  data: StoreBalanceItem[];
  grandTotals?: {
    TotalQuantity: number;
    TotalValue?: number;
  };
}

export interface StoreBalanceItem {
  itemCode: number;
  itemName: string;
  stores: StoreBalanceDetail[];
  quantity: number;
  purchasePrice?: number;
  totalPurchase?: number;
  totalPurchaseValue?: number;
  salesPrice?: number;
  totalSales?: number;
  totalSalesValue?: number;
  averageCost?: number;
  totalCost?: number;
  limit?: number;
}

export interface StoreBalanceDetail {
  SalesPrice: null;
  storeName: string;
  quantity: number;
  PurchasePrice?: number;
  value?: number;
  AverageCost?: number;
}