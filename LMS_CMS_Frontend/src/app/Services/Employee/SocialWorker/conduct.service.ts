import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { Conduct } from '../../../Models/SocialWorker/conduct';

@Injectable({
  providedIn: 'root'
})
export class ConductService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  GetBySchoolId(SchoolId:number ,DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<Conduct[]>(`${this.baseUrl}/Conduct/BySchool/${SchoolId}`, { headers });
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
    return this.http.get<Conduct>(`${this.baseUrl}/Conduct/${id}`, { headers })
  }

  Add(Conduct: Conduct, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('details', Conduct.details ?? '');
    formData.append('date', Conduct.date ?? '');
    formData.append('isSendSMSToParent', Conduct.isSendSMSToParent.toString());
    formData.append('conductTypeID', Conduct.conductTypeID?.toString() ?? '');
    formData.append('studentID', Conduct.studentID?.toString() ?? '');
    formData.append('classroomID', Conduct.classroomID?.toString() ?? '');
    formData.append('procedureTypeID', Conduct.procedureTypeID?.toString() ?? '');

    if (Conduct.newFile) {
      formData.append('newFile', Conduct.newFile, Conduct.newFile.name);
    }

    return this.http.post(`${this.baseUrl}/Conduct`, formData, { headers });

  }

  Edit(Conduct: Conduct, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('id', Conduct.id.toString());
    formData.append('details', Conduct.details ?? '');
    formData.append('date', Conduct.date ?? '');
    formData.append('isSendSMSToParent', Conduct.isSendSMSToParent.toString());
    formData.append('conductTypeID', Conduct.conductTypeID?.toString() ?? '');
    formData.append('studentID', Conduct.studentID?.toString() ?? '');
    formData.append('classroomID', Conduct.classroomID?.toString() ?? '');
    formData.append('procedureTypeID', Conduct.procedureTypeID?.toString() ?? '');
    if (Conduct.newFile) {
      formData.append('newFile', Conduct.newFile, Conduct.newFile.name);
    }
    return this.http.put(`${this.baseUrl}/Conduct`, formData, { headers });
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
    return this.http.delete(`${this.baseUrl}/Conduct/${id}`, { headers })
  }

}
