import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { BounsCategory, BounsCategoryCreate } from '../../../Models/HR/bounsCategory';

@Injectable({
  providedIn: 'root'
})
export class BounsCategoryService {

  baseUrl = '';
  header = '';

  constructor(
    public http: HttpClient,
    public ApiServ: ApiService
  ) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  // ================= Get All =================
  Get(DomainName: string): Observable<BounsCategory[]> {
    if (DomainName != null) this.header = DomainName;

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<BounsCategory[]>(
      `${this.baseUrl}/BounsCategory`,
      { headers }
    );
  }

  // ================= Get By Id =================
  GetById(id: number, DomainName: string): Observable<BounsCategory> {
    if (DomainName != null) this.header = DomainName;

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<BounsCategory>(
      `${this.baseUrl}/BounsCategory/${id}`,
      { headers }
    );
  }

  // ================= Add =================
  Add(record: BounsCategoryCreate, DomainName: string): Observable<any> {
    if (DomainName != null) this.header = DomainName;

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(
      `${this.baseUrl}/BounsCategory`,
      record,
      { headers }
    );
  }

  // ================= Edit =================
  Edit(record: BounsCategory, DomainName: string): Observable<any> {
    if (DomainName != null) this.header = DomainName;

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put<any>(
      `${this.baseUrl}/BounsCategory`,
      record,
      { headers }
    );
  }

  // ================= Delete =================
  Delete(id: number, DomainName: string): Observable<any> {
    if (DomainName != null) this.header = DomainName;

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.delete<any>(
      `${this.baseUrl}/BounsCategory/${id}`,
      { headers }
    );
  }
}
