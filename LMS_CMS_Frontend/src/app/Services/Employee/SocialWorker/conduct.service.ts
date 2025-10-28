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
    formData.append('deletedFile', Conduct.deletedFile ?? '');
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
    formData.append('deletedFile', Conduct.deletedFile ?? '');
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

    GetConductReport(
    DomainName: string,
    fromDate: string,
    toDate: string,
    schoolId?: number,
    gradeId?: number,
    classroomId?: number,
    studentId?: number,
    conductTypeId?: number,
    procedureTypeId?: number,
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
    if (gradeId) params.append('GradeId', gradeId.toString());
    if (classroomId) params.append('ClassroomId', classroomId.toString());
    if (studentId) params.append('StudentId', studentId.toString());
    if (conductTypeId) params.append('ConductTypeId', conductTypeId.toString());
    if (procedureTypeId) params.append('ProcedureTypeId', procedureTypeId.toString());


    return this.http.get<any>(`${this.baseUrl}/Conduct/ConductReport?${params.toString()}`, { headers });
  }

  //present:
  //https://localhost:7205/api/with-domain/Conduct/ConductReport?FromDate=2025-06-15&ToDate=2025-08-31
  //givin:
  //https://localhost:7205/api/with-domain/Conduct/ConductReport?FromDate=2024-08-31&ToDate=2025-08-31

}
