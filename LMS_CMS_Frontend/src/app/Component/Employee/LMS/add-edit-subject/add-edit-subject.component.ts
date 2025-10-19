import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from '../../../../Models/LMS/subject';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { SubjectCategoryService } from '../../../../Services/Employee/LMS/subject-category.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { SectionService } from '../../../../Services/Employee/LMS/section.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Grade } from '../../../../Models/LMS/grade';
import { Section } from '../../../../Models/LMS/section';
import { School } from '../../../../Models/school';
import { ApiService } from '../../../../Services/api.service';
import { SubjectCategory } from '../../../../Models/LMS/subject-category';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-add-edit-subject',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './add-edit-subject.component.html',
  styleUrl: './add-edit-subject.component.css'
})
export class AddEditSubjectComponent {
  editSubject:boolean = false
  subjectId:number = 0
  subject:Subject = new Subject()
  validationErrors: { [key in keyof Subject]?: string } = {};
  DomainName: string = "";
  selectedSchool: number | null = null;
  Schools: School[] = []
  selectedSection: number | null = null;
  Sections: Section[] = []
  Grades: Grade[] = []
  subjectCategories:SubjectCategory[] = []
  isLoading = false;
  isRtl: boolean = false;
  subscription!: Subscription;

  constructor( private languageService: LanguageService,public subjectService: SubjectService, public subjectCategoryService: SubjectCategoryService, public dialogRef: MatDialogRef<AddEditSubjectComponent>, 
    public schoolService: SchoolService, public sectionService:SectionService, public gradeService:GradeService, public ApiServ:ApiService,  private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.editSubject = data.editSubject
      if(this.editSubject){
        this.subjectId = data.subjectId
      }
  }
      
  ngOnInit(){
    const currentDir = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
    this.languageService.setLanguage(currentDir);
    this.isRtl = document.documentElement.dir === 'rtl';
    
    this.DomainName = this.ApiServ.GetHeader();
    if(this.editSubject){
      this.GetSubjectById(this.subjectId)
    } 
    this.getSubjectCategoryData() 
    this.getSchools()
    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
  }

  GetSubjectById(subjectId: number) {
    this.subjectService.GetByID(subjectId, this.DomainName).subscribe((data) => {
      this.subject = data;
      this.getSections()
      this.getGrades()
    });
  }

  private showErrorAlert(errorMessage: string) {
  const translatedTitle = this.translate.instant('Error');
  const translatedButton = this.translate.instant('Okay');
  
  Swal.fire({
    icon: 'error',
    title: translatedTitle,
    text: errorMessage,
    confirmButtonText: translatedButton,
    customClass: { confirmButton: 'secondaryBg' },
  });
}

private showSuccessAlert(message: string) {
  const translatedTitle = this.translate.instant('Success');
  const translatedButton = this.translate.instant('Okay');
  
  Swal.fire({
    icon: 'success',
    title: translatedTitle,
    text: message,
    confirmButtonText: translatedButton,
    customClass: { confirmButton: 'secondaryBg' },
  });
}

  closeDialog(): void {
    this.subject= new Subject()
    this.subjectCategories = []
    this.Schools = []
    this.Sections = []
    this.Grades = []
    this.selectedSchool = null
    this.selectedSection = null

    this.isLoading = false;

    if(this.editSubject){
      this.editSubject = false
    }
    this.validationErrors = {}; 

    this.dialogRef.close();
  }

  getSubjectCategoryData(){
    this.subjectCategoryService.Get(this.DomainName).subscribe(
      (data) => {
        this.subjectCategories = data;
      }
    )
  }

  getSchools(){
    this.schoolService.Get(this.DomainName).subscribe(
      (data) => {
        this.Schools = data;
      }
    )
  }

  getSections(){
    this.sectionService.Get(this.DomainName).subscribe(
      (data) => {
        this.Sections = data.filter((section) => this.checkSchool(section))
      }
    )
  }

  getGrades(){
    this.gradeService.Get(this.DomainName).subscribe(
      (data) => {
        this.Grades = data.filter((grade) => this.checkSection(grade))
      }
    )
  }

  checkSchool(section:Section) {
    return section.schoolID == this.subject.schoolID
  }
 
  checkSection(grade:Grade) {
    return grade.sectionID == this.subject.sectionID
  }

  onSchoolChange(event: Event) {
    this.Sections = []
    this.Grades = []
    this.selectedSection = null
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedSchool = Number(selectedValue)
    if (this.selectedSchool) {
      this.getSections(); 
    }
  }
 
  onSectionChange(event: Event) {
    this.Grades = []
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedSection = Number(selectedValue)
    if (this.selectedSection) {
      this.getGrades(); 
    }
  }

  capitalizeField(field: keyof Subject): string {
      return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

isFormValid(): boolean {
  let isValid = true;
  for (const key in this.subject) {
    if (this.subject.hasOwnProperty(key)) {
      const field = key as keyof Subject;
      if (!this.subject[field]) {
        if(field == "ar_name" || field == "en_name" || field == "creditHours" || field == "gradeID" || field == "numberOfSessionPerWeek" || field == "orderInCertificate"
           || field == "passByDegree"  || field == "totalMark"  || field == "subjectCategoryID"  || field == "subjectCode" || field == "assignmentCutOffDatePercentage"
        ){
          this.validationErrors[field] = this.translate.instant('Field is required', { field: field });
          isValid = false;
        } 
      } else {
        if(field == "en_name" || field == "ar_name"){
          if(this.subject.en_name.length > 100 || this.subject.ar_name.length > 100){
            this.validationErrors[field] = this.translate.instant('Field cannot be longer than 100 characters', { field: field });
            isValid = false;
          }
        } else{
          this.validationErrors[field] = '';
        }
      }
    }
  }
  return isValid;
}

  validateNumber(event: any, field: keyof Subject): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = ''; 
      if (typeof this.subject[field] === 'string') {
        this.subject[field] = '' as never;  
      }
    }
  }

  validateNumberOnly(event: any, field: keyof Subject): void {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '')
    event.target.value = value;
    if (isNaN(value) || value === '') {
      event.target.value = ''; 
      if (typeof this.subject[field] === 'string') {
        this.subject[field] = '' as never;  
      }
    }
  }

  onIsHideChange(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.subject.hideFromGradeReport = isChecked
  }

  onInputValueChange(event: { field: keyof Subject, value: any }) {
    const { field, value } = event;
    (this.subject as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

onImageFileSelected(event: any) {
  const file: File = event.target.files[0];
  const input = event.target as HTMLInputElement;
  
  if (file) {
    if (file.size > 25 * 1024 * 1024) {
      this.validationErrors['iconFile'] = this.translate.instant('The file size exceeds the maximum limit of 25 MB');
      this.subject.iconFile = null;
      return; 
    }
    if (file.type === 'image/jpeg' || file.type === 'image/png') {
      this.subject.iconFile = file; 
      this.validationErrors['iconFile'] = ''; 

      const reader = new FileReader();
      reader.readAsDataURL(file);
    } else {
      this.validationErrors['iconFile'] = this.translate.instant('Invalid file type. Only JPEG, JPG and PNG are allowed');
      this.subject.iconFile = null;
      return; 
    }
  }
  
  input.value = '';
}

SaveSubject(){
  if(this.isFormValid()){ 
    if((Number(this.subject.passByDegree)?Number(this.subject.passByDegree):0) > (Number(this.subject.totalMark)?Number(this.subject.totalMark):0)){
      this.showErrorAlert(this.translate.instant('Pass By Degree cannot be greater than Total Marks'));
    }else{
      this.isLoading = true;
      if(this.editSubject == false){
        if (!this.subject.iconFile) {
          fetch('Images/DummySubject.jpg')
          .then(res => res.blob())
          .then(blob => {
            this.subject.iconFile = new File([blob], 'DummySubject.jpg', { type: 'image/jpeg' });

            this.subjectService.Add(this.subject, this.DomainName).subscribe(
              (result: any) => {
                this.closeDialog();
                this.showSuccessAlert(this.translate.instant('Subject created successfully'));
              },
              error => {
                this.isLoading = false; 
                const errorMessage = error.error?.message || this.translate.instant('Failed to create subject');
                this.showErrorAlert(errorMessage);
              }
            );
          });
        } else {
          this.subjectService.Add(this.subject, this.DomainName).subscribe(
            (result: any) => {
              this.closeDialog();
              this.showSuccessAlert(this.translate.instant('Subject created successfully'));
            },
            error => {
              this.isLoading = false; 
              const errorMessage = error.error?.message || this.translate.instant('Failed to create subject');
              this.showErrorAlert(errorMessage);
            }
          );
        }       
      } else{
        this.subjectService.Edit(this.subject, this.DomainName).subscribe(
          (result: any) => {
            this.closeDialog();
            this.showSuccessAlert(this.translate.instant('Subject updated successfully'));
          },
          error => {
            this.isLoading = false; 
            const errorMessage = error.error?.message || this.translate.instant('Failed to update subject');
            this.showErrorAlert(errorMessage);
          }
        );
      }  
    }
  }
} 
}
