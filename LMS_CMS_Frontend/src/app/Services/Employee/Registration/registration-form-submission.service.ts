import { Injectable } from '@angular/core';
import { RegistrationFormSubmissionConfirmation } from '../../../Models/Registration/registration-form-submission-confirmation';
import { ApiService } from '../../api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RegistrationFormSubmission } from '../../../Models/Registration/registration-form-submission';
import { RegistrationFormForFormSubmissionForFiles } from '../../../Models/Registration/registration-form-for-form-submission-for-files';

@Injectable({
  providedIn: 'root',
})
export class RegistrationFormSubmissionService {
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  GetByRegistrationParentID(parentId: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<RegistrationFormSubmissionConfirmation[]>(
      `${this.baseUrl}/RegisterationFormSubmittion/GetByRegistrationParentID/${parentId}`,
      { headers }
    );
  }

  Add(submission: RegistrationFormSubmission[], DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.post(
      `${this.baseUrl}/RegisterationFormSubmittion`,
      submission,
      { headers }
    );
  }

  Edit(StudentId: number, RegistrationParentID: number, submission: RegistrationFormSubmission[], registrationFormForFiles: RegistrationFormForFormSubmissionForFiles[], DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }

    const Id14 = submission.find(r=>r.selectedFieldOptionID==14)
    if(Id14){
      console.log("Id14:", JSON.stringify(Id14, null, 2));
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)

    const formData = new FormData();

    submission.forEach((field: any, index) => {
      if (field.textAnswer != null && field.textAnswer != undefined) {
        formData.append(`newData[${index}].TextAnswer`, field.textAnswer.toString());
      }

      if (field.selectedFieldOptionID != null && field.selectedFieldOptionID != undefined) {
        formData.append(`newData[${index}].SelectedFieldOptionID`, field.selectedFieldOptionID.toString());
      }
      formData.append(`newData[${index}].CategoryFieldID`, field.categoryFieldID.toString());
      formData.append(`newData[${index}].Id`, field.id.toString());
      formData.append(`newData[${index}].RegisterationFormParentID`, field.registerationFormParentID.toString());
    });

    if (registrationFormForFiles && registrationFormForFiles.length > 0) {
      registrationFormForFiles.forEach((file: any, index) => {
        formData.append(`filesFieldCat[${index}].CategoryFieldID`, file.categoryFieldID.toString());
        formData.append(`filesFieldCat[${index}].SelectedFile`, file.selectedFile, file.selectedFile.name);
      });
    }

    return this.http.put(`${this.baseUrl}/RegisterationFormSubmittion/${StudentId}`, formData, {
      headers: headers});
  }
}
