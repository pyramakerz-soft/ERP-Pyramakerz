import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { WeightType } from '../../../Models/LMS/weight-type';
import { Subject } from '../../../Models/LMS/subject';
import { Certificate } from '../../../Models/LMS/certificate';
import { CertificateSubjectTotalMark } from '../../../Models/LMS/certificate-subject-total-mark';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  Get(SchoolId:number ,ClassId:number , StudentId:number, AcademicYearId:number,DateFrom:string,DateTo:String,isSummerCourse:boolean ,DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json'); 
      return this.http.get<{ subjectDTO: Subject[],header: WeightType[],cells: Certificate[] ,lastColumn :CertificateSubjectTotalMark[] }>(`
        ${this.baseUrl}/Certificate/ByStudentId/${SchoolId}/${ClassId}/${StudentId}/${AcademicYearId}/${DateFrom}/${DateTo}?IsSummerCourse=${isSummerCourse}`, { headers });
  }
}
