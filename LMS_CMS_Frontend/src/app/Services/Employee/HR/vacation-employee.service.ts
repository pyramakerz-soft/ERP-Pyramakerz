import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { VacationEmployee } from '../../../Models/HR/vacation-employee';

@Injectable({
  providedIn: 'root'
})
export class VacationEmployeeService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  Get(DomainName: string, pageNumber: number, pageSize: number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<{ data: VacationEmployee[], pagination: any }>(`${this.baseUrl}/VacationEmployee?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers });
  }

  GetByID(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<VacationEmployee>(`${this.baseUrl}/VacationEmployee/${id}`, { headers })
  }

    GetBalanceAndUsedVacationEmployee(EmployeeId: number,VacationId : number , date : string , DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<VacationEmployee>(`${this.baseUrl}/VacationEmployee/GetBalanceAndUsedVacationEmployee/${EmployeeId}/${VacationId}/${date}`, { headers })
  }

  Add(VacationEmployee: VacationEmployee, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.baseUrl}/VacationEmployee`, VacationEmployee, { headers, responseType: 'text' as 'json' });
  }

  Edit(VacationEmployee: VacationEmployee, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<VacationEmployee>(`${this.baseUrl}/VacationEmployee`, VacationEmployee, { headers });
  }

  Delete(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/VacationEmployee/${id}`, { headers })
  }

  GetVacationReport(jobCategoryId: number, jobId: number, employeeId: number, dateFrom: string, dateTo: string, DomainName: string) {
  if (DomainName != null) {
    this.header = DomainName;
  }
  
  const token = localStorage.getItem("current_token");
  const headers = new HttpHeaders()
    .set('domain-name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json');
  
  const requestBody = {
    jobCategoryId: jobCategoryId,
    jobId: jobId,
    employeeId: employeeId,
    dateFrom: dateFrom,
    dateTo: dateTo
  };
  
  return this.http.post<any[]>(`${this.baseUrl}/VacationEmployee/report`, requestBody, { headers });
}

}

