import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { DiscussionRoom } from '../../../Models/LMS/discussion-room';

@Injectable({
  providedIn: 'root'
})
export class DiscussionRoomService {
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
    return this.http.get<DiscussionRoom[]>(`${this.baseUrl}/DiscussionRoom`, { headers })
  }

  GetById(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<DiscussionRoom>(`${this.baseUrl}/DiscussionRoom/${id}`, { headers })
  }

  GetByIdWithoutInclude(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<DiscussionRoom>(`${this.baseUrl}/DiscussionRoom/ByIdWithoutInclude/${id}`, { headers })
  }

  Add(DiscussionRoom: DiscussionRoom, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('title', DiscussionRoom.title ?? '');
    formData.append('meetingLink', DiscussionRoom.meetingLink ?? '');
    formData.append('recordLink', DiscussionRoom.recordLink ?? '');
    formData.append('startDate', DiscussionRoom.startDate ?? '');
    formData.append('endDate', DiscussionRoom.endDate ?? '');
    formData.append('schoolID', DiscussionRoom.schoolID.toString());
    formData.append('time', DiscussionRoom.time ?? '');
    formData.append('isRepeatedWeekly', DiscussionRoom.isRepeatedWeekly.toString() ?? 'false');
    DiscussionRoom.studentClassrooms.forEach(item => {
      formData.append('studentClassrooms', item.toString());
    });

    if (DiscussionRoom.imageFile) {
      formData.append('imageFile', DiscussionRoom.imageFile, DiscussionRoom.imageFile.name);
    }

    return this.http.post(`${this.baseUrl}/DiscussionRoom`, formData, { headers });
  }

  Edit(DiscussionRoom: DiscussionRoom, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('id', DiscussionRoom.id.toString() ?? '');
    formData.append('title', DiscussionRoom.title.toString() ?? '');
    formData.append('meetingLink', DiscussionRoom.meetingLink ?? '');
    formData.append('recordLink', DiscussionRoom.recordLink ?? '');
    formData.append('startDate', DiscussionRoom.startDate ?? '');
    formData.append('endDate', DiscussionRoom.endDate ?? '');
    formData.append('time', DiscussionRoom.time ?? '');
    formData.append('isRepeatedWeekly', DiscussionRoom.isRepeatedWeekly.toString() ?? 'false');
    DiscussionRoom.studentClassrooms.forEach(item => {
      formData.append('studentClassrooms', item.toString());
    });
    formData.append('imageLink', DiscussionRoom.imageLink?.toString() ?? '');

    if (DiscussionRoom.imageFile) {
      formData.append('imageFile', DiscussionRoom.imageFile, DiscussionRoom.imageFile.name);
    }

    return this.http.put(`${this.baseUrl}/DiscussionRoom`, formData, { headers });
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
    return this.http.delete(`${this.baseUrl}/DiscussionRoom/${id}`, { headers })
  }
}
