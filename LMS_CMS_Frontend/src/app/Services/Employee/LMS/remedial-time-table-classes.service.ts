import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class RemedialTimeTableClassesService {
  
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }


  Delete(ids: number[], DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    // 👇 pass body inside options
    return this.http.delete(`${this.baseUrl}/RemedialTimeTableClasses`, { headers, body: ids });
  }


}
