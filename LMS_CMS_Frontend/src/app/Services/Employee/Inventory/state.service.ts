//state saver 
import { Injectable } from '@angular/core';
import { ElectronicInvoice } from '../../../Models/zatca/electronic-invoice';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private invoiceState: {
    selectedSchoolId: number | null;
    dateFrom: string;
    dateTo: string;
    transactions: ElectronicInvoice[];
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalRecords: number;
  } | null = null;

  setInvoiceState(state: any) {
    this.invoiceState = state;
  }

  getInvoiceState() {
    return this.invoiceState;
  }

  clearInvoiceState() {
    this.invoiceState = null;
  }
}