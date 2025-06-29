import { Injectable } from '@angular/core';
import { DailyPerformance } from '../../../Models/LMS/daily-performance';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';
import { DailyPerformanceMaster } from '../../../Models/LMS/daily-performance-master';

@Injectable({
  providedIn: 'root'
})
export class DailyPerformanceService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  Get(ClassId :number , Subject : number ,DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<DailyPerformanceMaster[]>(`${this.baseUrl}/DailyPerformance/GetMasterByClassSubject/${ClassId}/${Subject}`, { headers })
  }

  Add(DailyPerformance: DailyPerformanceMaster, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/DailyPerformance`, DailyPerformance, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }

}
