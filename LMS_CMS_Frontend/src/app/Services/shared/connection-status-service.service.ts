import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core'; 
import { ConnectionStatus } from '../../Models/connection-status';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectionStatusServiceService {
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
    return this.http.get<ConnectionStatus[]>(`${this.baseUrl}/ConnectionStatus`, { headers })
  }
  
  GetUserState(DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<ConnectionStatus>(`${this.baseUrl}/ConnectionStatus/GetUserState`, { headers })
  }
  
  ChangeConnectionStatus(stateID:number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<any>(`${this.baseUrl}/ConnectionStatus/ChangeConnectionStatus/${stateID}`, { headers })
  }
}
