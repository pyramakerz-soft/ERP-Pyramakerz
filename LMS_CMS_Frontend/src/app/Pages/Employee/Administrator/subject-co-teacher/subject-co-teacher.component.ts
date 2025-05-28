import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { EmployeeGet } from '../../../../Models/Employee/employee-get';
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

@Component({
  selector: 'app-subject-co-teacher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subject-co-teacher.component.html',
  styleUrl: './subject-co-teacher.component.css'
})
export class SubjectCoTeacherComponent {

 User_Data_After_Login: TokenData = new TokenData(
    '',
    0,
    0,
    0,
    0,
    '',
    '',
    '',
    '',
    ''
  );

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  DomainName: string = '';
  UserID: number = 0;
  SupjectTeacherData: any[] = [];
  path: string = '';
  areAllClassroomsOpen: boolean = true;
  SupjectTeacher: ClassroomSubject = new ClassroomSubject()
  Classrooms: Classroom[] = []
  subject: ClassroomSubject[] = []
  validationErrors: { [key in keyof ClassroomSubject]?: string } = {};
  isLoading = false;
  employee: EmployeeGet = new EmployeeGet()

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    public ClassroomSubjectServ: ClassroomSubjectService,
    public classroomServ: ClassroomService,
    public subjectServ: SubjectService ,
    public EmpServ: EmployeeService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });
    this.SupjectTeacher.teacherID = Number(this.activeRoute.snapshot.paramMap.get('id'));
     this.EmpServ.Get_Employee_By_ID(this.SupjectTeacher.teacherID, this.DomainName).subscribe(async (data) => {
          this.employee = data; 
        })
    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });
    this.GetData();
    this.GetAllClassrooms();
  }

  moveToEmployee() {
    this.router.navigateByUrl("Employee/Employee")
  }

  GetData() {
    this.ClassroomSubjectServ.GetByEmpId(this.SupjectTeacher.teacherID, this.DomainName).subscribe((d) => {
      this.SupjectTeacherData = d
      console.log(this.SupjectTeacherData)
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
    this.SupjectTeacher.id = 0
    this.ClassroomSubjectServ.GetByClassId(this.SupjectTeacher.classroomID, this.DomainName).subscribe(d => {
      this.subject = d;
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
    if (this.isFormValid()) {
      this.isLoading = true;
      this.ClassroomSubjectServ.Edit(this.SupjectTeacher, this.DomainName).subscribe({
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
    document.getElementById("Add_Modal")?.classList.remove("hidden");
    document.getElementById("Add_Modal")?.classList.add("flex");
  }

  closeModal() {
    document.getElementById("Add_Modal")?.classList.remove("flex");
    document.getElementById("Add_Modal")?.classList.add("hidden");

    this.SupjectTeacher = new ClassroomSubject()
  }

  capitalizeField(field: keyof ClassroomSubject): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.SupjectTeacher) {
      if (this.SupjectTeacher.hasOwnProperty(key)) {
        const field = key as keyof ClassroomSubject;
        if (!this.SupjectTeacher[field]) {
          if (
            field == 'classroomID'
          ) {
            this.validationErrors[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        }
        if (this.SupjectTeacher.id == 0) {
          this.validationErrors['subjectID'] = "Subject is required"
          isValid = false;
        }
      }
    }
    return isValid;
  }

  onInputValueChange(event: { field: keyof ClassroomSubject; value: any }) {
    const { field, value } = event;

    (this.SupjectTeacher as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }
}
