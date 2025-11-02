import { Injectable } from '@angular/core';
import { FailedStudents } from '../../../Models/LMS/failed-students';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class FailedStudentsService {
  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  } 

  GetByAcademicYearID(yeaID:number, DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<FailedStudents[]>(`${this.baseUrl}/FailedStudent/GetByAcademicYearID/${yeaID}`, { headers })
  }
}
