import { Injectable } from '@angular/core';
import { AssignmentStudent } from '../../../Models/LMS/assignment-student';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';
import { Assignment } from '../../../Models/LMS/assignment';

@Injectable({
  providedIn: 'root'
})
export class AssignmentStudentService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }


  GetById(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<AssignmentStudent>(`${this.baseUrl}/AssignmentStudent/GetByID/${id}`, { headers })
  }

  GetByAssignmentId(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Assignment>(`${this.baseUrl}/AssignmentStudent/GetByAssignmentId/${id}`, { headers })
  }

  GetByAssignmentClass(AssignmentId: number, ClassId: number, DomainName: string, pageNumber: number, pageSize: number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<{ data: AssignmentStudent[], pagination: any }>(`${this.baseUrl}/AssignmentStudent/GetByAssignmentIDClassID/${AssignmentId}/${ClassId}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers });
  }

  Edit(data: AssignmentStudent, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }

    const payload = {
      id: data.id,
      degree: data.degree,
      evaluationConsideringTheDelay: data.evaluationConsideringTheDelay,
      assignmentStudentQuestions: data.assignmentStudentQuestions.map(q => ({
        id: q.id,
        mark: q.mark
      }))
    };
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/AssignmentStudent`, payload, { headers });
  }

  Add(data: AssignmentStudent, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.post(`${this.baseUrl}/AssignmentStudent`, data, { headers });
  }

  AddWhenTextBookAssignment(data: AssignmentStudent, DomainName: string) {
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', DomainName || '')
      .set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('assignmentID', data.assignmentID.toString());
    formData.append('studentID', data.studentID.toString());
    if (data.file instanceof File) {
      formData.append('File', data.file);
    }
    return this.http.post(`${this.baseUrl}/AssignmentStudent/AddWhenTextBookAssignment`, formData, { headers });
  }
}
