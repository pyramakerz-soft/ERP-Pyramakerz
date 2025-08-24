import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student } from '../../../../../Models/student';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-hygiene-form-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './hygiene-form-table.component.html',
  styleUrls: ['./hygiene-form-table.component.css'],
})
export class HygieneFormTableComponent {
  @Input() students: any[] = [];
  @Input() hygieneTypes: any[] = [];
  @Input() isViewOnly: boolean = false;
  @Input() showSelectAll: boolean = true;

  @Input() isRtl: boolean = false;
  @Input() subscription!: Subscription; 
  private previousAttendanceStates: { [key: number]: boolean | null } = {};



  constructor(
      private languageService: LanguageService,
      private realTimeService: RealTimeNotificationServiceService
  ) {}

  ngOnInit(): void {
   
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

  ngOnChanges() {
    this.students.forEach(student => {
      this.previousAttendanceStates[student.id] = student['attendance'];
      // Initialize hygieneTypeSelectAll to null
      student['hygieneTypeSelectAll'] = null;
    });
  }

  onAttendanceChange(student: Student) {
    if (this.previousAttendanceStates[student.id] === true && student['attendance'] === false) {
      this.resetHygieneTypes(student);
    }
    this.previousAttendanceStates[student.id] = student['attendance'];
  }

  private resetHygieneTypes(student: Student) {
    this.hygieneTypes.forEach(hygieneType => {
      student[`hygieneType_${hygieneType.id}`] = null;
    });
    student['hygieneTypeSelectAll'] = null;
  }

  setHygieneType(student: Student, hygieneTypeId: number, value: boolean) {
    if (this.isViewOnly || student['attendance'] !== true) {
      return;
    }
    student[`hygieneType_${hygieneTypeId}`] = value;
    this.updateSelectAllState(student);
  }

  setAllHygieneTypesForStudent(student: Student, value: boolean) {
    if (this.isViewOnly || student['attendance'] !== true) {
      return;
    }
    this.hygieneTypes.forEach(hygieneType => {
      student[`hygieneType_${hygieneType.id}`] = value;
    });
    student['hygieneTypeSelectAll'] = value;
  }

  private updateSelectAllState(student: Student) {
    if (!this.hygieneTypes.length) return;
    
    const allTrue = this.hygieneTypes.every(ht => student[`hygieneType_${ht.id}`] === true);
    const allFalse = this.hygieneTypes.every(ht => student[`hygieneType_${ht.id}`] === false);
    
    if (allTrue) {
      student['hygieneTypeSelectAll'] = true;
    } else if (allFalse) {
      student['hygieneTypeSelectAll'] = false;
    } else {
      student['hygieneTypeSelectAll'] = null;
    }
  }
}