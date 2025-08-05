import { Injectable } from '@angular/core';
import { RemedialClassroom } from '../../../Models/LMS/remedial-classroom';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class RemedialClassroomService {

  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  GetBySchoolId(SchoolId: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<RemedialClassroom[]>(`${this.baseUrl}/RemedialClassroom/BySchoolId/${SchoolId}`, { headers });
  }

  ByGradeId(GradeId: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<RemedialClassroom[]>(`${this.baseUrl}/RemedialClassroom/ByGradeId/${GradeId}`, { headers });
  }

  GetById(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<RemedialClassroom>(`${this.baseUrl}/RemedialClassroom/${id}`, { headers });
  }

  Add(RemedialClassroom: RemedialClassroom, DomainName: string) {
      if (DomainName != null) {
        this.header = DomainName;
      }
      const token = localStorage.getItem('current_token');
      const headers = new HttpHeaders()
        .set('domain-name', this.header)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json');
  
      return this.http.post(`${this.baseUrl}/RemedialClassroom`, RemedialClassroom, {
        headers: headers,
        responseType: 'text' as 'json',
      });
    }
  
    Edit(RemedialClassroom: RemedialClassroom, DomainName: string) {
      if (DomainName != null) {
        this.header = DomainName;
      }
      const token = localStorage.getItem('current_token');
      const headers = new HttpHeaders()
        .set('domain-name', this.header)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json');
      return this.http.put(`${this.baseUrl}/RemedialClassroom`, RemedialClassroom, { headers });
    }
  
    Delete(id: number, DomainName: string) {
      if (DomainName != null) {
        this.header = DomainName;
      }
      const token = localStorage.getItem('current_token');
      const headers = new HttpHeaders()
        .set('domain-name', this.header)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json');
      return this.http.delete(`${this.baseUrl}/RemedialClassroom/${id}`, { headers });
    }
}
