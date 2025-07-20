import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountingConfiguration } from '../../../Models/Accounting/accounting-configuration';

@Injectable({
  providedIn: 'root'
})
export class AccountingConfigurationService {
  baseUrl = "";
  header = "";

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  } 

  getById(id: number, DomainName: string): Observable<AccountingConfiguration> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<AccountingConfiguration>(`${this.baseUrl}/AccountingConfigs/${id}`, { headers });
  }
 
  edit(accountingConfiguration: AccountingConfiguration, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/AccountingConfigs/Edit`, accountingConfiguration, { headers });
  }
}
