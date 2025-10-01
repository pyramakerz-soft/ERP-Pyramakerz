import { MonthlyAttendance } from '../../../Models/HR/monthly-attendance';
import { SalaryHistory } from '../../../Models/HR/salary-history';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class SalaryReportsService {

  baseUrl = "";
  header = "";

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  GetEmployeeSalaryDetailed(DomainName: string, month: number, year: number, empId: number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<{ monthlyAttendance: MonthlyAttendance[], salaryHistory: SalaryHistory }>(`${this.baseUrl}/SalaryReports/GetEmployeeSalaryDetailed/${month}/${year}/${empId}`, { headers });
  }

  GetAttendance(DomainName: string, month: number, year: number, empId: number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<MonthlyAttendance[]>(`${this.baseUrl}/SalaryReports/GetAttendance/${month}/${year}/${empId}`, { headers });
  }

  GetSalarySummary(DomainName: string, month: number, year: number, empId: number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<SalaryHistory[]>(`${this.baseUrl}/SalaryReports/GetSalarySummary/${month}/${year}/${empId}`, { headers });
  }

}
