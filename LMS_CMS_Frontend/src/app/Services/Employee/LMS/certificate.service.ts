import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { WeightType } from '../../../Models/LMS/weight-type';
import { Subject } from '../../../Models/LMS/subject';
import { Certificate } from '../../../Models/LMS/certificate';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  Get(SchoolId:number , StudentId:number,DateFrom:string,DateTo:String ,DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
      return this.http.get<{ subjectDTO: Subject[],header: WeightType[],cells: Certificate[] }>(`${this.baseUrl}/Certificate/ByStudentId/${SchoolId}/${StudentId}/${DateFrom}/${DateTo}`, { headers });
  }
}
