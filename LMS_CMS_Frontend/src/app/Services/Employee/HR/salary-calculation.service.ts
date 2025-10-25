import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class SalaryCalculationService {

  baseUrl = "";
  header = "";

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  SalaryCalculation(DomainName: string, month: number, year: number , EmpId : number) {
    if (DomainName) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(
      `${this.baseUrl}/SalaryCalculations?month=${month}&year=${year}&employeeId=${EmpId}`,{}, // body
      { headers, responseType: 'text' } // options
    );
  }

  SalaryCalculationSP(DomainName: string, month: number, year: number , EmpId : number) {
    if (DomainName) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(
      `${this.baseUrl}/SalaryCalculationSP?month=${month}&year=${year}&employeeId=${EmpId}`,{}, // body
      { headers, responseType: 'text' } // options
    );
  }
}
