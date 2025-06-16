import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Assignment } from '../../../Models/LMS/assignment';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
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
      return this.http.get<{ data: Assignment[], pagination: any }>(`${this.baseUrl}/Assignment?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers });
  }

  GetBySubjectID(subjectID:number, DomainName: string, pageNumber:number, pageSize:number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
      return this.http.get<{ data: Assignment[], pagination: any }>(`${this.baseUrl}/Assignment/GetBySubjectID/${subjectID}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers });
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
    return this.http.get<Assignment>(`${this.baseUrl}/Assignment/${id}`, { headers })
  }

  Add(Assignment: Assignment, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/Assignment`, Assignment, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }

  Edit(Assignment: Assignment, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/Assignment`, Assignment, { headers });
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
    return this.http.delete(`${this.baseUrl}/Assignment/${id}`, { headers })
  }

}
