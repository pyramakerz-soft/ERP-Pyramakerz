export class InventoryNetSummary {
  constructor(
    public shopItemId: number = 0,
    public storeId: number = 0,
    public toDate: Date = new Date(),
    public inQuantity: number = 0,
    public outQuantity: number = 0,
    public quantitybalance: number = 0,
    public costBalance: number = 0
  ) {}
}

export class InventoryNetTransaction {
  constructor(
    public flagName: string = '',
    public invoiceNumber: string = '',
    public date: Date = new Date(),
    public notes: string | null = null,
    public quantity: number = 0,
    public supplierName: string | null = null,
    public studentName: string | null = null,
    public storeToName: string | null = null,
    public totalIn: number = 0,
    public totalOut: number = 0,
    public balance: number = 0,
    public averageCost: number | null = null,
    public price: number = 0,
    public totalPrice: number = 0,
    public itemInOut: number = 0,
    public inQuantity: number = 0,
    public outQuantity: number = 0
  ) {}
}

export class CombinedReportData {
  constructor(
    public isSummary: boolean = false,
    public date: string = '',
    public transactionType: string = '',
    public invoiceNumber: string = '',
    public authority: string = '',
    public income: number | string = 0,
    public outcome: number | string = 0,
    public quantitybalance: number = 0
  ) {}
}

export class InventoryNetCombinedResponse {
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

  constructor(init?: Partial<InventoryNetCombinedResponse>) {
    this.summary = init?.summary || {
      fromDate: '',
      shopItemId: 0,
      storeId: 0,
      toDate: '',
      inQuantity: 0,
      outQuantity: 0,
      quantitybalance: 0,
      costBalance: 0
    };
    this.transactions = init?.transactions || [];
  }
}

export class InventoryNetCombinedTransaction {
  constructor(
    public date: string = '',
    public flagId: number = 0,
    public flagName: string = '',
    public invoiceNumber: string = '',
    public notes: string | null = null,
    public inQuantity: number = 0,
    public outQuantity: number = 0,
    public quantity: number = 0,
    public balance: number = 0,
    public price: number = 0,
    public totalPrice: number = 0,
    public averageCost: number = 0,
    public itemInOut: number = 0,
    public supplierName: string | null = null,
    public studentName: string | null = null,
    public storeName: string | null = null,
    public storeToName: string | null = null
  ) {}
}
