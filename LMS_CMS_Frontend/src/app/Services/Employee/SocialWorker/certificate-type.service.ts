import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { CertificateType } from '../../../Models/SocialWorker/certificate-type';

@Injectable({
  providedIn: 'root'
})
export class CertificateTypeService {

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

    return this.http.get<CertificateType[]>(`${this.baseUrl}/CertificateType`, { headers });
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
    return this.http.get<CertificateType>(`${this.baseUrl}/CertificateType/${id}`, { headers })
  }

  Add(certificateType: CertificateType, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('name', certificateType.name ?? '');
    formData.append('topSpace', certificateType.topSpace.toString() ?? '');
    formData.append('leftSpace', certificateType.leftSpace.toString() ?? '');


    if (certificateType.newFile) {
      formData.append('newFile', certificateType.newFile, certificateType.newFile.name);
    }

    return this.http.post(`${this.baseUrl}/CertificateType`, formData, { headers });

  }

  Edit(certificateType: CertificateType, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('id', certificateType.id.toString() ?? '');
    formData.append('name', certificateType.name ?? '');
    formData.append('topSpace', certificateType.topSpace.toString() ?? '');
    formData.append('leftSpace', certificateType.leftSpace.toString() ?? '');

    if (certificateType.newFile) {
      formData.append('newFile', certificateType.newFile, certificateType.newFile.name);
    }
    return this.http.put(`${this.baseUrl}/CertificateType`, formData, { headers });
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
    return this.http.delete(`${this.baseUrl}/CertificateType/${id}`, { headers })
  }

}
