import { Injectable } from '@angular/core'; 
import { ApiService } from '../api.service'; 
import { ChatMessage } from '../../Models/Communication/chat-message';
import { HttpHeaders, HttpClient } from '@angular/common/http'; 
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatMessageService {
  baseUrl = ""
  header = "" 
   
  // To make the count of messages change when open the message
  private messageOpenedSource = new Subject<void>();
  messageOpened$ = this.messageOpenedSource.asObservable();

  notifyMessageOpened() {
    this.messageOpenedSource.next();
  }
  
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
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/Chat/ByUserIDFirst5`, { headers })
  }
 
  ByUserIDWithAllOtherUsers(DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/Chat/ByUserIDWithAllOtherUsers`, { headers })
  }
 
  BySenderAndReceiverID(otherUserID:number, otherUserTypeID:number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/Chat/BySenderAndReceiverID/${otherUserID}/${otherUserTypeID}`, { headers })
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
    return this.http.get<any>(`${this.baseUrl}/Chat/UnSeenRequestCount`, { headers })
  }

  Add(chatMessage: ChatMessage, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData(); ;  
    formData.append('message', chatMessage.message ?? '');  
    formData.append('receiverUserTypeID', chatMessage.receiverUserTypeID.toString() ?? '');   

    if (chatMessage.userFilters) {
      const uf = chatMessage.userFilters;

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

    if (chatMessage.chatMessageAttachmentFiles && chatMessage.chatMessageAttachmentFiles.length > 0) { 
      chatMessage.chatMessageAttachmentFiles.forEach((file: File) => { 
        formData.append('ChatMessageAttachmentFiles', file, file.name);
      });
    }

    return this.http.post(`${this.baseUrl}/Chat`, formData, { headers });
  }   

  Forward(forwardData: ChatMessage, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    } 
    
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header) 
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json'); 

    return this.http.post(`${this.baseUrl}/Chat/Forward`, forwardData, { headers });
  }
}
