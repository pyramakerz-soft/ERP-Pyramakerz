import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HygieneFormTableComponent } from '../hygiene-form-table/hygiene-form-table.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../../../../../Services/api.service';
import Swal from 'sweetalert2';
import { HygieneTypesService } from '../../../../../Services/Employee/Clinic/hygiene-type.service';
import { HygieneTypes } from '../../../../../Models/Clinic/hygiene-types';
import { GradeService } from '../../../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../../../Services/Employee/LMS/classroom.service';
import { Grade } from '../../../../../Models/LMS/grade';
import { Classroom } from '../../../../../Models/LMS/classroom';
import { School } from '../../../../../Models/school';
import { Student } from '../../../../../Models/student';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { StudentService } from '../../../../../Services/student.service';
import { firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { HygieneFormService } from '../../../../../Services/Employee/Clinic/hygiene-form.service';

@Component({
  selector: 'app-create-hygiene-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HygieneFormTableComponent, 
    TranslateModule],
  templateUrl: './create-hygiene-form.component.html',
  styleUrls: ['./create-hygiene-form.component.css'],
})
export class CreateHygieneFormComponent implements OnInit {
    schools: School[] = [];
  grades: Grade[] = [];
  classes: Classroom[] = [];
  students: Student[] = [];
  hygieneTypes: HygieneTypes[] = [];
  errorMessage: string | null = null;
  isRtl: boolean = false;
  subscription!: Subscription;
  selectedSchool: number | null = null;
  selectedGrade: number | null = null;
  selectedClass: number | null = null;
  selectedDate: string = '';
  validationErrors: { [key: string]: string } = {};

  constructor(
    private http: HttpClient,
    private router: Router,
    private apiService: ApiService,
    private hygieneTypesService: HygieneTypesService,
    private schoolService: SchoolService,
    private gradeService: GradeService,
    private classroomService: ClassroomService,
    private studentService: StudentService,
    private languageService: LanguageService, 
    private realTimeService: RealTimeNotificationServiceService,
    private translate: TranslateService,
    private hygieneFormService: HygieneFormService


  ) {}

  ngOnInit(): void {
    this.loadHygieneTypes();
    this.loadSchools();
         this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
      this.realTimeService.stopConnection(); 
       if (this.subscription) {
        this.subscription.unsubscribe();
      }
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
   
  moveToHygieneForm() {
  this.router.navigateByUrl('Employee/Hygiene Form Medical Report');
  }

  async loadHygieneTypes() {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(this.hygieneTypesService.Get(domainName));
      this.hygieneTypes = data;
    } catch (error) {
      console.error('Error loading hygiene types:', error);
    }
  }

  async loadSchools() {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(this.schoolService.Get(domainName));
      this.schools = data;
    } catch (error) {
      console.error('Error loading schools:', error);
      this.errorMessage = 'Failed to load schools.';
    }
  }

  async loadGrades() {
    if (this.selectedSchool) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(this.gradeService.GetBySchoolId(this.selectedSchool, domainName));
        this.grades = data;
      } catch (error) {
        console.error('Error loading grades:', error);
        this.errorMessage = 'Failed to load grades.';
      }
    }
  }

  async loadClasses() {
    if (this.selectedGrade) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(this.classroomService.GetByGradeId(this.selectedGrade, domainName));
        this.classes = data;
      } catch (error) {
        console.error('Error loading classes:', error);
        this.errorMessage = 'Failed to load classes.';
      }
    }
  }

  async loadStudents() {
    if (this.selectedClass) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(this.studentService.GetByClassID(this.selectedClass, domainName));
        console.log('Loaded students:', data);
        if (data.length === 0) {
          this.errorMessage = 'No students found for the selected class.';
          this.students = [];
        } else {
          this.students = data.map((student) => ({
            ...student,
            attendance: null,
            comment: '',
            actionTaken: '',
          }));
        }
      } catch (error) {
        console.error('Error loading students: ', error);
        this.errorMessage = 'Failed to load students.';
      }
    }
  }

  onSchoolChange() {
    this.selectedGrade = null;
    this.selectedClass = null;
    this.grades = [];
    this.classes = [];
    this.students = [];
    delete this.validationErrors['school'];
    this.errorMessage = null; // Always clear error message
    this.loadGrades();
  }

  onGradeChange() {
    this.selectedClass = null;
    this.classes = [];
    this.students = [];
    delete this.validationErrors['grade'];
    this.errorMessage = null; // Always clear error message
    this.loadClasses();
  }

  onClassChange() {
    this.students = [];
    delete this.validationErrors['class'];
    this.errorMessage = null; // Always clear error message
    this.loadStudents();
  }

  onDateChange() {
    delete this.validationErrors['date'];
    this.errorMessage = null; // Always clear error message
  }

  onHygieneTypeChange() {
    this.errorMessage = null; // Clear the error message when any hygiene type is changed
  }

  checkFormValidity(): boolean {
    return !!this.selectedSchool && 
           !!this.selectedGrade && 
           !!this.selectedClass && 
           !!this.selectedDate;
  }

validateForm(): boolean {
  this.validationErrors = {};
  let isValid = true;

  if (!this.selectedSchool) {
    this.validationErrors['school'] = `${this.translate.instant('Field is required')} ${this.translate.instant('school')}`;
    isValid = false;
  }
  if (!this.selectedGrade) {
    this.validationErrors['grade'] = `${this.translate.instant('Field is required')} ${this.translate.instant('grade')}`;
    isValid = false;
  }
  if (!this.selectedClass) {
    this.validationErrors['class'] = `${this.translate.instant('Field is required')} ${this.translate.instant('class')}`;
    isValid = false;
  }
  if (!this.selectedDate) {
    this.validationErrors['date'] = `${this.translate.instant('Field is required')} ${this.translate.instant('date')}`;
    isValid = false;
  }

  if (isValid) {
    this.errorMessage = null;
  }

  return isValid;
}

saveHygieneForm() {
  if (this.validateForm()) {
    let hasHygieneTypeErrors = false;
    const hygieneTypeErrors: string[] = [];

this.students.forEach((student, index) => {
  if (student['attendance'] === true) {
    const missingHygieneTypes = this.hygieneTypes
      .filter(ht => student[`hygieneType_${ht.id}`] === null || student[`hygieneType_${ht.id}`] === undefined)
      .map(ht => ht.type);

    if (missingHygieneTypes.length > 0) {
      hasHygieneTypeErrors = true;
      
      const studentText = this.translate.instant('The Student');
      const needsSelectionsText = this.translate.instant('needs selections for');
      
      hygieneTypeErrors.push(
        `${studentText} ${this.isRtl? student.ar_name :student.en_name} ${needsSelectionsText}: ${missingHygieneTypes.join(', ')}`
      );
    }
  }
});

if (hasHygieneTypeErrors) {
  this.errorMessage = hygieneTypeErrors.join('; ');
  return;
}

    const domainName = this.apiService.GetHeader();

    const studentHygieneTypes = this.students.map((student) => {
      const hygieneTypesIds = this.hygieneTypes
        .filter((ht) => student[`hygieneType_${ht.id}`] === true)
        .map((ht) => ht.id);
      const attendance = student['attendance'] === true ? true : false;

      return {
        studentId: student.id,
        hygieneTypesIds: hygieneTypesIds,
        attendance: attendance, 
        comment: student['comment'],
        actionTaken: student['actionTaken'],
      };
    });

    const requestBody = {
      schoolId: this.selectedSchool,
      gradeId: this.selectedGrade,
      classRoomID: this.selectedClass,
      date: new Date(this.selectedDate).toISOString(),
      studentHygieneTypes: studentHygieneTypes,
    };

    this.hygieneFormService.Add(requestBody, domainName).subscribe({
      next: (response) => {
        this.showSuccessAlert(this.translate.instant('Created successfully'));
        this.router.navigate(['/Employee/Hygiene Form Medical Report']);
      },
      error: (error) => {
        console.error('Error saving hygiene form:', error);
        const errorMessage = error.error?.message || this.translate.instant('Failed to save the item');
        this.showErrorAlert(errorMessage);
      },
    });
  }
}

  onView(row: any) {
    this.router.navigate(['/Hygiene Form', row.id]);
  }
}