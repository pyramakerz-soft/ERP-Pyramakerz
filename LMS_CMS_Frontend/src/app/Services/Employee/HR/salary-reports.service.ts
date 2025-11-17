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

  GetSalarySummary(DomainName: string, month: number, year: number, empId: number ,jobId:number , JobCategoryId : number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
      console.log(`${this.baseUrl}/SalaryReports/GetSalarySummary/${month}/${year}/${empId}/${jobId}/${JobCategoryId}`)
    return this.http.get<SalaryHistory[]>(`${this.baseUrl}/SalaryReports/GetSalarySummary/${month}/${year}/${empId}/${jobId}/${JobCategoryId}`, { headers });
  }

  GetEmployeeSalaryDetailedByToken(DomainName: string, month: number, year: number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<{ monthlyAttendance: MonthlyAttendance[], salaryHistory: SalaryHistory }>(`${this.baseUrl}/SalaryReports/GetEmployeeSalaryDetailedByToken/${month}/${year}`, { headers });
  }

  GetAttendanceByToken(DomainName: string, month: number, year: number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<MonthlyAttendance[]>(`${this.baseUrl}/SalaryReports/GetAttendanceByToken/${month}/${year}`, { headers });
  }

  GetSalarySummaryByToken(DomainName: string, month: number, year: number ) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<SalaryHistory>(`${this.baseUrl}/SalaryReports/GetSalarySummaryByToken/${month}/${year}`, { headers });
  }  

}
