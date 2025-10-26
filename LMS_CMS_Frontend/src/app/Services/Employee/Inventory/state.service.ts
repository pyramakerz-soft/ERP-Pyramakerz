// state.service.ts
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

  private medicalReportState: {
    selectedTab: string;
    selectedSchool: number;
    selectedGrade: number;
    selectedClass: number;
    selectedStudent: number;
    tableData: any[];
    showTable: boolean;
    schools: any[];
    grades: any[];
    classes: any[];
    students: any[];
  } | null = null;

  // Invoice state methods
  setInvoiceState(state: any) {
    this.invoiceState = state;
  }

  getInvoiceState() {
    return this.invoiceState;
  }

  clearInvoiceState() {
    this.invoiceState = null;
  }

  setMedicalReportState(state: any) {
    this.medicalReportState = state;
  }

  getMedicalReportState() {
    return this.medicalReportState;
  }

  clearMedicalReportState() {
    this.medicalReportState = null;
  }
}