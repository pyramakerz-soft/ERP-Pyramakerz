
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from '../../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EtaService {
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
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
    const url = `${this.baseUrl}/ETA/FilterBySchoolAndDate`;

    // Create params object
    const params = new HttpParams()
      .set('schoolId', schoolId.toString())
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get(url, { headers, params });
  }

  /**
   * Submit single invoice to ETA
   * @param masterId The ID of the invoice to submit
   * @param etaPosID The ETA POS ID (default 0)
   * @param salesInvoiceId The sales invoice ID (default 0)
   * @param DomainName The domain name for the request
   * @returns Observable with the submission response
   */
  submitInvoice(
    masterId: number,
    etaPosID: number = 0,
    salesInvoiceId: number = 0,
    DomainName: string
  ): Observable<any> {
    const headers = new HttpHeaders()
      .set('Domain-Name', DomainName)
      .set('Authorization', `Bearer ${localStorage.getItem('current_token')}`)
      .set('accept', '*/*');

    const params = {
      masterId: masterId.toString(),
      etaPosID: etaPosID.toString(),
      salesInvoiceId: salesInvoiceId.toString(),
    };

    return this.http.post(
      `${this.baseUrl}/ETA/SubmitInvoice`,
      null, 
      { headers, params }
    );
  }

  /**
   * Submit multiple invoices to ETA
   * @param schoolId The school ID associated with the invoices
   * @param selectedInvoices Array of invoice IDs to submit
   * @param DomainName The domain name for the request
   * @returns Observable with the submission response
   */
  submitInvoices(
    schoolId: number,
    selectedInvoices: number[],
    DomainName: string
  ): Observable<any> {
    const headers = new HttpHeaders()
      .set('Domain-Name', DomainName)
      .set('Authorization', `Bearer ${localStorage.getItem('current_token')}`)
      .set('Content-Type', 'application/json')
      .set('accept', '*/*');

    const body = {
      schoolId,
      selectedInvoices,
    };

    return this.http.post(`${this.baseUrl}/ETA/SubmitInvoices`, body, {
      headers,
    });
  }

  
}
