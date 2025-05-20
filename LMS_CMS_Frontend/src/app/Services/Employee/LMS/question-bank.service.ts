import { Injectable } from '@angular/core';
import { QuestionBank } from '../../../Models/LMS/question-bank';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionBankService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  }

  Get(DomainName: string, pageNumber: number, pageSize: number) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<{ data: QuestionBank[], pagination: any }>(`${this.baseUrl}/QuestionBank?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers });
  }

  GetById(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<QuestionBank>(`${this.baseUrl}/QuestionBank/${id}`, { headers })
  }

  Add(questionBank: QuestionBank, domainName: string) {
    const formData = new FormData();

    // Required fields
    formData.append('Description', questionBank.description ?? '');
    formData.append('DifficultyLevel', questionBank.difficultyLevel.toString());
    formData.append('Mark', questionBank.mark.toString());
    formData.append('LessonID', questionBank.lessonID.toString());
    formData.append('BloomLevelID', questionBank.bloomLevelID.toString());
    formData.append('DokLevelID', questionBank.dokLevelID.toString());
    formData.append('QuestionTypeID', questionBank.questionTypeID.toString());

    // Optional fields
    if (questionBank.correctAnswerName)
      formData.append('CorrectAnswerName', questionBank.correctAnswerName);

    if (questionBank.essayAnswer)
      formData.append('EssayAnswer', questionBank.essayAnswer);

    if (questionBank.imageForm)
      formData.append('ImageForm', questionBank.imageForm);

    // Append tags (IDs)
    if (questionBank.questionBankTagsDTO?.length > 0) {
      let uploadIndex = 0;
      questionBank.questionBankTagsDTO.forEach((id, index) => {
        formData.append(`QuestionBankTagsDTO[${uploadIndex}]`, id.toString());
        uploadIndex++;
      });
    }

    // Append QuestionBankOptions
    if (questionBank.questionBankOptionsDTO?.length > 0) {
      let uploadIndex = 0;
      questionBank.questionBankOptionsDTO.forEach((option, index) => {
        formData.append(`QuestionBankOptionsDTO[${uploadIndex}].Option`, option.option);
        formData.append(`QuestionBankOptionsDTO[${uploadIndex}].Order`, option.order.toString());
        uploadIndex++;
      });
    }

    // Append SubBankQuestions (for Drag & Drop)
    if (questionBank.subBankQuestionsDTO?.length > 0) {
      let uploadIndex = 0;
      questionBank.subBankQuestionsDTO.forEach((item, index) => {
        formData.append(`SubBankQuestionsDTO[${uploadIndex}].Description`, item.description);
        formData.append(`SubBankQuestionsDTO[${uploadIndex}].Answer`, item.answer);
        uploadIndex++;
      });
    }

    // Headers: Do NOT set 'Content-Type' manually; the browser sets it with proper boundary
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', domainName)
      .set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.baseUrl}/QuestionBank`, formData, {
      headers,
      responseType: 'text' as 'json'
    });
  }

  Edit(questionBank: QuestionBank, domainName: string) {
    const formData = new FormData();

    // Required fields
    formData.append('ID', questionBank.id.toString() ?? '');
    formData.append('Description', questionBank.description ?? '');
    formData.append('DifficultyLevel', questionBank.difficultyLevel.toString());
    formData.append('Mark', questionBank.mark.toString());
    formData.append('LessonID', questionBank.lessonID.toString());
    formData.append('BloomLevelID', questionBank.bloomLevelID.toString());
    formData.append('DokLevelID', questionBank.dokLevelID.toString());
    formData.append('QuestionTypeID', questionBank.questionTypeID.toString());

    // Optional fields
    if (questionBank.correctAnswerName)
      formData.append('CorrectAnswerName', questionBank.correctAnswerName);

    if (questionBank.essayAnswer)
      formData.append('EssayAnswer', questionBank.essayAnswer);

    if (questionBank.imageForm)
      formData.append('ImageForm', questionBank.imageForm);

    // Append NewTags (IDs)
    if (questionBank.newQuestionBankTagsDTO?.length > 0) {
      let uploadIndex = 0;
      questionBank.newQuestionBankTagsDTO.forEach((id, index) => {
        formData.append(`NewQuestionBankTagsDTO[${uploadIndex}]`, id.toString());
        uploadIndex++;
      });
    }

    // Append DeletedTags (IDs)
    if (questionBank.deletedQuestionBankTagsDTO?.length > 0) {
      let uploadIndex = 0;
      questionBank.deletedQuestionBankTagsDTO.forEach((id, index) => {
        formData.append(`DeletedQuestionBankTagsDTO[${uploadIndex}]`, id.toString());
        uploadIndex++;
      });
    }

    // Append New QuestionBankOptions
    if (questionBank.newQuestionBankOptionsDTO?.length > 0) {
      let uploadIndex = 0;
      questionBank.newQuestionBankOptionsDTO.forEach((option, index) => {
        formData.append(`NewQuestionBankOptionsDTO[${uploadIndex}].Option`, option.option);
        formData.append(`NewQuestionBankOptionsDTO[${uploadIndex}].Order`, option.order.toString());
        uploadIndex++;
      });
    }

    // Append New SubBankQuestions (for Drag & Drop)
    if (questionBank.newSubBankQuestionsDTO?.length > 0) {
      let uploadIndex = 0;
      questionBank.newSubBankQuestionsDTO.forEach((item, index) => {
        formData.append(`NewSubBankQuestionsDTO[${uploadIndex}].Description`, item.description);
        formData.append(`NewSubBankQuestionsDTO[${uploadIndex}].Answer`, item.answer);
        uploadIndex++;
      });
    }

     // Append DeletedQuestionBankOptions (IDs)
    if (questionBank.deletedQuestionBankOptionsDTO?.length > 0) {
      let uploadIndex = 0;
      questionBank.deletedQuestionBankOptionsDTO.forEach((id, index) => {
        formData.append(`DeletedQuestionBankOptionsDTO[${uploadIndex}]`, id.toString());
        uploadIndex++;
      });
    }

     // Append DeletedSubBankQuestions (IDs)
    if (questionBank.deletedSubBankQuestionsDTO?.length > 0) {
      let uploadIndex = 0;
      questionBank.deletedQuestionBankTagsDTO.forEach((id, index) => {
        formData.append(`DeletedSubBankQuestionsDTO[${uploadIndex}]`, id.toString());
        uploadIndex++;
      });
    }

    // Headers: Do NOT set 'Content-Type' manually; the browser sets it with proper boundary
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', domainName)
      .set('Authorization', `Bearer ${token}`);

    return this.http.put(`${this.baseUrl}/QuestionBank`, formData, {
      headers,
      responseType: 'text' as 'json'
    });
  }

  Delete(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/QuestionBank/${id}`, { headers });
  }
}
