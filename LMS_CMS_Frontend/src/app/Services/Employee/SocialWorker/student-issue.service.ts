import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { StudentIssue, StudentIssueReportItem } from '../../../Models/SocialWorker/student-issue';

@Injectable({
  providedIn: 'root'
})
export class StudentIssueService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  Get(DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<StudentIssue[]>(`${this.baseUrl}/StudentIssue`, { headers });
  }

  GetByID(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<StudentIssue>(`${this.baseUrl}/StudentIssue/${id}`, { headers })
  }

  Add(studentIssue: StudentIssue, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.baseUrl}/StudentIssue`, studentIssue, { headers, responseType: 'text' as 'json' });
  }

  Edit(studentIssue: StudentIssue, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<StudentIssue>(`${this.baseUrl}/StudentIssue`, studentIssue, { headers });
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
    return this.http.delete(`${this.baseUrl}/StudentIssue/${id}`, { headers })
  }

    GetStudentIssueReport(
    DomainName: string,
    fromDate: string,
    toDate: string,
    schoolId?: number,
    gradeId?: number,
    classroomId?: number,
    studentId?: number,
    issuesTypeId?: number
  ) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    let params = new URLSearchParams();
    params.append('FromDate', fromDate);
    params.append('ToDate', toDate);
    
    if (schoolId) params.append('SchoolId', schoolId.toString());
    if (gradeId) params.append('GradeId', gradeId.toString());
    if (classroomId) params.append('ClassroomId', classroomId.toString());
    if (studentId) params.append('StudentId', studentId.toString());
    if (issuesTypeId) params.append('IssuesTypeId', issuesTypeId.toString());

    return this.http.get<StudentIssueReportItem[]>(`${this.baseUrl}/StudentIssue/StudentIssueReport?${params.toString()}`, { headers });
  }

}

