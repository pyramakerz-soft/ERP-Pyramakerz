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
 
  GetReceivedOnesByUserID(DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Request[]>(`${this.baseUrl}/Request/GetReceivedOnesByUserID`, { headers })
  }
 
  GetSentOnesByUserID(DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Request[]>(`${this.baseUrl}/Request/GetSentOnesByUserID`, { headers })
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
    formData.append('message', request.message ?? '');  
    formData.append('link', request.link ?? '');  
    formData.append('receiverUserTypeID', request.receiverUserTypeID.toString() ?? '');    
    formData.append('receiverID', request.receiverID.toString() ?? '');    
    formData.append('studentID', request.studentID.toString() ?? '');    

    if (request.fileFile) {
      formData.append('fileFile', request.fileFile, request.fileFile.name);
    }

    return this.http.post(`${this.baseUrl}/Request`, formData, { headers });
  }  

  Accept(requestID:number ,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put(`${this.baseUrl}/Request/Accept/${requestID}`, {} , { headers });
  }

  Decline(requestID:number ,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put(`${this.baseUrl}/Request/Decline/${requestID}`, {} , { headers });
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
