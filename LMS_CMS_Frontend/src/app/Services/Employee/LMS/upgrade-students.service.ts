import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UpgradeStudents } from '../../../Models/LMS/upgrade-students';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class UpgradeStudentsService {
  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }
 
  UpgradeStudent(UpgradeStudents: UpgradeStudents,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/UpgradeStudent`, UpgradeStudents, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }
 
  UpgradeStudentAfterSummerCourse(UpgradeStudents: UpgradeStudents,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/UpgradeStudent/AfterSummerCourse`, UpgradeStudents, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }
 
  TransferToTheSameGrade(UpgradeStudents: UpgradeStudents,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/UpgradeStudent/TransferToTheSameGrade`, UpgradeStudents, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }
}
