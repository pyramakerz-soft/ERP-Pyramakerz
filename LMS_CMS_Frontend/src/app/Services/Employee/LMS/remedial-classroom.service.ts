import { Injectable } from '@angular/core';
import { RemedialClassroom } from '../../../Models/LMS/remedial-classroom';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class RemedialClassroomService {

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
    return this.http.get<RemedialClassroom[]>(`${this.baseUrl}/RemedialClassroom/BySchoolId/${SchoolId}`, { headers });
  }

  GetBySchoolIdWithPaggination(SchoolId: number, DomainName: string, pageNumber: number, pageSize: number) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<{ data: RemedialClassroom[], pagination: any }>(`${this.baseUrl}/RemedialClassroom/BySchoolIdWithPaggination/${SchoolId}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers });
  }

  GetByGradeId(GradeId: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<RemedialClassroom[]>(`${this.baseUrl}/RemedialClassroom/ByGradeId/${GradeId}`, { headers });
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
    return this.http.get<RemedialClassroom>(`${this.baseUrl}/RemedialClassroom/${id}`, { headers });
  }

  Add(RemedialClassroom: RemedialClassroom, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const payload = {
      name: RemedialClassroom.name,
      numberOfSession: Number(RemedialClassroom.numberOfSession), // Convert to number
      subjectID: Number(RemedialClassroom.subjectID),
      academicYearID: Number(RemedialClassroom.academicYearID),
      teacherID: Number(RemedialClassroom.teacherID),
    };
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/RemedialClassroom`, payload, {
      headers: headers,
      responseType: 'text' as 'json',
    });
  }

  Edit(RemedialClassroom: RemedialClassroom, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const payload = {
      id: RemedialClassroom.id,
      name: RemedialClassroom.name,
      numberOfSession: Number(RemedialClassroom.numberOfSession), // Convert to number
      subjectID: Number(RemedialClassroom.subjectID),
      academicYearID: Number(RemedialClassroom.academicYearID),
      teacherID: Number(RemedialClassroom.teacherID),
    };
    console.log(payload)
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/RemedialClassroom`, payload, { headers });
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
    return this.http.delete(`${this.baseUrl}/RemedialClassroom/${id}`, { headers });
  }
}
