import { Injectable } from '@angular/core';
import { Assignment } from '../../../Models/LMS/assignment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class AssignmentQuestionService {
 baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }


  GetById(id : number ,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Assignment>(`${this.baseUrl}/AssignmentQuestion/GetByID/${id}`, { headers })
  }

  // Add(assignmentQuestion: AssignmentQuestion,DomainName:string) {
  //   if(DomainName!=null) {
  //     this.header=DomainName 
  //   }
  //   const token = localStorage.getItem("current_token");
  //   const headers = new HttpHeaders()
  //     .set('domain-name', this.header)
  //     .set('Authorization', `Bearer ${token}`)
  //     .set('Content-Type', 'application/json');

  //   return this.http.post(`${this.baseUrl}/AssignmentQuestion`, Building, {
  //     headers: headers,
  //     responseType: 'text' as 'json'
  //   });
  // }
}
