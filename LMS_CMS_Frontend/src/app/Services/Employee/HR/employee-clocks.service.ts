import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { EmployeeClocks } from '../../../Models/HR/employee-clocks';
@Injectable({
  providedIn: 'root'
})
export class EmployeeClocksService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  Get(empId:number ,year:number , month : number , DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<EmployeeClocks[]>(`${this.baseUrl}/EmployeeClocks/ByMonth/${empId}/${year}/${month}`, { headers });
  }

  Add(EmployeeClocks: EmployeeClocks, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.baseUrl}/EmployeeClocks`, EmployeeClocks, { headers, responseType: 'text' as 'json' });
  }

  Edit(EmployeeClocks: EmployeeClocks[], DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<EmployeeClocks[]>(`${this.baseUrl}/EmployeeClocks`, EmployeeClocks, { headers });
  }

}
