// maintenance.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { Maintenance } from '../../../Models/Maintenance/maintenance';

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

  getAllWithPaggination(DomainName: string, pageNumber: number, pageSize: number) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');
    return this.http.get<{ data: Maintenance[], pagination: any }>(`${this.baseUrl}/Maintenance/WithPaggination?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers });
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

  create(maintenance: Maintenance, DomainName: string): Observable<any> {
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

update(maintenance: Maintenance, DomainName: string): Observable<any> {
  if (DomainName != null) {
    this.header = DomainName;
  }
  const token = localStorage.getItem('current_token');
  const headers = new HttpHeaders()
    .set('Domain-Name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json');

  return this.http.put(`${this.baseUrl}/Maintenance`, maintenance, { headers });
}

  delete(id: number, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`) 

    return this.http.delete(`${this.baseUrl}/Maintenance/${id}`, { headers });
  }

  

getMaintenanceReport(
  DomainName: string,
  request: Maintenance
): Observable<Maintenance[]> {
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
  return this.http.post<Maintenance[]>(
    `${this.baseUrl}/Maintenance/report`,
    request,
    { headers }
  );
}
  //https://localhost:7205/api/with-domain/Maintenance/report?fromDate=2025-07-07&toDate=2025-09-15&itemId=1&maintenanceEmployeeId=1&companyId=1
  //https://localhost:7205/api/with-domain/Maintenance/report
}
