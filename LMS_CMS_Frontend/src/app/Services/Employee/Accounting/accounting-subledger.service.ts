// Services/Employee/Accounting/accounting-subledger.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { AccountSubledgerResponse } from '../../../Models/Accounting/account-subledger-report';


@Injectable({
  providedIn: 'root'
})
export class AccountingSubledgerService {
  baseUrl = "";
  header = "";

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  GetAccountsLedger(
    fromDate: Date,
    toDate: Date,
    linkFileID: number,
    accountID: number = 0,
    pageNumber: number = 1,
    pageSize: number = 10,
    DomainName: string
  ): Observable<AccountSubledgerResponse> {
    if (DomainName != null) {
      this.header = DomainName;
    }

    // Format dates as YYYY-MM-DD
    const formattedFromDate = fromDate.toISOString().split('T')[0];
    const formattedToDate = toDate.toISOString().split('T')[0];

    let params = new HttpParams()
      .set('fromDate', formattedFromDate)
      .set('toDate', formattedToDate)
      .set('linkFileID', linkFileID.toString())
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (accountID > 0) {
      params = params.set('accountID', accountID.toString());
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<AccountSubledgerResponse>(`${this.baseUrl}/AccountingSubledgerReport/GetAccountsLedger`, {
      headers,
      params
    });
  }
}