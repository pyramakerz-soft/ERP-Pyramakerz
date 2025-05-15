import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QuestionBankType } from '../../../Models/LMS/question-bank-type';
import { ApiService } from '../../api.service';
import { Tag } from '../../../Models/LMS/tag';

@Injectable({
  providedIn: 'root'
})
export class QuestionBankTypeService {

 baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  Get(DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<QuestionBankType[]>(`${this.baseUrl}/QuestionBankType`, { headers });
  }
}
