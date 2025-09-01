import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { SocialWorkerMedalStudent } from '../../../Models/SocialWorker/social-worker-medal-student';
import { MedalStudentReportItem } from '../../../Models/LMS/student-medal';

@Injectable({
  providedIn: 'root'
})
export class SocialWorkerMedalStudentService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  Add(socialWorkerMedalStudent: SocialWorkerMedalStudent, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/SocialWorkerMedalStudent`, socialWorkerMedalStudent, {
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
    return this.http.get<SocialWorkerMedalStudent[]>(`${this.baseUrl}/SocialWorkerMedalStudent/GetByStudentId/${id}`, { headers })
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
    return this.http.delete(`${this.baseUrl}/SocialWorkerMedalStudent/${id}`, { headers })
  }

    GetMedalToStudentReport(
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

    const url = `${this.baseUrl}/Medal/MedalToStudentReport?SchoolId=${SchoolId}&GradeId=${GradeId}&ClassroomId=${ClassroomId}&StudentId=${StudentId}`;
    return this.http.get<MedalStudentReportItem[]>(url, { headers });
  }
}
