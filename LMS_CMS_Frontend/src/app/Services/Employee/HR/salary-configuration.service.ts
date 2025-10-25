import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { SalaryConfiguration } from '../../../Models/HR/salary-configuration';

@Injectable({
  providedIn: 'root'
})

export class SalaryConfigurationService {
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

    return this.http.get<SalaryConfiguration>(`${this.baseUrl}/SalaryConfigration`, { headers });
  }

  Edit(salaryConfiguration: SalaryConfiguration, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<SalaryConfiguration>(`${this.baseUrl}/SalaryConfigration`, salaryConfiguration, { headers });
  }
}