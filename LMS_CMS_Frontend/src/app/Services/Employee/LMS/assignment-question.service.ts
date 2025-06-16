import { Injectable } from '@angular/core';
import { Assignment } from '../../../Models/LMS/assignment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';
import { AssignmentQuestionAdd } from '../../../Models/LMS/assignment-question-add';

@Injectable({
  providedIn: 'root'
})
export class AssignmentQuestionService {
 baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }


  GetById(id : number ,DomainName:string) {
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Assignment>(`${this.baseUrl}/AssignmentQuestion/GetByID/${id}`, { headers })
  }

  Add(assignmentQuestion: AssignmentQuestionAdd, DomainName: string) {
  if (DomainName != null) {
    this.header = DomainName;
  }

  const token = localStorage.getItem("current_token");
  const headers = new HttpHeaders()
    .set('domain-name', this.header)
    .set('Authorization', `Bearer ${token}`);

  const formData = new FormData();

  // Correct way to convert number to string
  formData.append('assignmentID', assignmentQuestion.assignmentID.toString());

  // Append the file if available
  if (assignmentQuestion.file) {
    formData.append('file', assignmentQuestion.file, assignmentQuestion.file.name);
  }

  // Append each question ID
  assignmentQuestion.questionIds.forEach((id, index) => {
    formData.append(`questionIds[${index}]`, id.toString());
  });

  // Append questionAssignmentTypeCountDTO (array of objects)
  assignmentQuestion.questionAssignmentTypeCountDTO.forEach((item, index) => {
    formData.append(`questionAssignmentTypeCountDTO[${index}][numberOfQuestion]`, item.numberOfQuestion.toString());
    formData.append(`questionAssignmentTypeCountDTO[${index}][questionTypeId]`, item.questionTypeId.toString());
  });

  return this.http.post(`${this.baseUrl}/AssignmentQuestion`, formData, {
    headers: headers, // DO NOT set Content-Type here! Let the browser set it with boundary
    responseType: 'text' as 'json'
  });
}

}
