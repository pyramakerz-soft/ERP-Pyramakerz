import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { AccountStatementResponse } from '../../../Models/Accounting/accounting-statement';

@Injectable({
  providedIn: 'root'
})
export class AccountStatementService {
  baseUrl = "";
  header = "";

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  GetAccountStatement(
    fromDate: Date,
    toDate: Date,
    linkFileID: number,
    subAccountID: number,
    pageNumber: number,
    pageSize: number,
    DomainName: string
  ): Observable<AccountStatementResponse> {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    // Format dates to YYYY-MM-DD
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    let params = new HttpParams()
      .set('linkFileID', linkFileID.toString())
      .set('fromDate', formatDate(fromDate))
      .set('toDate', formatDate(toDate))
      .set('SubAccountID', subAccountID.toString())
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<AccountStatementResponse>(
      `${this.baseUrl}/AccountStatementReports/GetAccountStatement`,
      { headers, params }
    );
  }
}