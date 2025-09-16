import { Injectable } from '@angular/core';
import { BankEmployee } from '../../../Models/Accounting/bank-employee';
import { ApiService } from '../../api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BankEmployeeService {
  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }
 
  Get(id:number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<BankEmployee[]>(`${this.baseUrl}/BankEmplloyee/GetByBankID/${id}`, { headers })
  }
 
  Add(bankEmployee: BankEmployee, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.baseUrl}/BankEmplloyee`, bankEmployee, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }  
}
