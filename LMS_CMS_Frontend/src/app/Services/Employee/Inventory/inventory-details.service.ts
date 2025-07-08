import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InventoryDetails } from '../../../Models/Inventory/InventoryDetails';
import { InventoryNetSummary, InventoryNetTransaction } from '../../../Models/Inventory/report-card';
import { Store } from '../../../Models/Inventory/store';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryDetailsService {
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  GetBySalesId(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<InventoryDetails[]>(
      `${this.baseUrl}/InventoryDetails/BySaleId/${id}`,
      { headers }
    );
  }

  GetById(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<InventoryDetails>(
      `${this.baseUrl}/InventoryDetails/${id}`,
      { headers }
    );
  }

  Add(Detail: InventoryDetails[], DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    const cleanedDetails = Detail.map((item) => {
      const { id, ...rest } = item;
      return rest;
    });
    return this.http.post<any>(
      `${this.baseUrl}/InventoryDetails`,
      cleanedDetails,
      {
        headers: headers,
        responseType: 'text' as 'json',
      }
    );
  }

  Edit(
    Detail: InventoryDetails[],
    DomainName: string
  ): Observable<InventoryDetails[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put<InventoryDetails[]>(
      `${this.baseUrl}/InventoryDetails`,
      Detail,
      { headers }
    );
  }

  Delete(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/InventoryDetails/${id}`, {
      headers,
    });
  }
  // inventory-details.service.ts

  getInventoryNetSummary(
    storeId: number,
    itemId: number,
    toDate: string,
    DomainName: string
  ): Observable<InventoryNetSummary> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<InventoryNetSummary>(
      `${this.baseUrl}/InventoryDetails/inventory-net-summary?storeId=${storeId}&shopItemId=${itemId}&toDate=${toDate}`,
      { headers }
    );
  }

  getInventoryNetTransactions(
    storeId: number,
    itemId: number,
    fromDate: string,
    toDate: string,
    DomainName: string
  ): Observable<InventoryNetTransaction[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<InventoryNetTransaction[]>(
      `${this.baseUrl}/InventoryDetails/inventory-net-transactions?storeId=${storeId}&shopItemId=${itemId}&fromDate=${fromDate}&toDate=${toDate}`,
      { headers }
    );
  }

  getMovingAverageCost(
    fromDate: string,
    toDate: string,
    DomainName: string
  ): Observable<any[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    // Encode the dates to match API format (MM/DD/YYYY)
    const encodedFromDate = encodeURIComponent(fromDate);
    const encodedToDate = encodeURIComponent(toDate);

    return this.http.get<any[]>(
      `${this.baseUrl}/InventoryDetails/CalculateMovingAverageCost?fromDate=${encodedFromDate}&toDate=${encodedToDate}`,
      { headers }
    );
  }
}
