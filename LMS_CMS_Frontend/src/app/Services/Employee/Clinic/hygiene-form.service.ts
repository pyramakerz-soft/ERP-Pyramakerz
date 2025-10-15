import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HygieneForm } from '../../../Models/Clinic/HygieneForm';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root',
})
export class HygieneFormService {
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl; 
  }

Get(DomainName: string): Observable<HygieneForm[]> {
  if (DomainName != null) {
    this.header = DomainName;
  }
  const token = localStorage.getItem('current_token');
  const headers = new HttpHeaders()
    .set('Domain-Name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('accept', '*/*');
  return this.http.get<HygieneForm[]>(`${this.baseUrl}/HygieneForm`, { headers });
}

GetById(id: number, DomainName: string): Observable<HygieneForm> {
  if (DomainName != null) {
    this.header = DomainName;
  }
  const token = localStorage.getItem('current_token');
  const headers = new HttpHeaders()
    .set('Domain-Name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('accept', '*/*');
  return this.http.get<HygieneForm>(`${this.baseUrl}/HygieneForm/id?id=${id}`, { headers });
}
  
Add(hygieneFormData: any, DomainName: string): Observable<any> {
  if (DomainName != null) {
    this.header = DomainName;
  }
  const token = localStorage.getItem('current_token');
  const headers = new HttpHeaders()
    .set('Domain-Name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json');

  hygieneFormData.studentHygieneTypes = hygieneFormData.studentHygieneTypes.map((student: any) => ({
    ...student,
    attendance: student.attendance === true || student.attendance === false ? student.attendance : false,
  }));

  return this.http.post(`${this.baseUrl}/HygieneForm`, hygieneFormData, { headers });
}

  
Delete(id: number, DomainName: string): Observable<any> {
  if (DomainName != null) {
    this.header = DomainName;
  }
  const token = localStorage.getItem('current_token');
  const headers = new HttpHeaders()
    .set('Domain-Name', this.header) 
    .set('Authorization', `Bearer ${token}`) 
    .set('accept', '*/*')
    .set('Content-Type', 'application/json');

  return this.http.delete(`${this.baseUrl}/HygieneForm?id=${id}`, { headers, responseType: 'text' });
}
}