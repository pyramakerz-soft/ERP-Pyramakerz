import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { MaintenanceCompanies } from '../../../Models/Maintenance/maintenance-companies';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceCompaniesService {

  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl; 
  }

  
  Get(DomainName: string): Observable<MaintenanceCompanies[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header) 
      .set('Authorization', `Bearer ${token}`) 
      .set('accept', '*/*'); 
    return this.http.get<MaintenanceCompanies[]>(`${this.baseUrl}/MaintenanceCompany`, { headers });
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
      return this.http.get<MaintenanceCompanies[]>(`${this.baseUrl}/MaintenanceCompany/${id}`, { headers })
    }


  Add(MaintenanceCompany: MaintenanceCompanies, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*')
      .set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.baseUrl}/MaintenanceCompany`, MaintenanceCompany, {
      headers: headers,
      responseType: 'text' as 'json',
    });
  }

  
  Edit(MaintenanceCompany: MaintenanceCompanies, DomainName: string): Observable<MaintenanceCompanies> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*')
      .set('Content-Type', 'application/json');
    return this.http.put<MaintenanceCompanies>(`${this.baseUrl}/MaintenanceCompany`, MaintenanceCompany, { headers });
  }

  Delete(id: number, DomainName: string): Observable<any> {
  if (DomainName != null) {
    this.header = DomainName;
  }
  const token = localStorage.getItem('current_token');
  const headers = new HttpHeaders()
    .set('Domain-Name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('accept', '*/*')
    .set('Content-Type', 'application/json');

  
  return this.http.delete(`${this.baseUrl}/MaintenanceCompany?id=${id}`, { headers, responseType: 'text' });
}
}
