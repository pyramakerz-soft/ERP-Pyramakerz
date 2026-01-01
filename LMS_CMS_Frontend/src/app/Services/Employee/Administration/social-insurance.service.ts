import { Domain } from './../../../Models/domain';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { SocialInsurance, SocialInsuranceCreate } from '../../../Models/Administrator/SocialInsurance';

@Injectable({
  providedIn: 'root'
})
export class SocialInsuranceService {

  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

    Get(DomainName: string): Observable<SocialInsurance[]> {
        if (DomainName != null) this.header = DomainName;
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<SocialInsurance[]>(`${this.baseUrl}/SocialInsurance`, { headers });
  }

  GetById(id: number, DomainName: string): Observable<SocialInsurance> {
    if (DomainName != null) this.header = DomainName;
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<SocialInsurance>(`${this.baseUrl}/SocialInsurance/${id}`, { headers });
  }

  Add(record: SocialInsuranceCreate, DomainName: string): Observable<any> {
    if (DomainName != null) this.header = DomainName;
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.baseUrl}/SocialInsurance`, record, { headers });
  }

  Edit(record: { id: number, insuranceOfficeName: string }, DomainName: string): Observable<any> {
    if (DomainName != null) this.header = DomainName;
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put(`${this.baseUrl}/SocialInsurance`, record, { headers });
  }


  Delete(id: number, DomainName: string): Observable<any> {
    if (DomainName != null) this.header = DomainName;

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.delete<any>(`${this.baseUrl}/SocialInsurance/${id}`, { headers });
  }
}
