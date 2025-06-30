// school-pcs.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';
import { Observable } from 'rxjs';
import { ZatcaDevice } from '../../../Models/zatca/zatca-device';
import { SchoolPCs } from '../../../Models/Inventory/school-pcs';

@Injectable({
  providedIn: 'root'
})
export class SchoolPCsService {
  baseUrl = "";
  header = "";

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  GetAll(DomainName: string){
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<ZatcaDevice[]>(`${this.baseUrl}/SchoolPCs`, { headers });
  }

  GetBySchoolId(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<SchoolPCs[]>(`${this.baseUrl}/SchoolPCs/GetBySchoolId/${id}`, { headers })
  }

  Create(data: ZatcaDevice, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.post(`${this.baseUrl}/SchoolPCs`, data, { headers });
  }

Edit(id: number, data: ZatcaDevice, DomainName: string): Observable<ZatcaDevice> {
  if (DomainName != null) {
    this.header = DomainName;
  }
  const token = localStorage.getItem("current_token");
  const headers = new HttpHeaders()
    .set('domain-name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json');

  // Note: The endpoint doesn't include the ID in the URL
  // The ID is sent in the request body instead
  return this.http.put<ZatcaDevice>(`${this.baseUrl}/SchoolPCs`, data, { headers });
}

Delete(id: number, DomainName: string): Observable<any> {
  if (DomainName != null) {
    this.header = DomainName;
  }
  const token = localStorage.getItem("current_token");
  const headers = new HttpHeaders()
    .set('domain-name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('accept', 'text/plain'); // Accept plain text response

  return this.http.delete(`${this.baseUrl}/SchoolPCs/${id}`, {
    headers,
    responseType: 'text' // Tell HttpClient to expect text response
  });
}
GetById(id: number, DomainName: string): Observable<ZatcaDevice> {
  if (DomainName != null) {
    this.header = DomainName;
  }
  const token = localStorage.getItem("current_token");
  const headers = new HttpHeaders()
    .set('domain-name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('accept', '*/*');
    
  return this.http.get<ZatcaDevice>(`${this.baseUrl}/SchoolPCs/${id}`, { headers });
}
}