import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';
import { DirectMarkClasses } from '../../../Models/LMS/direct-mark-classes';

@Injectable({
  providedIn: 'root'
})
export class DirectMarkClassesService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  GetByDirectMarkId(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<DirectMarkClasses[]>(`${this.baseUrl}/DirectMarkClasses/ByDirectMarkId/${id}`, { headers })
  }
}
