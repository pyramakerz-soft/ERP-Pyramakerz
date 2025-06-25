// tax-issuer.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TaxIssuer } from '../../../Models/Administrator/tax-issuer.model';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class TaxIssuerService {
  baseUrl = "";
  header = "";

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  } 

  getById(id: number, DomainName: string): Observable<TaxIssuer> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<TaxIssuer>(`${this.baseUrl}/TaxIssuer/${id}`, { headers });
  }
 
  edit(taxIssuer: TaxIssuer, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/TaxIssuer/Edit`, taxIssuer, { headers });
  }
}