import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { RegisteredEmployee } from '../../../Models/Administrator/registered-employee';

@Injectable({
  providedIn: 'root'
})
export class RegisteredEmployeeService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }
 
  Get(DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<RegisteredEmployee[]>(`${this.baseUrl}/RegisteredEmployee`, { headers })
  }

  GetById(id:number ,DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<RegisteredEmployee>(`${this.baseUrl}/RegisteredEmployee/${id}`, { headers })
  } 
 
  Add(registeredEmployee: RegisteredEmployee, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.baseUrl}/RegisteredEmployee`, registeredEmployee, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  } 
 
  Edit(registeredEmployee: RegisteredEmployee, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put<any>(`${this.baseUrl}/RegisteredEmployee`, registeredEmployee, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  } 

  Reject(registeredEmployeeID: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<any>(`${this.baseUrl}/RegisteredEmployee/Reject/${registeredEmployeeID}`, {}, { headers });
  }

  Accept(registeredEmployee: RegisteredEmployee, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<any>(`${this.baseUrl}/RegisteredEmployee/Accept`, registeredEmployee, { headers });
  }
}
