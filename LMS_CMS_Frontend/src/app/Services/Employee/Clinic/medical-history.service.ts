import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DoctorMedicalHistory, ParentMedicalHistory } from '../../../Models/Clinic/MedicalHistory';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root',
})
export class MedicalHistoryService {
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  
  GetByDoctor(DomainName: string): Observable<DoctorMedicalHistory[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');
    return this.http.get<DoctorMedicalHistory[]>(`${this.baseUrl}/MedicalHistory/GetByDoctor`, { headers });
  }

// In medical-history.service.ts

GetByParent(DomainName: string): Observable<ParentMedicalHistory[]> {
    if (DomainName != null) {
        this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
        .set('Domain-Name', this.header)
        .set('Authorization', `Bearer ${token}`)
        .set('accept', '*/*');
    
    return this.http.get<ParentMedicalHistory[]>(
        `${this.baseUrl}/MedicalHistory/GetByParent`, 
        { headers }
    );
}

UpdateByParentAsync(
    medicalHistory: ParentMedicalHistory, 
    DomainName: string
): Observable<any> {
    if (DomainName != null) {
        this.header = DomainName;
    }

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
        .set('Domain-Name', this.header)
        .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('Id', medicalHistory.id.toString());
    formData.append('Details', medicalHistory.details);
    formData.append('PermanentDrug', medicalHistory.permanentDrug);

    // Handle file uploads
    if (medicalHistory.firstReport instanceof File) {
        formData.append('FirstReportFile', medicalHistory.firstReport, medicalHistory.firstReport.name);
    } else if (medicalHistory.firstReport === null) {
        formData.append('FirstReport', '');
    } else {
        formData.append('FirstReport', medicalHistory.firstReport);
    }

    if (medicalHistory.secReport instanceof File) {
        formData.append('SecReportFile', medicalHistory.secReport, medicalHistory.secReport.name);
    } else if (medicalHistory.secReport === null) {
        formData.append('SecReport', '');
    } else {
        formData.append('SecReport', medicalHistory.secReport);
    }

    return this.http.put(
        `${this.baseUrl}/MedicalHistory/UpdateByParentAsync`, 
        formData, 
        { headers }
    );
}

  
  AddByDoctor(medicalHistory: DoctorMedicalHistory, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('Id', medicalHistory.id?.toString() ?? '');
    formData.append('SchoolId', medicalHistory.schoolId?.toString() ?? '');
    formData.append('GradeId', medicalHistory.gradeId?.toString() ?? '');
    formData.append('ClassRoomID', medicalHistory.classRoomID?.toString() ?? '');
    formData.append('StudentId', medicalHistory.studentId?.toString() ?? '');
    formData.append('Details', medicalHistory.details ?? '');
    formData.append('PermanentDrug', medicalHistory.permanentDrug ?? '');
    formData.append('Date', medicalHistory.insertedAt ?? '');

    
    if (medicalHistory.firstReport instanceof File) {
      formData.append('FirstReport', medicalHistory.firstReport, medicalHistory.firstReport.name);
    } else if (medicalHistory.firstReport === null) {
      formData.append('FirstReport', ''); 
    } else {
      formData.append('FirstReport', medicalHistory.firstReport); 
    }

    
    if (medicalHistory.secReport instanceof File) {
      formData.append('secReport', medicalHistory.secReport, medicalHistory.secReport.name);
    } else if (medicalHistory.secReport === null) {
      formData.append('SecReport', ''); 
    } else {
      formData.append('SecReport', medicalHistory.secReport); 
    }
    return this.http.post(`${this.baseUrl}/MedicalHistory/AddByDoctor`, formData, { headers });
  }

  
  UpdateByDoctorAsync(medicalHistory: DoctorMedicalHistory, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('Id', medicalHistory.id?.toString() ?? '');
    formData.append('SchoolId', medicalHistory.schoolId?.toString() ?? '');
    formData.append('GradeId', medicalHistory.gradeId?.toString() ?? '');
    formData.append('ClassRoomID', medicalHistory.classRoomID?.toString() ?? '');
    formData.append('StudentId', medicalHistory.studentId?.toString() ?? '');
    formData.append('Details', medicalHistory.details ?? '');
    formData.append('PermanentDrug', medicalHistory.permanentDrug ?? '');
    formData.append('Date', medicalHistory.insertedAt ?? '');

    
    if (medicalHistory.firstReport instanceof File) {
      formData.append('FirstReportFile', medicalHistory.firstReport, medicalHistory.firstReport.name);
    } else if (medicalHistory.firstReport === null) {
      formData.append('FirstReport', ''); 
    } else {
      formData.append('FirstReport', medicalHistory.firstReport); 
    }

    
    if (medicalHistory.secReport instanceof File) {
      formData.append('SecReportFile', medicalHistory.secReport, medicalHistory.secReport.name);
    } else if (medicalHistory.secReport === null) {
      formData.append('SecReport', ''); 
    } else {
      formData.append('SecReport', medicalHistory.secReport); 
    }

    return this.http.put(`${this.baseUrl}/MedicalHistory/UpdateByDoctorAsync`, formData, { headers });
  }

  
  Delete(id: number, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*')
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/MedicalHistory/id?id=${id}`, { headers, responseType: 'text' });
  }

  
  GetByIdByDoctor(id: number, DomainName: string): Observable<DoctorMedicalHistory> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', '*/*');
    return this.http.get<DoctorMedicalHistory>(`${this.baseUrl}/MedicalHistory/GetByIdByDoctor/id?id=${id}`, { headers });
  }

  
//   Search(key: string, value: string, DomainName: string): Observable<MedicalHistory[]> {
//     if (DomainName != null) {
//       this.header = DomainName;
//     }
//     const token = localStorage.getItem('current_token');
//     const headers = new HttpHeaders()
//       .set('Domain-Name', this.header)
//       .set('Authorization', `Bearer ${token}`)
//       .set('accept', '*/*');
//     return this.http.get<MedicalHistory[]>(`${this.baseUrl}/MedicalHistory/search?key=${key}&value=${value}`, { headers });
//   }

  
  
//   GetByParent(DomainName: string): Observable<MedicalHistory[]> {
//     if (DomainName != null) {
//       this.header = DomainName;
//     }
//     const token = localStorage.getItem('current_token');
//     const headers = new HttpHeaders()
//       .set('Domain-Name', this.header)
//       .set('Authorization', `Bearer ${token}`)
//       .set('accept', '*/*');
//     return this.http.get<MedicalHistory[]>(`${this.baseUrl}/MedicalHistory/GetByParent`, { headers });
//   }

  
//   GetByIdByParent(id: number, DomainName: string): Observable<MedicalHistory> {
//     if (DomainName != null) {
//       this.header = DomainName;
//     }
//     const token = localStorage.getItem('current_token');
//     const headers = new HttpHeaders()
//       .set('Domain-Name', this.header)
//       .set('Authorization', `Bearer ${token}`)
//       .set('accept', '*/*');
//     return this.http.get<MedicalHistory>(`${this.baseUrl}/MedicalHistory/GetByIdByParent/id?id=${id}`, { headers });
//   }

  
  AddByParent(medicalHistory: ParentMedicalHistory, DomainName: string): Observable<any> {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('Details', medicalHistory.details ?? '');
    formData.append('PermanentDrug', medicalHistory.permanentDrug ?? '');

    
    if (medicalHistory.firstReport instanceof File) {
      formData.append('FirstReport', medicalHistory.firstReport, medicalHistory.firstReport.name);
    } else if (medicalHistory.firstReport === null) {
      formData.append('FirstReport', ''); 
    } else {
      formData.append('FirstReport', medicalHistory.firstReport); 
    }

    
    if (medicalHistory.secReport instanceof File) {
      formData.append('SecReport', medicalHistory.secReport, medicalHistory.secReport.name);
    } else if (medicalHistory.secReport === null) {
      formData.append('SecReport', ''); 
    } else {
      formData.append('SecReport', medicalHistory.secReport); 
    }

    return this.http.post(`${this.baseUrl}/MedicalHistory/AddByParent`, formData, { headers });
  }

}