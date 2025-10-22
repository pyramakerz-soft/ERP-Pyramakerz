import { Injectable } from '@angular/core';
import { Announcement } from '../../../Models/Administrator/announcement';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
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
    return this.http.get<Announcement[]>(`${this.baseUrl}/Announcement`, { headers })
  }
 
  GetByUserTypeID(userTypeID:number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Announcement[]>(`${this.baseUrl}/Announcement/GetByUserTypeID/${userTypeID}`, { headers })
  }
 
  GetMyAnnouncement(DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Announcement[]>(`${this.baseUrl}/Announcement/GetMyAnnouncement`, { headers })
  }

  GetById(id:number ,DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Announcement>(`${this.baseUrl}/Announcement/${id}`, { headers })
  }

  Add(announcement: Announcement, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('title', announcement.title ?? '');  
    announcement.userTypeIDs.forEach(item => {
      formData.append('userTypeIDs', item.toString());
    }); 

    if (announcement.imageFile) {
      formData.append('imageFile', announcement.imageFile, announcement.imageFile.name);
    }

    return this.http.post(`${this.baseUrl}/Announcement`, formData, { headers });
  }

  Edit(announcement: Announcement, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('id', announcement.id.toString() ?? '');
    formData.append('title', announcement.title.toString() ?? ''); 
    announcement.userTypeIDs.forEach(item => {
      formData.append('userTypeIDs', item.toString());
    }); 
    formData.append('imageLink', announcement.imageLink?.toString() ?? '');

    if (announcement.imageFile) {
      formData.append('imageFile', announcement.imageFile, announcement.imageFile.name);
    }

    return this.http.put(`${this.baseUrl}/Announcement`, formData, { headers });
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
    return this.http.delete(`${this.baseUrl}/Announcement/${id}`, { headers })
  }
}
 