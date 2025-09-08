import { Injectable } from '@angular/core';
import { PermissionGroupDetails } from '../../../Models/Archiving/permission-group-details';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGroupDetailsService {
  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  } 

  GetByPermissionGroupID(id:number ,DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<PermissionGroupDetails[]>(`${this.baseUrl}/PermissionGroupDetails/ByPermissionGroupID/${id}`, { headers })
  }

  Add(master: PermissionGroupDetails, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.baseUrl}/PermissionGroupDetails`, master, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }
}
