// Services/Employee/Accounting/accounting-balance.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { AccountBalanceResponse } from '../../../Models/Accounting/accounting-balance';

@Injectable({
  providedIn: 'root'
})
export class AccountingBalanceResponse {
  baseUrl = "";
  header = "";

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  GetAccountBalance(
    toDate: Date,
    linkFileID: number,
    accountID: number = 0,
    zeroBalance: boolean = true,
    positiveBalance: boolean = true,
    negativeBalance: boolean = true,
    pageNumber: number = 1,
    pageSize: number = 10,
    DomainName: string
  ): Observable<AccountBalanceResponse> {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const formattedDate = toDate.toISOString().split('T')[0];

    let params = new HttpParams()
      .set('toDate', formattedDate)
      .set('linkFileID', linkFileID.toString())
      .set('zeroBalance', zeroBalance.toString())
      .set('positiveBalance', positiveBalance.toString())
      .set('negativeBalance', negativeBalance.toString())
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

    return this.http.get<AccountBalanceResponse>(`${this.baseUrl}/AccountBalancesReports/GetAccountBalance`, {
      headers,
      params
    });
  }
}