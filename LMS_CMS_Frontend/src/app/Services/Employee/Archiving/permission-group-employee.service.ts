import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PermissionGroupEmployee } from '../../../Models/Archiving/permission-group-employee';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGroupEmployeeService {
  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  } 

  ByPermissionGroupID(permissionGroupID:number, DomainName:string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
      return this.http.get<PermissionGroupEmployee[]>(`${this.baseUrl}/PermissionGroupEmployee/ByPermissionGroupID/${permissionGroupID}`, { headers });
  }

  GetById(id:number ,DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<PermissionGroupEmployee>(`${this.baseUrl}/PermissionGroupEmployee/${id}`, { headers })
  }

  Add(master: PermissionGroupEmployee, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.baseUrl}/PermissionGroupEmployee`, master, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }
 
  Delete(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/PermissionGroupEmployee/${id}`, { headers })
  }
}
