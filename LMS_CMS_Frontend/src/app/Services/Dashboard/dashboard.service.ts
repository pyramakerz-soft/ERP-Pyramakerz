import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TodaysData, DashboardParams, DashboardData } from '../../Models/Dashboard/dashboard.models';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
   baseUrl = '';
   header = '';

  constructor(private http: HttpClient, private ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
   }

  getTodaysData(DomainName: string): Observable<TodaysData> {
    if(DomainName != null){
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');
  return this.http.get<TodaysData>(`${this.baseUrl}/GetTodaysData`, { headers });
  }

  getDashboardData(params: DashboardParams, DomainName: string): Observable<DashboardData> {
        if(DomainName != null){
      this.header = DomainName;
    }
    let httpParams = new HttpParams().set('year', params.year.toString());
    
    if (params.month) {
      httpParams = httpParams.set('month', params.month.toString());
    }

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');

    return this.http.get<DashboardData>(this.baseUrl, { params: httpParams, headers });
  }
}