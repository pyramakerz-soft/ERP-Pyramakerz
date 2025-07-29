import { Injectable } from '@angular/core';
import { ClassroomStudent } from '../../../Models/LMS/classroom-student';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';
import { StudentClassroomSubject } from '../../../Models/LMS/student-classroom-subject';
import { ClassStudentForDiscussionRoom } from '../../../Models/LMS/class-student-for-discussion-room';

@Injectable({
  providedIn: 'root'
})
export class ClassroomStudentService {
  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  GetByClassId(classID:number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<ClassroomStudent[]>(`${this.baseUrl}/ClassroomStudent/GetByClassroom/${classID}`, { headers });
  }

  GetClassForActiveAcademicYearWithStudentsIncluded( SchoolId :number ,DomainName: string){
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<ClassStudentForDiscussionRoom[]>(`${this.baseUrl}/ClassroomStudent/GetClassForActiveAcademicYearWithStudentsIncluded/${SchoolId}`, { headers });
  }

  GetById(ID:number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<ClassroomStudent>(`${this.baseUrl}/ClassroomStudent/GetByID/${ID}`, { headers });
  }

  Add(ClassroomStudent: ClassroomStudent,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/ClassroomStudent`, ClassroomStudent, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }

  TransferFromClassToClass(ClassroomStudent: ClassroomStudent,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/ClassroomStudent/TransferFromClassToClass`, ClassroomStudent, { headers });
  }

  IsSubjectHide(StudentClassroomSubject: StudentClassroomSubject,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/ClassroomStudentSubject/IsSubjectHide`, StudentClassroomSubject, { headers });
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
    return this.http.delete(`${this.baseUrl}/ClassroomStudent/${id}`, { headers })
  }
}
