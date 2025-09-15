// maintenance.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';

export interface Maintenance {
  id: number;
  date: string;
  itemID: number;
  itemArabicName: string;
  itemEnglishName: string;
  companyEnglishName: string | null;
  companyArabicName: string | null;
  companyID: number;
  employeeEnglishName: string | null;
  employeeArabicName: string | null;
  maintenanceEmployeeID: number;
  cost: number;
  note: string;
}

export interface MaintenanceCreate {
  date: string;
  itemID: number;
  companyID: number;
  maintenanceEmployeeID: number;
  cost: number | null;
  note: string;
}

export interface MaintenanceReport {
  id: number;
  date: string;
  itemID: number;
  itemArabicName: string;
  itemEnglishName: string;
  companyEnglishName: string | null;
  companyArabicName: string | null;
  companyID: number;
  employeeEnglishName: string | null;
  employeeArabicName: string | null;
  maintenanceEmployeeID: number;
  cost: number;
  note: string;
}

export interface MaintenanceReportRequest {
  fromDate: string;
  toDate: string;
  itemId: number;
  maintenanceEmployeeId: number | null;
  companyId: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  getAll(DomainName: string): Observable<Maintenance[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');
    
    return this.http.get<Maintenance[]>(`${this.baseUrl}/Maintenance`, { headers });
  }

  getById(id: number, DomainName: string): Observable<Maintenance> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');
    
    return this.http.get<Maintenance>(`${this.baseUrl}/Maintenance/${id}`, { headers });
  }

  create(maintenance: MaintenanceCreate, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/Maintenance`, maintenance, { headers });
  }

  update(id: number, maintenance: MaintenanceCreate, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put(`${this.baseUrl}/Maintenance/${id}`, maintenance, { headers });
  }

  delete(id: number, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');

    return this.http.delete(`${this.baseUrl}/Maintenance/${id}`, { headers });
  }

  

  getMaintenanceReport(
    DomainName: string,
    request: MaintenanceReportRequest
  ): Observable<MaintenanceReport[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*')
      .set('Content-Type', 'application/json');

    // Send as POST request with parameters in the body
    return this.http.post<MaintenanceReport[]>(
      `${this.baseUrl}/Maintenance/report`,
      request,
      { headers }
    );
  }
  //https://localhost:7205/api/with-domain/Maintenance/report?fromDate=2025-07-07&toDate=2025-09-15&itemId=1&maintenanceEmployeeId=1&companyId=1
  //https://localhost:7205/api/with-domain/Maintenance/report
}
