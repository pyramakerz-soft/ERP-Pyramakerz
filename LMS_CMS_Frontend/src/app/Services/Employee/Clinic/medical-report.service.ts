import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MedicalHistoryByParent } from '../../../Models/Clinic/mh-by-parent';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root',
})
export class MedicalReportService {
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  getAllMHByParent(
    DomainName: string,
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
      `${this.baseUrl}/MedicalReport/GetAllMHByParent?schoolId=${schoolId}&gradeId=${gradeId}&classId=${classId}`,
      { headers }
    );
  }

  getMHByParentById(
    id: number,
    DomainName: string
  ): Observable<MedicalHistoryByParent> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');

    return this.http.get<MedicalHistoryByParent>(
      `${this.baseUrl}/MedicalHistory/GetByIdByParent/id?id=${id}`,
      { headers }
    );
  }

  getAllMHByDoctor(
    DomainName: string,
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
      `${this.baseUrl}/MedicalReport/GetAllMHByDoctor?schoolId=${schoolId}&gradeId=${gradeId}&classId=${classId}`,
      { headers }
    );
  }

  getAllHygieneForms(
    DomainName: string,
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
      `${this.baseUrl}/MedicalReport/GetAllHygienesForms?schoolId=${schoolId}&gradeId=${gradeId}&classId=${classId}`,
      { headers }
    );
  }

  getAllFollowUps(
    DomainName: string,
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
      `${this.baseUrl}/MedicalReport/GetAllFollowUps?schoolId=${schoolId}&gradeId=${gradeId}&classId=${classId}`,
      { headers }
    );
  }
}
