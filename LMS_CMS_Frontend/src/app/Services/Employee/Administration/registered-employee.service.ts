import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { RegisteredEmployee } from '../../../Models/Administrator/registered-employee';
import {RegisteredEmployeeAdd} from '../../../Models/Administrator/registered-employee';

@Injectable({
  providedIn: 'root'
})
export class RegisteredEmployeeService {

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
    return this.http.get<RegisteredEmployee[]>(`${this.baseUrl}/RegisteredEmployee`, { headers })
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
    return this.http.get<RegisteredEmployee>(`${this.baseUrl}/RegisteredEmployee/${id}`, { headers })
  } 

Add(registeredEmployee: RegisteredEmployeeAdd, DomainName?: string) {
  if (DomainName != null) {
    this.header = DomainName;
  }

  const token = localStorage.getItem('current_token');
  const headers = new HttpHeaders()
    .set('Authorization', `Bearer ${token}`)
    .set('domain-name', this.header);

  const formData = new FormData();

  formData.append('en_name', registeredEmployee.en_name || '');
  formData.append('ar_name', registeredEmployee.ar_name || '');
  // formData.append('email', registeredEmployee.email || '');
  formData.append('Email', registeredEmployee.email || '');
  formData.append('mobile', registeredEmployee.mobile || '');
  // formData.append('positionAppliedFor', registeredEmployee.positionAppliedFor || '');
  formData.append('Position', registeredEmployee.positionAppliedFor || '');
  formData.append('TitleID', registeredEmployee.titleID?.toString() || '');
  formData.append('gender', registeredEmployee.gender !== null ? registeredEmployee.gender.toString() : '')
  formData.append('birthdayDate', registeredEmployee.birthdayDate || '');
  formData.append('passportNumber', registeredEmployee.passportNumber || '');
  formData.append('maritalStatus', registeredEmployee.maritalStatus || '');
  formData.append('passportAddress', registeredEmployee.passportAddress || '');
  formData.append('currentAddress', registeredEmployee.currentAddress || '');
  formData.append('university', registeredEmployee.university || '');
  formData.append('graduationYear', registeredEmployee.graduationYear || '');
  formData.append('faculty', registeredEmployee.faculty || '');
  formData.append('major', registeredEmployee.major || '');
  formData.append('schoolYouGraduatedFrom', registeredEmployee.schoolYouGraduatedFrom || '');
  formData.append('otherStudies', registeredEmployee.otherStudies || '');
  formData.append('computerSkills', registeredEmployee.computerSkills || '');
  formData.append('hobbies', registeredEmployee.hobbies || '');
  formData.append('previousExperiencePlace', registeredEmployee.previousExperiencePlace || '');
  formData.append('position', registeredEmployee.position || '');
  formData.append('fromDate', registeredEmployee.fromDate || '');
  formData.append('toDate', registeredEmployee.toDate || '');
  formData.append('howDidYouFindUs', registeredEmployee.howDidYouFindUs || '');
  formData.append('reasonforLeavingtheJob', registeredEmployee.reasonforLeavingtheJob || '');
  formData.append('didYouHaveAnyRelativeHere', registeredEmployee.didYouHaveAnyRelativeHere || '');
  formData.append('yourLevelInEnglish', registeredEmployee.yourLevelInEnglish || '');
  formData.append('yourLevelInFrensh', registeredEmployee.yourLevelInFrensh || '');
  formData.append('doYouSpeakAnyOtherLanguages', registeredEmployee.doYouSpeakAnyOtherLanguages || '');
  formData.append('currentJob', registeredEmployee.currentJob || '');
  formData.append('lastSalary', registeredEmployee.lastSalary?.toString() || '');
  formData.append('authorizeInvestigation', registeredEmployee.authorizeInvestigation?.toString() || 'false');
  formData.append('fullName', registeredEmployee.fullName || '');
  formData.append('comment', registeredEmployee.comment || '');
  formData.append('nationality', registeredEmployee.nationality || '');

  // 1. إضافة صورة الملف الشخصي (ProfileImage) إذا موجودة
  if (registeredEmployee.profileImage && registeredEmployee.profileImage instanceof File) {
    formData.append('profileImage', registeredEmployee.profileImage, registeredEmployee.profileImage.name);
  }

  // 2. إضافة الملفات المرفقة (files) إذا موجودة
if (registeredEmployee.files && registeredEmployee.files.length > 0) {
  let uploadIndex = 0;

  registeredEmployee.files.forEach((attachment) => {
    if (attachment.file instanceof File && attachment.file.size > 0) {

      // الملف نفسه → IFormFile file
      formData.append(
        `files[${uploadIndex}].file`,
        attachment.file,
        attachment.file.name
      );

      formData.append(
        `files[${uploadIndex}].Name`,
        attachment.name || attachment.file.name
      );

      uploadIndex++;
    }
  });
}


  if (registeredEmployee.editedFiles && registeredEmployee.editedFiles.length > 0) {
    registeredEmployee.editedFiles.forEach((file, index) => {
      formData.append(`editedFiles[${index}].id`, file.id.toString());
      formData.append(`editedFiles[${index}].name`, file.name || '');
      formData.append(`editedFiles[${index}].fileName`, file.fileName || '');
      formData.append(`editedFiles[${index}].link`, file.link || '');
      formData.append(`editedFiles[${index}].type`, file.type || '');
      formData.append(`editedFiles[${index}].size`, file.size.toString());
      formData.append(`editedFiles[${index}].lastModified`, file.lastModified.toString());
    });
  }

  return this.http.post<any>(
    `${this.baseUrl}/RegisteredEmployee`,
    formData,
    { 
      headers, 
      responseType: 'text' as 'json' 
    }
  );
}
 
  Edit(registeredEmployee: RegisteredEmployee, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put<any>(`${this.baseUrl}/RegisteredEmployee`, registeredEmployee, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  } 

  Reject(registeredEmployeeID: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<any>(`${this.baseUrl}/RegisteredEmployee/Reject/${registeredEmployeeID}`, {}, { headers });
  }

  Accept(registeredEmployee: RegisteredEmployee, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<any>(`${this.baseUrl}/RegisteredEmployee/Accept`, registeredEmployee, { headers });
  }
}
