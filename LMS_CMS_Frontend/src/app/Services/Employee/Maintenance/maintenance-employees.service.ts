import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { EmployeeGet } from '../../../Models/Employee/employee-get';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceEmployeesService {

  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl; 
  }

  
  Get(DomainName: string): Observable<EmployeeGet[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header) 
      .set('Authorization', `Bearer ${token}`) 
      .set('accept', '*/*'); 
    return this.http.get<EmployeeGet[]>(`${this.baseUrl}/MaintenanceEmployee`, { headers });
  }



  Add(MaintenanceEmployee: { employeeId: number }, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*')
      .set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.baseUrl}/MaintenanceEmployee`, MaintenanceEmployee, {
      headers: headers,
      responseType: 'text' as 'json',
    });
  }


Edit(MaintenanceEmployee: EmployeeGet, DomainName: string): Observable<EmployeeGet> {
  if (DomainName != null) {
    this.header = DomainName;
  }
  const token = localStorage.getItem('current_token');
  const headers = new HttpHeaders()
    .set('Domain-Name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('accept', '*/*')
    .set('Content-Type', 'application/json');

  return this.http.put<EmployeeGet>(
    `${this.baseUrl}/MaintenanceEmployee/${MaintenanceEmployee.id}`, // 👈 include ID
    MaintenanceEmployee,
    { headers }
  );
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

  
  return this.http.delete(`${this.baseUrl}/MaintenanceEmployee?id=${id}`, { headers, responseType: 'text' });
}
}
