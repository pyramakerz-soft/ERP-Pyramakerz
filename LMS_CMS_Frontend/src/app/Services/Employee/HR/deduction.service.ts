import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { Deduction } from '../../../Models/HR/deduction';

@Injectable({
  providedIn: 'root'
})
export class DeductionService {

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
    return this.http.get<{ data: Deduction[], pagination: any }>(`${this.baseUrl}/Deduction?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers });
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
    return this.http.get<Deduction>(`${this.baseUrl}/Deduction/${id}`, { headers })
  }

  Add(Deduction: Deduction, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.baseUrl}/Deduction`, Deduction, { headers, responseType: 'text' as 'json' });
  }

  Edit(Deduction: Deduction, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<Deduction>(`${this.baseUrl}/Deduction`, Deduction, { headers });
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
    return this.http.delete(`${this.baseUrl}/Deduction/${id}`, { headers })
  }

GetDeductionReport(jobCategoryId: number, jobId: number, employeeId: number, dateFrom: string, dateTo: string, DomainName: string) {
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
  
  return this.http.post<any[]>(`${this.baseUrl}/Deduction/report`, requestBody, { headers });
}

}
