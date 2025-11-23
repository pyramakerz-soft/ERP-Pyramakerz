import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { Notification } from '../../../Models/Communication/notification';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  baseUrl = ""
  header = ""

  // To make the count of notifications change when open the message
  private notificationOpenedSource = new Subject<void>();
  notificationOpened$ = this.notificationOpenedSource.asObservable();

  notifyNotificationOpened() {
    this.notificationOpenedSource.next();
  }
  
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
    return this.http.get<Notification[]>(`${this.baseUrl}/Notification`, { headers })
  }

  GetWithPaggination(DomainName: string, pageNumber: number, pageSize: number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<{ data: Notification[], pagination: any }>(
      `${this.baseUrl}/Notification/WithPaggination?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { headers }
    );
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
    return this.http.get<Notification[]>(`${this.baseUrl}/Notification/GetByUserTypeID/${userTypeID}`, { headers })
  }

  GetByUserTypeIDWithPaggination(userTypeID:number, DomainName: string, pageNumber: number, pageSize: number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<{ data: Notification[], pagination: any }>(`${this.baseUrl}/Notification/GetByUserTypeIDWithPaggination/${userTypeID}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { headers }
    );
  }  
 
  ByUserIDFirst5(DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Notification[]>(`${this.baseUrl}/Notification/ByUserIDFirst5`, { headers })
  }
 
  ByUserID(DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Notification[]>(`${this.baseUrl}/Notification/ByUserID`, { headers })
  }
 
  GetNotNotifiedYetByUserID(DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Notification[]>(`${this.baseUrl}/Notification/GetNotNotifiedYetByUserID`, { headers })
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
    return this.http.get<Notification>(`${this.baseUrl}/Notification/${id}`, { headers })
  }
  
  ByUserIDAndNotificationSharedByID(notificationSharedByID:number ,DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Notification>(`${this.baseUrl}/Notification/ByUserIDAndNotificationSharedByID/${notificationSharedByID}`, { headers })
  }
  
  UnSeenNotificationCount(DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<any>(`${this.baseUrl}/Notification/UnSeenNotificationCount`, { headers })
  }

  Add(notification: Notification, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData(); ;  
    formData.append('text', notification.text ?? '');  
    formData.append('link', notification.link ?? '');  
    formData.append('userTypeID', notification.userTypeID.toString() ?? '');  
    formData.append('isAllowDismiss', notification.isAllowDismiss.toString() ?? 'false');   

    if (notification.userFilters) {
      const uf = notification.userFilters;

      if (uf.departmentID !== null) {
        formData.append('userFilters.departmentID', uf.departmentID.toString());
      }
      if (uf.employeeID !== null) {
        formData.append('userFilters.employeeID', uf.employeeID.toString());
      }
      if (uf.schoolID !== null) {
        formData.append('userFilters.schoolID', uf.schoolID.toString());
      }
      if (uf.sectionID !== null) {
        formData.append('userFilters.sectionID', uf.sectionID.toString());
      }
      if (uf.gradeID !== null) {
        formData.append('userFilters.gradeID', uf.gradeID.toString());
      }
      if (uf.classroomID !== null) {
        formData.append('userFilters.classroomID', uf.classroomID.toString());
      }
      if (uf.studentID !== null) {
        formData.append('userFilters.studentID', uf.studentID.toString());
      }
    }

    if (notification.imageFile) {
      formData.append('imageFile', notification.imageFile, notification.imageFile.name);
    }

    return this.http.post(`${this.baseUrl}/Notification`, formData, { headers });
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
    return this.http.delete(`${this.baseUrl}/Notification/${id}`, { headers })
  }

  LinkOpened(notificationSharedToID:number ,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put(`${this.baseUrl}/Notification/LinkOpened/${notificationSharedToID}`, {} , { headers });
  }

  DismissAll(DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put(`${this.baseUrl}/Notification/DismissAll`, {} , { headers });
  }

  DismissOne(notificationSharedToID:number ,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put(`${this.baseUrl}/Notification/DismissOne/${notificationSharedToID}`, {} , { headers });
  }
}
