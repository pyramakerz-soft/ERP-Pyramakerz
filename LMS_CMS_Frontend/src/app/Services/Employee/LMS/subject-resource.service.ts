import { Injectable } from '@angular/core';
import { SubjectResource } from '../../../Models/LMS/subject-resource';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class SubjectResourceService {
  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  GetBySubjectId(subjectID:number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<SubjectResource[]>(`${this.baseUrl}/SubjectResource/GetBySubjectId/${subjectID}`, { headers });
  }

  GetByID(id:number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<SubjectResource>(`${this.baseUrl}/SubjectResource/${id}`, { headers });
  }
  
  Add(SubjectResource: SubjectResource,DomainName:string) { 
    if (DomainName != null) {
      this.header = DomainName;
    }
  
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);
  
    const formData = new FormData();
    formData.append('englishName', SubjectResource.englishName ?? '');
    formData.append('arabicName', SubjectResource.arabicName ?? '');
    formData.append('subjectID', SubjectResource.subjectID.toString() ?? ''); 
    if (SubjectResource.file) {
      formData.append('file', SubjectResource.file, SubjectResource.file.name);
    } 
   
    return this.http.post(`${this.baseUrl}/SubjectResource`, formData, { headers });
  }

  Delete(id: number,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/SubjectResource/${id}`, { headers })
  }
}
