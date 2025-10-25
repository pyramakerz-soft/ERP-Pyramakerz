import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { MaintenanceItem } from '../../../Models/Maintenance/maintenance-item';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceItemService {

  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl; 
  }

  
  Get(DomainName: string): Observable<MaintenanceItem[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header) 
      .set('Authorization', `Bearer ${token}`) 
      .set('accept', '*/*'); 
    return this.http.get<MaintenanceItem[]>(`${this.baseUrl}/MaintenanceItem`, { headers });
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
      return this.http.get<MaintenanceItem[]>(`${this.baseUrl}/MaintenanceItem/${id}`, { headers })
    }


  Add(MaintenanceItem: MaintenanceItem, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*')
      .set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.baseUrl}/MaintenanceItem`, MaintenanceItem, {
      headers: headers,
      responseType: 'text' as 'json',
    });
  }

  
  Edit(MaintenanceItem: MaintenanceItem, DomainName: string): Observable<MaintenanceItem> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*')
      .set('Content-Type', 'application/json');
    return this.http.put<MaintenanceItem>(`${this.baseUrl}/MaintenanceItem`, MaintenanceItem, { headers });
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

  
  return this.http.delete(`${this.baseUrl}/MaintenanceItem?id=${id}`, { headers, responseType: 'text' });
}
}
