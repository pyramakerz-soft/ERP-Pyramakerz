import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';
import { RemedialClassroomStudent } from '../../../Models/LMS/remedial-classroom-student';

@Injectable({
  providedIn: 'root',
})
export class RemedialClassroomStudentService {
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  Add(RemedialClassroomStudent: RemedialClassroomStudent, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/RemedialClassroomStudent`,RemedialClassroomStudent,
      {headers: headers,responseType: 'text' as 'json', }
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
    return this.http.delete(`${this.baseUrl}/RemedialClassroomStudent/${id}`, {
      headers,
    });
  }
}
