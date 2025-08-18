import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { SocialWorkerMedal } from '../../../Models/SocialWorker/social-worker-medal';

@Injectable({
  providedIn: 'root'
})
export class SocialWorkerMedalService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  Get(DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<SocialWorkerMedal[]>(`${this.baseUrl}/SocialWorkerMedal`, { headers });
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
    return this.http.get<SocialWorkerMedal>(`${this.baseUrl}/SocialWorkerMedal/${id}`, { headers })
  }

  Add(socialWorkerMedal: SocialWorkerMedal, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('name', socialWorkerMedal.name ?? '');

    if (socialWorkerMedal.newFile) {
      formData.append('newFile', socialWorkerMedal.newFile, socialWorkerMedal.newFile.name);
    }

    return this.http.post(`${this.baseUrl}/SocialWorkerMedal`, formData, { headers });

  }

  Edit(socialWorkerMedal: SocialWorkerMedal, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('id', socialWorkerMedal.id.toString() ?? '');
    formData.append('name', socialWorkerMedal.name ?? '');

    if (socialWorkerMedal.newFile) {
      formData.append('newFile', socialWorkerMedal.newFile, socialWorkerMedal.newFile.name);
    }
    return this.http.put(`${this.baseUrl}/SocialWorkerMedal`, formData, { headers });
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
    return this.http.delete(`${this.baseUrl}/SocialWorkerMedal/${id}`, { headers })
  }

}
