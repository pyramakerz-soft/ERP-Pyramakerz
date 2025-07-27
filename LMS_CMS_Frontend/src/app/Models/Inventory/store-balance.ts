export interface StoreBalanceReport {
  reportType:
    | 'QuantityOnly'
    | 'PurchasePrice'
    | 'SalesPrice'
    | 'Cost'
    | 'ItemsUnderLimit';
  data: StoreBalanceItem[];
}

export interface StoreBalanceItem {
  itemCode: number;
  itemName: string;
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
