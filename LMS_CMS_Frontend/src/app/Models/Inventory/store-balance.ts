export interface StoreBalanceReport {
  reportType: 'QuantityOnly' | 'PurchasePrice' | 'SalesPrice' | 'Cost'     | 'ItemsUnderLimit';
  data: StoreBalanceItem[];
  grandTotals?: {
    TotalQuantity: number;
  };
}

export interface StoreBalanceItem {
  itemCode: number;
  itemName: string;
  stores: {
    storeName: string;
    quantity: number;
  }[];
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

