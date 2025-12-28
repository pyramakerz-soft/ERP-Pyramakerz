import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { AppointmentDocument, AppointmentDocumentCreate } from '../../../Models/Administrator/appointmentDocument';

@Injectable({
  providedIn: 'root'
})
export class AppointmentDocumentService {

  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  // جلب كل المستندات
  Get(DomainName: string): Observable<AppointmentDocument[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<AppointmentDocument[]>(`${this.baseUrl}/AppointmentDocument`, { headers });
  }

  GetById(id: number, DomainName: string): Observable<AppointmentDocument> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<AppointmentDocument>(`${this.baseUrl}/AppointmentDocument/${id}`, { headers });
  }


  Add(document: AppointmentDocumentCreate, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.baseUrl}/AppointmentDocument`, document, {
      headers: headers,
      responseType: 'text' as 'json' 
    });
  }

  Edit(document: AppointmentDocument, DomainName: string): Observable<AppointmentDocument> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put<AppointmentDocument>(`${this.baseUrl}/AppointmentDocument`, document, { headers });
  }


  Delete(id: number, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.delete<any>(`${this.baseUrl}/AppointmentDocument/${id}`, { headers });
  }
}