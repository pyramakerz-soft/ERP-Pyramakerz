import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { CertificateStudent, CertificateStudentReportItem} from '../../../Models/SocialWorker/certificate-student';


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

  ProxyImage(url: string, domainName: string) {
    const token = localStorage.getItem("current_token");

    const headers = new HttpHeaders()
      .set('domain-name', domainName || '')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'image/*');

    return this.http.get(`${this.baseUrl}/CertificateStudent/ProxyImage?url=${url}`, {
      headers,
      responseType: 'blob' 
    });
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
    return this.http.delete(`${this.baseUrl}/CertificateStudent/${id}`, { headers })
  }
  
  GetCertificateToStudentReport(
    SchoolId: number,
    GradeId: number,
    ClassroomId: number,
    StudentId: number,
    DomainName: string
  ) {
    if (DomainName != null) {
      this.header = DomainName
    }
    
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    const url = `${this.baseUrl}/CertificateStudent/CertificateToStudentReport?SchoolId=${SchoolId}&GradeId=${GradeId}&ClassroomId=${ClassroomId}&StudentId=${StudentId}`;
    return this.http.get<CertificateStudentReportItem[]>(url, { headers });
  }
    }
 








