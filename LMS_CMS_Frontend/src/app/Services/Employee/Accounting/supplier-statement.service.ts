import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupplierStatementService {
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  GetSupplierStatement(
    startDate: string,
    endDate: string,
    subAccountNumber: number,
    DomainName: string,
    pageNumber: number,
    pageSize: number
  ): Observable<{
    data: any[];
    firstPeriodBalance: number;
    fullTotals: { totalDebit: number; totalCredit: number; difference: number };
    pagination: any;
  }> {
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
      //https://localhost:7205/api/with-domain/AccountStatementReports/GetSupplierStatement?fromDate=2024-08-12&toDate=2025-08-12&SubAccountNumber=1&pageNumber=1&pageSize=10
      //localhost:7205/api/with-domain/AccountStatementReports/GetSupplierStatement?fromDate=2025-06-04&toDate=2025-08-13&SubAccountNumber=null&pageNumber=1&pageSize=10
      { headers }
    );
  }
}