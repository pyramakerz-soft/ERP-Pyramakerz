import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ParentAdd } from '../Models/parent-add';
import { Parent } from '../Models/parent';

@Injectable({
  providedIn: 'root'
})
export class ParentService {

  baseUrl=""
  header = ""

  constructor(public http: HttpClient, public ApiServ:ApiService){  
    this.baseUrl=ApiServ.BaseUrl
    this.header = ApiServ.GetHeader()
  }
 
  GetByIDByToken(DomainName?:string){
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
    .set('Authorization', `Bearer ${token}`)
    .set('domain-name', this.header)
    .set('Content-Type', 'application/json')
    
    return this.http.get<Parent>(`${this.baseUrl}/Parent/GetByIDByToken`, { headers })
  }

  GetByStudentID(id:number,DomainName?:string){
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
    .set('Authorization', `Bearer ${token}`)
    .set('domain-name', this.header)
    .set('Content-Type', 'application/json')
    
    return this.http.get<Parent>(`${this.baseUrl}/Parent/ByStudentID/${id}`, { headers })
  }

  AddParent(parent:ParentAdd,DomainName:string){
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
    .set('Authorization', `Bearer ${token}`)
    .set('domain-name', this.header)
    .set('Content-Type', 'application/json')
    
    return this.http.post(`${this.baseUrl}/Parent`,parent, { headers })
  }

}
