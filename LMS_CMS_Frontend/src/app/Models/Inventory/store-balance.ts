
export class StoreBalanceReport {
  constructor(
    public reportType: 'QuantityOnly' | 'PurchasePrice' | 'SalesPrice' | 'Cost' | 'ItemsUnderLimit' = 'QuantityOnly',
    public data: StoreBalanceItem[] = [],
    public grandTotals: { TotalQuantity: number; TotalValue?: number }
  ) {}
}

export class StoreBalanceItem {
  constructor(
    public itemCode: number = 0,
    public itemName: string = '',
    public stores: StoreBalanceDetail[] = [],
    public quantity: number = 0,
    public purchasePrice?: number,
    public totalPurchase?: number,
    public totalPurchaseValue?: number,
    public salesPrice?: number,
    public totalSales?: number,
    public totalSalesValue?: number,
    public averageCost?: number,
    public totalCost?: number,
    public limit?: number
  ) {}
}

export class StoreBalanceDetail {
  constructor(
    public SalesPrice: null = null,
    public storeName: string = '',
    public quantity: number = 0,
    public PurchasePrice?: number,
    public value: number | null = null,
    public AverageCost?: number
  ) {}
}

export interface PaginatedStoreBalanceResponse {
  reportType: 'QuantityOnly' | 'PurchasePrice' | 'SalesPrice' | 'Cost' | 'ItemsUnderLimit';
  data: StoreBalanceItem[];
  grandTotals: { TotalQuantity: number; TotalValue?: number };
  pagination: {
    totalRecords: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
  };
}
