import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { CertificatesIssuer } from '../../../Models/ETA/certificates-issuer';

@Injectable({
  providedIn: 'root'
})
export class CertificatesIssuerService {
  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }
 
  Get(DomainName: string, pageNumber:number, pageSize:number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
      return this.http.get<{ data: CertificatesIssuer[], pagination: any }>(`${this.baseUrl}/CertificatesIssuer/getAll?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers });
  }

   GetByID(id: number,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<CertificatesIssuer>(`${this.baseUrl}/CertificatesIssuer/${id}`, { headers })
  }

  Add(CertificatesIssuer: CertificatesIssuer, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/CertificatesIssuer/Add`, CertificatesIssuer, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }

  Edit(CertificatesIssuer: CertificatesIssuer, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/CertificatesIssuer/Edit`, CertificatesIssuer, { headers });
  }

  Delete(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/CertificatesIssuer/${id}`, { headers })
  }
}
