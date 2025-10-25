import { Injectable } from '@angular/core'; 
import { ApiService } from '../../api.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { PermissionGroup } from '../../../Models/Archiving/permission-group';

@Injectable({
  providedIn: 'root'
})
export class PermissionGroupService {
  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  } 

  Get(DomainName: string, pageNumber:number, pageSize:number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
      return this.http.get<{ data: PermissionGroup[], pagination: any }>(`${this.baseUrl}/PermissionGroup?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers });
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
    return this.http.get<PermissionGroup>(`${this.baseUrl}/PermissionGroup/${id}`, { headers })
  }

  Add(master: PermissionGroup, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.baseUrl}/PermissionGroup`, master, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }

  Edit(master: PermissionGroup, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<PermissionGroup>(`${this.baseUrl}/PermissionGroup`, master, { headers });
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
    return this.http.delete(`${this.baseUrl}/PermissionGroup/${id}`, { headers })
  }
}
