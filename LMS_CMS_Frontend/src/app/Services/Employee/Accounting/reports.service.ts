import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FeesActivation } from '../../../Models/Accounting/fees-activation';
import { AccountingConstraintsResponse } from '../../../Models/Accounting/accounting-constraints-report';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  GetPayablesByDate(
    startDate: string,
    endDate: string,
    DomainName: string,
    pageNumber: number,
    pageSize: number
  ) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<{ data: FeesActivation[]; pagination: any }>(
      `${this.baseUrl}/AccountingReports/GetPayablesByDate?startDate=${startDate}&endDate=${endDate}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { headers }
    );
  }

  GetReceivablesByDate(
    startDate: string,
    endDate: string,
    DomainName: string,
    pageNumber: number,
    pageSize: number
  ) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<{ data: FeesActivation[]; pagination: any }>(
      `${this.baseUrl}/AccountingReports/GetReceivablesByDate?startDate=${startDate}&endDate=${endDate}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { headers }
    );
  }

  GetInstallmentDeductionsByDate(
    startDate: string,
    endDate: string,
    DomainName: string,
    pageNumber: number,
    pageSize: number
  ) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<{ data: FeesActivation[]; pagination: any }>(
      `${this.baseUrl}/AccountingReports/GetInstallmentDeductionsByDate?startDate=${startDate}&endDate=${endDate}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { headers }
    );
  }

  GetAccountingEntriesByDate(
    startDate: string,
    endDate: string,
    DomainName: string,
    pageNumber: number,
    pageSize: number
  ) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<{ data: FeesActivation[]; pagination: any }>(
      `${this.baseUrl}/AccountingReports/GetAccountingEntriesByDate?startDate=${startDate}&endDate=${endDate}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { headers }
    );
  }

  GetFeesActivationByDate(
    startDate: string,
    endDate: string,
    DomainName: string,
    pageNumber: number,
    pageSize: number
  ) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<{ data: FeesActivation[]; pagination: any }>(
      `${this.baseUrl}/AccountingReports/GetFeesActivationByDate?startDate=${startDate}&endDate=${endDate}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { headers }
    );
  }

  GetAccountingEntriesReportByDate(
    startDate: string,
    endDate: string,
    DomainName: string,
    pageNumber: number,
    pageSize: number
  ) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<AccountingConstraintsResponse>(
      `${this.baseUrl}/AccountingEntriesReport/AccountingEntries?fromDate=${startDate}&toDate=${endDate}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { headers }
    );
  }

GetSupplierStatement(
  startDate: string,
  endDate: string,
  subAccountNumber: number,
  DomainName: string,
  pageNumber: number,
  pageSize: number
) {
  if (DomainName != null) {
    this.header = DomainName;
  }
  const token = localStorage.getItem('current_token');
  const headers = new HttpHeaders()
    .set('domain-name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json');
  return this.http.get<any>(
    `${this.baseUrl}/AccountStatementReports/GetSupplierStatement?fromDate=${startDate}&toDate=${endDate}&SubAccountNumber=${subAccountNumber}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
    { headers }
  );
}

GetSafeStatement(
  startDate: string,
  endDate: string,
  subAccountNumber: number,
  DomainName: string,
  pageNumber: number,
  pageSize: number
) {
  if (DomainName != null) {
    this.header = DomainName;
  }
  const token = localStorage.getItem('current_token');
  const headers = new HttpHeaders()
    .set('domain-name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json');
  return this.http.get<any>(
    `${this.baseUrl}/AccountStatementReports/GetSafeStatement?fromDate=${startDate}&toDate=${endDate}&SubAccountNumber=${subAccountNumber}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
    { headers }
  );
}

GetBankStatement(
  startDate: string,
  endDate: string,
  subAccountNumber: number,
  DomainName: string,
  pageNumber: number,
  pageSize: number
) {
  if (DomainName != null) {
    this.header = DomainName;
  }
  const token = localStorage.getItem('current_token');
  const headers = new HttpHeaders()
    .set('domain-name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json');
  return this.http.get<any>(
    `${this.baseUrl}/AccountStatementReports/GetBankStatement?fromDate=${startDate}&toDate=${endDate}&SubAccountNumber=${subAccountNumber}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
    { headers }
  );
}
}
