import { Injectable } from '@angular/core'; 
import { ApiService } from '../api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Request } from '../../Models/Communication/request';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  baseUrl = ""
  header = "" 
   
  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
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
    return this.http.get<Request[]>(`${this.baseUrl}/Request/ByUserIDFirst5`, { headers })
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
    return this.http.get<Request[]>(`${this.baseUrl}/Request/ByUserID`, { headers })
  }
  
  ByUserIDAndRequestID(requestID:number ,DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Request>(`${this.baseUrl}/Request/ByUserIDAndRequestID/${requestID}`, { headers })
  }
  
  UnSeenRequestCount(DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<any>(`${this.baseUrl}/Request/UnSeenRequestCount`, { headers })
  }

  Add(request: Request, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData(); ;  
    // formData.append('text', notification.text ?? '');  
    // formData.append('link', notification.link ?? '');  
    // formData.append('userTypeID', notification.userTypeID.toString() ?? '');  
    // formData.append('isAllowDismiss', notification.isAllowDismiss.toString() ?? 'false');   

    // if (notification.userFilters) {
    //   const uf = notification.userFilters;

    //   if (uf.departmentID !== null) {
    //     formData.append('userFilters.departmentID', uf.departmentID.toString());
    //   }
    //   if (uf.employeeID !== null) {
    //     formData.append('userFilters.employeeID', uf.employeeID.toString());
    //   }
    //   if (uf.schoolID !== null) {
    //     formData.append('userFilters.schoolID', uf.schoolID.toString());
    //   }
    //   if (uf.sectionID !== null) {
    //     formData.append('userFilters.sectionID', uf.sectionID.toString());
    //   }
    //   if (uf.gradeID !== null) {
    //     formData.append('userFilters.gradeID', uf.gradeID.toString());
    //   }
    //   if (uf.classroomID !== null) {
    //     formData.append('userFilters.classroomID', uf.classroomID.toString());
    //   }
    //   if (uf.studentID !== null) {
    //     formData.append('userFilters.studentID', uf.studentID.toString());
    //   }
    // }

    // if (notification.imageFile) {
    //   formData.append('imageFile', notification.imageFile, notification.imageFile.name);
    // }

    return this.http.post(`${this.baseUrl}/Request`, formData, { headers });
  }  

  AcceptOrDecline(requestID:number ,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put(`${this.baseUrl}/Request/AcceptOrDecline/${requestID}`, {} , { headers });
  }

  Forward(request:Request ,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put(`${this.baseUrl}/Request/Forward`, request , { headers });
  }
}
