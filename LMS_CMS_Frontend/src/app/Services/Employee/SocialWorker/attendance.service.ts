import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { Attendance, AttendanceReportItem } from '../../../Models/SocialWorker/attendance';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  GetByAcademicYearAndClass(academicYearID: number, classroomID: number, DomainName: string, pageNumber: number, pageSize: number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<{ data: Attendance[], pagination: any }>(`${this.baseUrl}/Attendance/ByAcademicYearAndClass/${academicYearID}/${classroomID}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers });
  }

  GetByID(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Attendance>(`${this.baseUrl}/Attendance/${id}`, { headers })
  }

  Add(Attendance: Attendance, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.baseUrl}/Attendance`, Attendance, { headers, responseType: 'text' as 'json' });
  }

  Edit(Attendance: Attendance, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<Attendance>(`${this.baseUrl}/Attendance`, Attendance, { headers });
  }

  Delete(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/Attendance/${id}`, { headers })
  }

   GetAttendanceReport(
    DomainName: string,
    fromDate: string,
    toDate: string,
    schoolId?: number,
    academicYearId?: number,
    gradeId?: number,
    classroomId?: number,
    studentId?: number
  ) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    let params = new URLSearchParams();
    params.append('FromDate', fromDate);
    params.append('ToDate', toDate);
    
    if (schoolId) params.append('SchoolId', schoolId.toString());
    if (academicYearId) params.append('AcademicYearId', academicYearId.toString());
    if (gradeId) params.append('GradeId', gradeId.toString());
    if (classroomId) params.append('ClassroomId', classroomId.toString());
    if (studentId) params.append('StudentId', studentId.toString());

    return this.http.get<AttendanceReportItem[]>(`${this.baseUrl}/Attendance/AttendanceReport?${params.toString()}`, { headers });
  }
  

}

