// zatca.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';
import { Observable } from 'rxjs';
import { ElectronicInvoice } from '../../../Models/zatca/electronic-invoice';

@Injectable({
  providedIn: 'root',
})
export class ZatcaService {
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  generateCertificate(schoolPcId: number, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');

    const otp = '123345'; // Fixed OTP as per requirements
    return this.http.post(
      `${this.baseUrl}/Zatca/GeneratePCSID?otp=${otp}&schoolPcId=${schoolPcId}`,
      null,
      { headers }
    );
  }

  filterBySchoolAndDate(
    schoolId: number,
    startDate: string,
    endDate: string,
    pageNumber: number,
    pageSize: number,
    DomainName: string
  ): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');

    const params = {
      schoolId: schoolId.toString(),
      startDate,
      endDate,
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    };

    return this.http.post(`${this.baseUrl}/Zatca/FilterBySchoolAndDate`, {
      headers,
      params,
    });
  }
  // zatca.service.ts
  getInvoiceById(
    id: number,
    DomainName: string
  ): Observable<ElectronicInvoice> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<ElectronicInvoice>(`${this.baseUrl}/Zatca/${id}`, {
      headers,
    });
  }
}
