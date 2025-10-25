import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { DirectMarkClassesStudent } from '../../../Models/LMS/direct-mark-classes-student';
import { DirectMark } from '../../../Models/LMS/direct-mark';

@Injectable({
  providedIn: 'root'
})
export class DirectMarkClassesStudentService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  GetByDirectMarkId(DirectMarkID: number,ClassId:number, DomainName: string , pageNumber:number, pageSize:number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<{ data: DirectMarkClassesStudent[],directMark :DirectMark , pagination: any }>(`${this.baseUrl}/DirectMarkClassesStudent/GetByDirectMarkId/${DirectMarkID}/${ClassId}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers })
  }

  Edit(directMarkClassesStudent: DirectMarkClassesStudent, DomainName: string){
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<DirectMarkClassesStudent>(`${this.baseUrl}/DirectMarkClassesStudent`, directMarkClassesStudent, { headers });
  }
}
