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

  // getMHByParentById(
  //   id: number,
  //   DomainName: string
  // ): Observable<MedicalHistoryByParent> {
  //   if (DomainName != null) {
  //     this.header = DomainName;
  //   }
  //   const token = localStorage.getItem('current_token');
  //   const headers = new HttpHeaders()
  //     .set('Domain-Name', this.header)
  //     .set('Authorization', `Bearer ${token}`)
  //     .set('accept', '*/*');

  //   return this.http.get<MedicalHistoryByParent>(
  //     `${this.baseUrl}/MedicalHistory/GetByIdByParent/id?id=${id}`,
  //     { headers }
  //   );
  // }

  getAllMHByParent(
    DomainName: string,
    studentId: number,
    schoolId: number,
    gradeId: number,
    classId: number
  ): Observable<any[]> {
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

  getAllMHByDoctor(
    DomainName: string,
    studentId: number,
    schoolId: number,
    gradeId: number,
    classId: number
  ): Observable<any[]> {
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

  getAllHygieneForms(
    DomainName: string,
    studentId: number,
    schoolId: number,
    gradeId: number,
    classId: number
  ): Observable<any[]> {
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

  getAllFollowUps(
    DomainName: string,
    studentId: number,
    schoolId: number,
    gradeId: number,
    classId: number
  ): Observable<any[]> {
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
}
