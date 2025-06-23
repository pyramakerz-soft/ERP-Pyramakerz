import { Injectable } from '@angular/core';
import { AssignmentStudent } from '../../../Models/LMS/assignment-student';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';

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

}
