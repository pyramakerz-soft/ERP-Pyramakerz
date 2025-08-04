import { Injectable } from '@angular/core';
import { RemedialTimeTable } from '../../../Models/LMS/remedial-time-table';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class RemedialTimeTableService {

  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  GetBySchoolId(SchoolId: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<RemedialTimeTable[]>(`${this.baseUrl}/RemedialTimeTable/BySchoolId/${SchoolId}`, { headers });
  }

  GetByID(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<any>(`${this.baseUrl}/RemedialTimeTable/${id}`, { headers });
  }

  EditIsFavourite(Id: number, IsFav: boolean, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    console.log(DomainName);
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header) // Correct casing as in your backend
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(
      `${this.baseUrl}/RemedialTimeTable?id=${Id}&IsFavourite=${IsFav}`,
      {},
      { headers }
    );
  }

  Add(RemedialTimeTable: RemedialTimeTable, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/RemedialTimeTable`, RemedialTimeTable, {
      headers: headers,
      responseType: 'text' as 'json',
    });
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
    return this.http.delete(`${this.baseUrl}/RemedialTimeTable/${id}`, { headers });
  }
}
