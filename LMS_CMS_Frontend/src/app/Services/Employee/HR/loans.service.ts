import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { Loans } from '../../../Models/HR/loans';
import { LoanStatus } from '../../../Models/HR/loan-status';

@Injectable({
  providedIn: 'root'
})
export class LoansService {

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
    return this.http.get<{ data: Loans[], pagination: any }>(`${this.baseUrl}/Loans?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers });
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
    return this.http.get<Loans>(`${this.baseUrl}/Loans/${id}`, { headers })
  }

  Add(Loans: Loans, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.baseUrl}/Loans`, Loans, { headers, responseType: 'text' as 'json' });
  }

  Edit(Loans: Loans, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<Loans>(`${this.baseUrl}/Loans`, Loans, { headers });
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
    return this.http.delete(`${this.baseUrl}/Loans/${id}`, { headers })
  }

  GetLoansStatus(EmpId: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<LoanStatus[]>(`${this.baseUrl}/Loans/LoansStatus?EmpId=${EmpId}`, { headers })
  }


  GetLoansReport(jobCategoryId: number, jobId: number, employeeId: number, dateFrom: string, dateTo: string, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    const requestBody = {
      categoryId: jobCategoryId,
      jobId: jobId,
      employeeId: employeeId,
      dateFrom: dateFrom,
      dateTo: dateTo
    };

    console.log(requestBody)
    return this.http.post<any[]>(`${this.baseUrl}/Loans/report`, requestBody, { headers });
  }
}
