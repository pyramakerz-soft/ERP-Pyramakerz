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

export interface MaintenanceReportRequest {
  fromDate: string;
  toDate: string;
  itemId: number;
  maintenanceEmployeeId: number;
  companyId: number;
}

export interface MaintenanceReport {
  getMaintenanceReport(domainName: string, request: MaintenanceReportRequest): Observable<unknown>;
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
      .set('accept', '*/*');

    // Convert the request object to query parameters
    let params = new HttpParams();
    if (request.fromDate) params = params.set('fromDate', request.fromDate);
    if (request.toDate) params = params.set('toDate', request.toDate);
    if (request.itemId) params = params.set('itemId', request.itemId.toString());
    if (request.maintenanceEmployeeId) params = params.set('maintenanceEmployeeId', request.maintenanceEmployeeId.toString());
    if (request.companyId) params = params.set('companyId', request.companyId.toString());

    return this.http.get<MaintenanceReport[]>(
      `${this.baseUrl}/Maintenance/report`,
      { headers, params }
    );
  }
}
