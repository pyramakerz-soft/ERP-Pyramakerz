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
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-add-edit-subject',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './add-edit-subject.component.html',
  styleUrl: './add-edit-subject.component.css'
})
export class AddEditSubjectComponent {
  editSubject: boolean = false
  subjectId: number = 0
  subject: Subject = new Subject()
  validationErrors: { [key in keyof Subject]?: string } = {};
  DomainName: string = "";
  selectedSchool: number | null = null;
  Schools: School[] = []
  selectedSection: number | null = null;
  Sections: Section[] = []
  Grades: Grade[] = []
  subjectCategories: SubjectCategory[] = []
  isLoading = false;
  isRtl: boolean = false;
  subscription!: Subscription;

  constructor(private languageService: LanguageService, public subjectService: SubjectService, public subjectCategoryService: SubjectCategoryService, public dialogRef: MatDialogRef<AddEditSubjectComponent>,
    public schoolService: SchoolService, public sectionService: SectionService, public gradeService: GradeService, public ApiServ: ApiService, private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.editSubject = data.editSubject
    if (this.editSubject) {
      this.subjectId = data.subjectId
    }
  }

  ngOnInit() {
    const currentDir = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
    this.languageService.setLanguage(currentDir);
    this.isRtl = document.documentElement.dir === 'rtl';

    this.DomainName = this.ApiServ.GetHeader();
    if (this.editSubject) {
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

  closeDialog(NotRenderData?: boolean): void {
    this.subject = new Subject()
    this.subjectCategories = []
    this.Schools = []
    this.Sections = []
    this.Grades = []
    this.selectedSchool = null
    this.selectedSection = null

    this.isLoading = false;

    if (this.editSubject) {
      this.editSubject = false
    }
    this.validationErrors = {};
    if (NotRenderData && NotRenderData == true) {
      this.dialogRef.close(true);
    } else {
      this.dialogRef.close();
    }
  }

  getSubjectCategoryData() {
    this.subjectCategoryService.Get(this.DomainName).subscribe(
      (data) => {
        this.subjectCategories = data;
      }
    )
  }

  getSchools() {
    this.schoolService.Get(this.DomainName).subscribe(
      (data) => {
        this.Schools = data;
      }
    )
  }

  getSections() {
    this.sectionService.Get(this.DomainName).subscribe(
      (data) => {
        this.Sections = data.filter((section) => this.checkSchool(section))
      }
    )
  }

  getGrades() {
    this.gradeService.Get(this.DomainName).subscribe(
      (data) => {
        this.Grades = data.filter((grade) => this.checkSection(grade))
      }
    )
  }

  checkSchool(section: Section) {
    return section.schoolID == this.subject.schoolID
  }

  checkSection(grade: Grade) {
    return grade.sectionID == this.subject.sectionID
  }

  onSchoolChange(event: Event) {
    this.Sections = []
    this.Grades = []
    this.selectedSection = null
    this.subject.sectionID = 0
    this.subject.gradeID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedSchool = Number(selectedValue)
    if (this.selectedSchool) {
      this.getSections();
    }
  }

  onSectionChange(event: Event) {
    this.Grades = []
    this.subject.gradeID = 0
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
    this.validationErrors = {}; // Clear previous errors

    // Required field validations
    const requiredFields: (keyof Subject)[] = [
      'ar_name', 'en_name', 'creditHours', 'gradeID', 'numberOfSessionPerWeek',
      'orderInCertificate', 'passByDegree', 'totalMark', 'subjectCategoryID',
      'subjectCode', 'assignmentCutOffDatePercentage'
    ];

    for (const field of requiredFields) {
      if (!this.subject[field] && this.subject[field] !== 0) {
        const fieldName = this.getFieldDisplayName(field);
        this.validationErrors[field] = `${fieldName} ${this.translate.instant('Is Required')}`;
        isValid = false;
      }
    }

    // Length validations
    if (this.subject.en_name && this.subject.en_name.length > 100) {
      this.validationErrors['en_name'] = `${this.translate.instant('English Name')} ${this.translate.instant('cannot be longer than 100 characters')}`;
      isValid = false;
    }

    if (this.subject.ar_name && this.subject.ar_name.length > 100) {
      this.validationErrors['ar_name'] = `${this.translate.instant('Arabic Name')} ${this.translate.instant('cannot be longer than 100 characters')}`;
      isValid = false;
    }

    return isValid;
  }

  // Helper method to get display names for fields
  private getFieldDisplayName(field: keyof Subject): string {
    const fieldNames: { [key in keyof Subject]?: string } = {
      'en_name': this.translate.instant('English Name'),
      'ar_name': this.translate.instant('Arabic Name'),
      'creditHours': this.translate.instant('Credit Hours'),
      'gradeID': this.translate.instant('Grade'),
      'numberOfSessionPerWeek': this.translate.instant('Number of session per week'),
      'orderInCertificate': this.translate.instant('Order in Certificate'),
      'passByDegree': this.translate.instant('Pass By Degree'),
      'totalMark': this.translate.instant('Total Mark'),
      'subjectCategoryID': this.translate.instant('Subject Category'),
      'subjectCode': this.translate.instant('Subject Code'),
      'assignmentCutOffDatePercentage': this.translate.instant('Assignment Cut Off Date Percentage')
    };

    return fieldNames[field] || this.capitalizeField(field);
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

  SaveSubject() {
    if (this.isFormValid()) {
      if ((Number(this.subject.passByDegree) ? Number(this.subject.passByDegree) : 0) > (Number(this.subject.totalMark) ? Number(this.subject.totalMark) : 0)) {
        this.showErrorAlert(this.translate.instant('Pass By Degree cannot be greater than Total Marks'));
      } else {
        this.isLoading = true;
        if (this.editSubject == false) {
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
                    const errorMessage = error.error?.message || error.error || this.translate.instant('Failed to create subject');
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
                const errorMessage = error.error?.message || error.error || this.translate.instant('Failed to create subject');
                this.showErrorAlert(errorMessage);
              }
            );
          }
        } else {
          this.subjectService.Edit(this.subject, this.DomainName).subscribe(
            (result: any) => {
              this.closeDialog();
              this.showSuccessAlert(this.translate.instant('Subject updated successfully'));
            },
            error => {
              this.isLoading = false;
              const errorMessage = error.error?.message || error.error || this.translate.instant('Failed to update subject');
              this.showErrorAlert(errorMessage);
            }
          );
        }
      }
    }
  }
}
