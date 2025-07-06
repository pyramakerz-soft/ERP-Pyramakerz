// zatca.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

  generateCertificate(schoolPcId: number, otp: number, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');
 
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
    // Set domain name header
    const headers = new HttpHeaders()
      .set('domain-name', DomainName)
      .set('Authorization', `Bearer ${localStorage.getItem('current_token')}`)
      .set('accept', '*/*');

    // Create URL with query parameters
    const url = `${this.baseUrl}/Zatca/FilterBySchoolAndDate`;

    // Create params object
    const params = new HttpParams()
      .set('schoolId', schoolId.toString())
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get(url, { headers, params });
  }

  getInvoiceById(
    id: number,
    DomainName: string
  ): Observable<ElectronicInvoice> {
    const headers = new HttpHeaders()
      .set('domain-name', DomainName)
      .set('Authorization', `Bearer ${localStorage.getItem('current_token')}`)
      .set('Content-Type', 'application/json');

    return this.http.get<ElectronicInvoice>(`${this.baseUrl}/Zatca/${id}`, {
      headers,
    });
  }

  // Update the reportInvoice method to match Swagger
  reportInvoice(masterId: number, DomainName: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('domain-name', DomainName)
      .set('Authorization', `Bearer ${localStorage.getItem('current_token')}`)
      .set('accept', '*/*');

    const params = new HttpParams().set('masterId', masterId.toString());

    // Change from GET to POST with empty body as shown in Swagger
    return this.http.post(`${this.baseUrl}/Zatca/ReportInvoice`, null, {
      headers,
      params,
    });
  }

  // The reportInvoices method is correct as is
  reportInvoices(
    schoolId: number,
    selectedInvoices: number[],
    DomainName: string
  ): Observable<any> {
    const headers = new HttpHeaders()
      .set('domain-name', DomainName)
      .set('Authorization', `Bearer ${localStorage.getItem('current_token')}`)
      .set('Content-Type', 'application/json')
      .set('accept', '*/*');

    const body = {
      schoolId,
      selectedInvoices,
    };

    return this.http.post(`${this.baseUrl}/Zatca/ReportInvoices`, body, {
      headers,
    });
  }
}
