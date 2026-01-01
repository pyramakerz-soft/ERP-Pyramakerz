import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { DeductionCategory, DeductionCategoryCreate } from '../../../Models/HR/deductionCategory';

@Injectable({
  providedIn: 'root'
})
export class DeductionCategoryService {

  baseUrl = '';
  header = '';

  constructor(
    public http: HttpClient,
    public ApiServ: ApiService
  ) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  // ================= Get All =================
  Get(DomainName: string): Observable<DeductionCategory[]> {
    if (DomainName != null) this.header = DomainName;

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<DeductionCategory[]>(
      `${this.baseUrl}/DeductionCategory`,
      { headers }
    );
  }

  // ================= Get By Id =================
  GetById(id: number, DomainName: string): Observable<DeductionCategory> {
    if (DomainName != null) this.header = DomainName;

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<DeductionCategory>(
      `${this.baseUrl}/DeductionCategory/${id}`,
      { headers }
    );
  }

  // ================= Add =================
  Add(record: DeductionCategoryCreate, DomainName: string): Observable<any> {
    if (DomainName != null) this.header = DomainName;

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(
      `${this.baseUrl}/DeductionCategory`,
      record,
      { headers }
    );
  }

  // ================= Edit =================
  Edit(record: DeductionCategory, DomainName: string): Observable<any> {
    if (DomainName != null) this.header = DomainName;

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put<any>(
      `${this.baseUrl}/DeductionCategory`,
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
      `${this.baseUrl}/DeductionCategory/${id}`,
      { headers }
    );
  }
}
