import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { Classroom } from '../../../Models/LMS/classroom';
import { CopyClassroom } from '../../../Models/LMS/copy-classroom';

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }


  Get(DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Classroom[]>(`${this.baseUrl}/Classroom`, { headers })
  }

  GetByGradeId(GradeId:number,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Classroom[]>(`${this.baseUrl}/Classroom/ByGradeID/${GradeId}`, { headers })
  }

  GetBySubjectId(SubjectId:number,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Classroom[]>(`${this.baseUrl}/Classroom/GetBySubject/${SubjectId}`, { headers })
  }  

  GetFailedClassesBySubject(SubjectId:number, date:string, DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Classroom[]>(`${this.baseUrl}/Classroom/GetFailedClassesBySubject/${SubjectId}/${date}`, { headers })
  }  

  GetBySchoolId(schoolId:number,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Classroom[]>(`${this.baseUrl}/Classroom/GetBySchoolId/${schoolId}`, { headers })
  }

  GetByGradeAndAcYearId(GradeId:number, AcYearId:number,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Classroom[]>(`${this.baseUrl}/Classroom/ByGradeAndAcademicYearID/${GradeId}/${AcYearId}`, { headers })
  }

  ByGradeAndAcademicYearIDAndStudent(GradeId:number, AcYearId:number,StudentId : number, DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Classroom[]>(`${this.baseUrl}/Classroom/ByGradeAndAcademicYearIDAndStudent/${GradeId}/${AcYearId}/${StudentId}`, { headers })
  }  

  GetByAcYearId(AcYearId:number,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Classroom[]>(`${this.baseUrl}/Classroom/ByAcademicYearID/${AcYearId}`, { headers })
  }

  GetByActiveAcYear(DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Classroom[]>(`${this.baseUrl}/Classroom/ByActiveAcademicYearID`, { headers })
  }

  GetByLessonID(LessonID:number, DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Classroom[]>(`${this.baseUrl}/Classroom/GetByLessonID/${LessonID}`, { headers })
  }

  Add(Classroom: Classroom,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/Classroom`, Classroom, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }

  Edit(Classroom: Classroom,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/Classroom`, Classroom, { headers });
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
    return this.http.delete(`${this.baseUrl}/Classroom/${id}`, { headers })
  }

  GetByID(id: number,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Classroom>(`${this.baseUrl}/Classroom/${id}`, { headers })
  }

  CopyClassroom(copyClassroom: CopyClassroom,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/Classroom/CopyClassroom`, copyClassroom, { headers });
  }

  GetByRegistrationFormParentID(id: number,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Classroom[]>(`${this.baseUrl}/Classroom/ByRegistrationFormParentId/${id}`, { headers })
  }

  
  AddStudentToClass(RegistrationParentId:number,ClassId:number ,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/Classroom/AddStudentToClassroom/${RegistrationParentId}/${ClassId}`, {}, { headers })
  }

}

