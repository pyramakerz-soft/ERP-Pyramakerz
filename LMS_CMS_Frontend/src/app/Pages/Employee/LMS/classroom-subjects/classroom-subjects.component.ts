import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { firstValueFrom } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { CommonModule } from '@angular/common';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { ClassroomSubject } from '../../../../Models/LMS/classroom-subject';
import { ClassroomSubjectService } from '../../../../Services/Employee/LMS/classroom-subject.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Employee } from '../../../../Models/Employee/employee';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-classroom-subjects',
  standalone: true,
  imports: [SearchComponent, CommonModule, FormsModule, TranslateModule],
  templateUrl: './classroom-subjects.component.html',
  styleUrl: './classroom-subjects.component.css'
})
export class ClassroomSubjectsComponent {
  classId:number = 0
  DomainName: string = '';
  UserID: number = 0; 
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'subjectEnglishName', 'subjectArabicName', 'teacherEnglishName', 'teacherArabicName'];

  AllowEdit: boolean = false;
  AllowEditForOthers: boolean = false; 
  isRtl: boolean = false;
  subscription!: Subscription;  
  ClassSubjects:ClassroomSubject[] = []
  ClassSubject:ClassroomSubject = new ClassroomSubject()
  Employees:Employee[] = []
  ChoosedCoTeacherIds:number[] = []
  isLoading: boolean = false; 
  
  isDropdownOpen = false;
  constructor(
    public account: AccountService, 
    public ApiServ: ApiService, 
    public classroomService: ClassroomService, 
    public EditDeleteServ: DeleteEditPermissionService,
    public activeRoute: ActivatedRoute,
    private menuService: MenuService,
    private classroomSubjectService: ClassroomSubjectService,
    private employeeService: EmployeeService,
    public router: Router,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader(); 
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit; 
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others; 
      }
    });

    this.classId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.DomainName = this.ApiServ.GetHeader(); 

    this.getSubjectsByClassID()
        this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  GoToClass() {
    this.router.navigateByUrl('Employee/Classroom/'+ this.classId);
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  getSubjectsByClassID(){
    this.ClassSubjects = []
    this.classroomSubjectService.GetByClassId(this.classId, this.DomainName).subscribe(
      data =>{
        this.ClassSubjects = data
      }
    )
  }

  getEmployees(){
    this.Employees = []
    this.employeeService.GetWithTypeId(4, this.DomainName).subscribe(
      data =>{
        this.Employees = data
      }
    )
  }

  GetClassSubjectById(id:number){
    this.ClassSubject = new ClassroomSubject()
    this.classroomSubjectService.GetByID(id, this.DomainName).subscribe(
      data =>{
        this.ClassSubject = data
        if(this.ClassSubject.classroomSubjectCoTeachers && this.ClassSubject.classroomSubjectCoTeachers.length > 0){
          this.ClassSubject.classroomSubjectCoTeachers.forEach(element => {
            this.ChoosedCoTeacherIds.push(element.coTeacherID)
          });
        }
      }
    )
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: ClassroomSubject[] = await firstValueFrom(
        this.classroomSubjectService.GetByClassId(this.classId, this.DomainName)
      );
      this.ClassSubjects = data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.ClassSubjects = this.ClassSubjects.filter((t) => {
          const fieldValue = t[this.key as keyof typeof t];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(this.value.toLowerCase());
          }
          if (typeof fieldValue === 'number') {
            return fieldValue.toString().includes(numericValue.toString())
          }
          return fieldValue == this.value;
        });
      }
    } catch (error) {
      this.ClassSubjects = [];
    }
  }

  Generate(){
    this.isLoading = true
    this.classroomSubjectService.Generate(this.classId, this.DomainName).subscribe(
      data =>{
        this.getSubjectsByClassID()
        this.isLoading = false
      },
      error =>{
        this.isLoading = false
        Swal.fire({
          title: error.error,
          icon: 'warning', 
          confirmButtonColor: '#089B41', 
          confirmButtonText: 'OK', 
        })
      }
    )
  }

  Save(){
    this.isLoading = true
    this.ClassSubject.coTeacherIDs = this.ChoosedCoTeacherIds 
    this.classroomSubjectService.Edit(this.ClassSubject, this.DomainName).subscribe(
      data =>{
        this.getSubjectsByClassID()
        this.closeModal()
        this.isLoading = false
      },
      error =>{
        this.isLoading = false
        Swal.fire({
          title: error.error,
          icon: 'warning', 
          confirmButtonColor: '#089B41', 
          confirmButtonText: 'OK', 
        })
      }
    )
  }

  onToggle(classSubject:ClassroomSubject) {  
    this.classroomSubjectService.IsSubjectHide(classSubject, this.DomainName).subscribe(
      data =>{ 
      },
      error =>{
        Swal.fire({
          title: error.error,
          icon: 'warning', 
          confirmButtonColor: '#089B41', 
          confirmButtonText: 'OK', 
        })
      }
    )
  }

  onToggleNotAllowed() {
    Swal.fire({
      title: 'You Are Not Allowed To Edit This',
      icon: 'warning', 
      confirmButtonColor: '#089B41', 
      confirmButtonText: 'OK', 
    })
  }

  OpenModal(id: number) { 
    this.GetClassSubjectById(id); 
    this.getEmployees(); 
    document.getElementById("Add_Modal")?.classList.remove("hidden");
    document.getElementById("Add_Modal")?.classList.add("flex");
  }

  closeModal() {
    document.getElementById("Add_Modal")?.classList.remove("flex");
    document.getElementById("Add_Modal")?.classList.add("hidden"); 

    this.isDropdownOpen = false;
    this.ClassSubject = new ClassroomSubject();
    this.ChoosedCoTeacherIds = [];
  } 

   toggleDropdown(event: MouseEvent) {
    event.stopPropagation(); // Prevent the click event from bubbling up
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  removeFromCoTeachers(ChoosedCoTeacherId:number, event: MouseEvent){
    event.stopPropagation();
    this.ChoosedCoTeacherIds = this.ChoosedCoTeacherIds.filter(_choosedCoTeacherId => _choosedCoTeacherId !== ChoosedCoTeacherId);
  }

  onCoTeacherChange(coTeacherID: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      if (!this.ChoosedCoTeacherIds.includes(coTeacherID)) {
        this.ChoosedCoTeacherIds.push(coTeacherID);
      }
    } else {
      const index = this.ChoosedCoTeacherIds.indexOf(coTeacherID);
      if (index > -1) {
        this.ChoosedCoTeacherIds.splice(index, 1);
      }
    }
  }

  toggleSelectAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.ChoosedCoTeacherIds = this.Employees.map(m => m.id);  
    } else {
      this.ChoosedCoTeacherIds = [];  
    } 
  }
}
