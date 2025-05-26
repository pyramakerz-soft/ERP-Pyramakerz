import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { ClassroomSubject } from '../../../Models/LMS/classroom-subject';

@Injectable({
  providedIn: 'root'
})
export class ClassroomSubjectService {
  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  GetByClassId(classID:number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<ClassroomSubject[]>(`${this.baseUrl}/ClassroomSubject/GetByClassroom/${classID}`, { headers });
  }

  GetByID(id:number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<ClassroomSubject>(`${this.baseUrl}/ClassroomSubject/${id}`, { headers });
  }

  Generate(classID: number, DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/ClassroomSubject/Generate/${classID}`, {}, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }

  Edit(classroomSubject: ClassroomSubject, DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/ClassroomSubject`, classroomSubject, { headers });
  }

  IsSubjectHide(classroomSubject: ClassroomSubject, DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/ClassroomSubject/IsSubjectHide`, classroomSubject, { headers });
  }
}
