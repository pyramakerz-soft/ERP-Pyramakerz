// src/app/Models/zatca/electronic-invoice.ts
export interface ElectronicInvoice {
  id: number;
  invoiceNumber: string;
  date: string;
  isCash: boolean;
  isVisa: boolean;
  cashAmount: number;
  visaAmount: number;
  remaining: number;
  total: number;
  totalWithVat: number | null;
  vatAmount: number | null;
  vatPercent: number | null;
  invoiceHash: string | null;
  qrCode: string | null;
  uuid: string | null;
  status: string | null;
  isValid: boolean | null;
  qrImage: string | null;
  notes: string | null;
  storeID: number;
  studentID: number | null;
  saveID: number | null;
  bankID: number | null;
  flagId: number;
  supplierId: number | null;
  storeToTransformId: number | null;
  schoolId: number;
  schoolPCId: number;
  storeName?: string;
  schoolName?: string;
  flagEnName?: string;
  student?: string;
  studentAddress?: string;
  
  inventoryDetails?: {
    id: number;
    price: number;
    totalPrice: number;
    quantity: number;
    notes: string;
    shopItemID: number;
    inventoryMasterId: number;
    itemName?: string;
    tax?: number;
  }[];
}