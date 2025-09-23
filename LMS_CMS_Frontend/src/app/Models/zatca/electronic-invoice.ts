
export class ElectronicInvoiceInventoryDetail {
  constructor(
    public id: number = 0,
    public price: number = 0,
    public totalPrice: number = 0,
    public quantity: number = 0,
    public notes: string = '',
    public shopItemID: number = 0,
    public inventoryMasterId: number = 0,
    public itemName?: string,
    public tax?: number
  ) {}
}

export class ElectronicInvoice {
  constructor(
    public id: number = 0,
    public invoiceNumber: string = '',
    public date: string = '',
    public isCash: boolean = false,
    public isVisa: boolean = false,
    public cashAmount: number = 0,
    public visaAmount: number = 0,
    public remaining: number = 0,
    public total: number = 0,
    public totalWithVat: number | null = null,
    public vatAmount: number | null = null,
    public vatPercent: number | null = null,
    public invoiceHash: string | null = null,
    public qrCode: string | null = null,
    public uuid: string | null = null,
    public status: string | null = null,
    public isValid: boolean | null = null,
    public qrImage: string | null = null,
    public notes: string | null = null,
    public storeID: number = 0,
    public studentID: number | null = null,
    public saveID: number | null = null,
    public bankID: number | null = null,
    public flagId: number = 0,
    public supplierId: number | null = null,
    public storeToTransformId: number | null = null,
    public schoolId: number = 0,
    public schoolPCId: number = 0,
    public storeName?: string,
    public schoolName?: string,
    public flagEnName?: string,
    public student?: string,
    public studentAddress?: string,
    public inventoryDetails?: ElectronicInvoiceInventoryDetail[]
  ) {}
}