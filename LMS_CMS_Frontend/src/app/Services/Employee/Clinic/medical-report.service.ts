import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
// import { MedicalHistoryByParent } from '../../../Models/Clinic/mh-by-parent';

@Injectable({
  providedIn: 'root',
})
export class MedicalReportService {
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  getAllMHByParent(DomainName: string,studentId: number,schoolId: number,gradeId: number,classId: number): Observable<any[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');
    return this.http.get<any[]>(
      `${this.baseUrl}/MedicalReport/GetAllMHByParent?studentId=${studentId}&schoolId=${schoolId}&gradeId=${gradeId}&classId=${classId}`,
      { headers }
    );
  }

  getAllMHByDoctor(DomainName: string,studentId: number,schoolId: number,gradeId: number,classId: number): Observable<any[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');

    return this.http.get<any[]>(
      `${this.baseUrl}/MedicalReport/GetAllMHByDoctor?studentId=${studentId}&schoolId=${schoolId}&gradeId=${gradeId}&classId=${classId}`,
      { headers }
    );
  }

  getAllHygieneForms(DomainName: string,studentId: number,schoolId: number,gradeId: number,classId: number): Observable<any[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');

    return this.http.get<any[]>(
      `${this.baseUrl}/MedicalReport/GetAllHygienesForms?studentId=${studentId}&schoolId=${schoolId}&gradeId=${gradeId}&classId=${classId}`,
      { headers }
    );
  }

  getAllFollowUps(DomainName: string,studentId: number,schoolId: number,gradeId: number,classId: number): Observable<any[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');

    return this.http.get<any[]>(
      `${this.baseUrl}/MedicalReport/GetAllFollowUps?studentId=${studentId}&schoolId=${schoolId}&gradeId=${gradeId}&classId=${classId}`,
      { headers }
    );
  }

  /// for parent 
    getAllMHByParentByStudentId(DomainName: string,studentId: number): Observable<any[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');
    return this.http.get<any[]>(
      `${this.baseUrl}/MedicalReport/GetAllMHByParentByStudentId/${studentId}}`,
      { headers }
    );
  }

  getAllMHByDoctorByStudentId(DomainName: string,studentId: number): Observable<any[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');

    return this.http.get<any[]>(
      `${this.baseUrl}/MedicalReport/GetAllMHByDoctorByStudentId/${studentId}`,
      { headers }
    );
  }

  getAllHygieneFormsByStudentId(DomainName: string,studentId: number): Observable<any[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');

    return this.http.get<any[]>(
      `${this.baseUrl}/MedicalReport/GetAllHygienesFormsByStudentId/${studentId}`,
      { headers }
    );
  }

  getAllFollowUpsByStudentId(DomainName: string,studentId: number): Observable<any[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');

    return this.http.get<any[]>(
      `${this.baseUrl}/MedicalReport/GetAllFollowUpsByStudentId/${studentId}`,
      { headers }
    );
  }
}
