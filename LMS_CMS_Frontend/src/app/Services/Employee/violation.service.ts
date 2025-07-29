import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Violation } from '../../Models/Violation/violation';
import { ViolationAdd } from '../../Models/Administrator/violation-add';
import { ViolationType } from '../../Models/Violation/violation-type';

@Injectable({
  providedIn: 'root'
})
export class ViolationService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  GetByEmployeeType(employeeTypeId: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<ViolationType[]>(`${this.baseUrl}/ViolationType/ByEmployeeType/${employeeTypeId}`, { headers });
  }

  GetViolationType(DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<ViolationType[]>(`${this.baseUrl}/ViolationType`, { headers });
  }

  GetViolationTypeByID(id: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<ViolationType>(`${this.baseUrl}/ViolationType/${id}`, { headers });
  }

  Add(violationType: ViolationType, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/ViolationType`, violationType, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }

  Edit(violationType: ViolationType, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put(`${this.baseUrl}/ViolationType`, violationType, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }

  Delete(id: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/ViolationType/${id}`, { headers });
  }
}
