import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Classroom } from '../../../../Models/LMS/classroom';
import { ClassroomSubject } from '../../../../Models/LMS/classroom-subject';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { ClassroomSubjectService } from '../../../../Services/Employee/LMS/classroom-subject.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { ClassroomSubjectCoTeacher } from '../../../../Models/LMS/classroom-subject-co-teacher';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { Employee } from '../../../../Models/Employee/employee';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';
@Component({
  selector: 'app-subject-co-teacher',
  standalone: true,
  imports: [CommonModule, FormsModule , TranslateModule],
  templateUrl: './subject-co-teacher.component.html',
  styleUrl: './subject-co-teacher.component.css'
})

@InitLoader()
export class SubjectCoTeacherComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

 isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  UserID: number = 0;
  SupjectTeacherData: any[] = []; 
  areAllClassroomsOpen: boolean = true;
  SupjectCoTeacher: ClassroomSubjectCoTeacher = new ClassroomSubjectCoTeacher()
  Classrooms: Classroom[] = []
  subject: ClassroomSubject[] = []
  validationErrors: { [key in keyof ClassroomSubjectCoTeacher]?: string } = {};
  isLoading = false;
  employee: Employee = new Employee()
  SelectedClassId : number =0
  IsSelectedClassId : string =""

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    public ClassroomSubjectServ: ClassroomSubjectService,
    public classroomServ: ClassroomService,
    public subjectServ: SubjectService ,
    public EmpServ: EmployeeService,
    private languageService: LanguageService, 
    private loadingService: LoadingService 
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
     
    this.SupjectCoTeacher.coTeacherID = Number(this.activeRoute.snapshot.paramMap.get('id'));
     this.EmpServ.Get_Employee_By_ID(this.SupjectCoTeacher.coTeacherID, this.DomainName).subscribe(async (data) => {
          this.employee = data; 
        })
     
    this.GetData();
    this.GetAllClassrooms();
       this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';   
  }

  ngOnDestroy(): void { 
      if (this.subscription) {
      this.subscription.unsubscribe();
    }
  } 

  moveToEmployee() {
    this.router.navigateByUrl(`Employee/Employee/${this.SupjectCoTeacher.coTeacherID}`)
  }

  GetData() {
    this.ClassroomSubjectServ.GetByEmpCoTeacherId(this.SupjectCoTeacher.coTeacherID, this.DomainName).subscribe((d) => {
      this.SupjectTeacherData = d
    })
  }

  GetAllClassrooms() {
    this.Classrooms = []
    this.classroomServ.Get(this.DomainName).subscribe((d) => {
      this.Classrooms = d
    })
  }

  GetSubjectByClassroom() {
    this.subject = [];
    this.IsSelectedClassId =""
    this.SupjectCoTeacher.classroomSubjectID = 0
    this.ClassroomSubjectServ.GetByClassId(this.SelectedClassId, this.DomainName).subscribe(d => {
      this.subject = d;

      const assignedSubjects = this.SupjectTeacherData
      .flatMap(item => item.subjects)  // Extract subjects from each class object
      .map(sub => ({
        subjectID: sub.subjectID,
        classroomID: sub.classroomID
      }));

      // Filter out subjects already assigned to this teacher in this class
      this.subject = d.filter(sub =>
        !assignedSubjects.some(assigned =>
          assigned.subjectID === sub.subjectID &&
          assigned.classroomID === sub.classroomID
        )
      );
    });
  }

  toggleChildren(item: any) {
    item.isOpen = !item.isOpen;
  }

  toggleAllClassrooms() {
    this.areAllClassroomsOpen = !this.areAllClassroomsOpen;
  }

  Add() {
    this.openModal()
  }

  AddSupjectTeacher() {
    if(this.isFormValid()){
      this.isLoading = true;
      this.ClassroomSubjectServ.AddCoTeacher(this.SupjectCoTeacher, this.DomainName).subscribe({
        next: () => {
          this.GetData();
          this.isLoading = false;
          this.closeModal();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred',
            confirmButtonColor: '#089B41',
          });
          this.isLoading = false;
          this.closeModal();
        }
      });
    }
  }

  openModal() {
    this.SupjectCoTeacher.classroomSubjectID=0
    this.SelectedClassId=0

    document.getElementById("Add_Modal")?.classList.remove("hidden");
    document.getElementById("Add_Modal")?.classList.add("flex");
  }

  closeModal() {
    document.getElementById("Add_Modal")?.classList.remove("flex");
    document.getElementById("Add_Modal")?.classList.add("hidden");

  }

  capitalizeField(field: keyof ClassroomSubject): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.SupjectCoTeacher) {
      if (this.SupjectCoTeacher.hasOwnProperty(key)) {
        const field = key as keyof ClassroomSubjectCoTeacher;
        if (this.SupjectCoTeacher.classroomSubjectID == 0) {
          this.validationErrors['classroomSubjectID'] = "Subject is required"
          isValid = false;
        }
         if (this.SelectedClassId == 0) {
          this.IsSelectedClassId = "Class is required"
          isValid = false;
        }
      }
    }
    return isValid;
  }

  onInputValueChange(event: { field: keyof ClassroomSubjectCoTeacher; value: any }) {
    const { field, value } = event;

    (this.SupjectCoTeacher as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }
}
