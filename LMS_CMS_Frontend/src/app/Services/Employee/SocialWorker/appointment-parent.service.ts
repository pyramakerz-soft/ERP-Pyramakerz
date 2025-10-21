import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { AppointmentParent } from '../../../Models/SocialWorker/appointment-parent';

@Injectable({
  providedIn: 'root'
})
export class AppointmentParentService {
  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  GetByParentId(ParentId: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<AppointmentParent[]>(`${this.baseUrl}/AppointmentParent/ByParent/${ParentId}`, { headers });
  }

  Edit(appointment: AppointmentParent, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<AppointmentParent>(`${this.baseUrl}/AppointmentParent`, appointment, { headers });
  }
}
