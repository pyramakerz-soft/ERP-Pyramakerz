import { Injectable } from '@angular/core';
import { RegistrationFormSubmissionConfirmation } from '../../../Models/Registration/registration-form-submission-confirmation';
import { ApiService } from '../../api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RegistrationFormSubmission } from '../../../Models/Registration/registration-form-submission';

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

  Edit(submission: RegistrationFormSubmission[], DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(
      `${this.baseUrl}/RegisterationFormSubmittion`,
      submission,
      { headers }
    );
  }
}
