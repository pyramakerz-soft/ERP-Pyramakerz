import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { CertificateStudent } from '../../../Models/SocialWorker/certificate-student';

@Injectable({
  providedIn: 'root'
})
export class CertificateStudentService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  Add(certificateStudent: CertificateStudent, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/CertificateStudent`, certificateStudent, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }

  GetByStudentID(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<CertificateStudent[]>(`${this.baseUrl}/CertificateStudent/GetByStudentId/${id}`, { headers })
  }
}
