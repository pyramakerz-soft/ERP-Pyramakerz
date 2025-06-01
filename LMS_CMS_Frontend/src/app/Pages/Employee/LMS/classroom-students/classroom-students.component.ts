import { Component } from '@angular/core';
import { TokenData } from '../../../../Models/token-data';
import { ClassroomStudent } from '../../../../Models/LMS/classroom-student';
import { ClassroomStudentService } from '../../../../Services/Employee/LMS/classroom-student.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { Classroom } from '../../../../Models/LMS/classroom';
import { SearchStudentComponent } from '../../../../Component/Employee/search-student/search-student.component';
import { Student } from '../../../../Models/student';

@Component({
  selector: 'app-classroom-students',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent, SearchStudentComponent],
  templateUrl: './classroom-students.component.html',
  styleUrl: './classroom-students.component.css'
})
export class ClassroomStudentsComponent {
  classId:number = 0
  DomainName: string = '';
  UserID: number = 0; 
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'studentEnglishName', 'studentArabicName'];

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  
  ClassStudents:ClassroomStudent[] = []
  Classes:Classroom[] = []
  ClasssStudent:ClassroomStudent = new ClassroomStudent()  
  classroom:Classroom = new Classroom() 
  isLoading: boolean = false; 
  
  isDropdownOpen = false;

  isModalOpen = false;

  constructor(
    public account: AccountService, 
    public ApiServ: ApiService, 
    public classroomService: ClassroomService, 
    public EditDeleteServ: DeleteEditPermissionService,
    public activeRoute: ActivatedRoute,
    private menuService: MenuService,
    private classroomStudentService: ClassroomStudentService, 
    public router: Router
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
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others
      }
    });

    this.classId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.DomainName = this.ApiServ.GetHeader(); 

    this.getStudentsByClassID()
    this.getClassByID()
  }

  GoToClass() {
    this.router.navigateByUrl('Employee/Classroom/'+ this.classId);
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID, this.UserID, this.AllowDeleteForOthers);
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  getStudentsByClassID(){
    this.ClassStudents = []
    this.classroomStudentService.GetByClassId(this.classId, this.DomainName).subscribe(
      data =>{
        this.ClassStudents = data
      }
    )
  }

  getStudentClassByID(id:number){
    this.ClasssStudent = new ClassroomStudent()
    this.classroomStudentService.GetById(id, this.DomainName).subscribe(
      data =>{ 
        this.ClasssStudent = data  
      }
    )
  }

  getClassByID(){
    this.classroomService.GetByID(this.classId, this.DomainName).subscribe(
      data => {
        this.classroom = data
      }
    )
  }

  getClassesByGradeID(){
    this.Classes = []
    this.classroomService.GetByGradeId(this.classroom.gradeID, this.DomainName).subscribe(
      data =>{
        this.Classes = data
      }
    )
  }

  OpenModal() {
    this.isModalOpen = true;
  } 

  handleStudentSelected(students: Student[]) {
    // students.forEach(student => {
    //   var classroomStudentNew = new ClassroomStudent()
    //   classroomStudentNew.studentID = student.id
    //   classroomStudentNew.classID = this.classId
    //   this.classroomStudentService.Add(classroomStudentNew, this.DomainName).subscribe(
    //     data => {

    //     }
    //   )
    // }); 
  }
  
  OpenTransferModal(id:number){
    document.getElementById("Transfer_Modal")?.classList.remove("hidden");
    document.getElementById("Transfer_Modal")?.classList.add("flex");

    this.getStudentClassByID(id)
    this.getClassesByGradeID()
  }
  
  OpenHideModal(id:number){
    document.getElementById("Hide_Modal")?.classList.remove("hidden");
    document.getElementById("Hide_Modal")?.classList.add("flex");

    this.getStudentClassByID(id) 
  }

  closeModal(){
    document.getElementById("Transfer_Modal")?.classList.remove("flex");
    document.getElementById("Transfer_Modal")?.classList.add("hidden");

    document.getElementById("Hide_Modal")?.classList.remove("flex");
    document.getElementById("Hide_Modal")?.classList.add("hidden");
    
    this.isModalOpen = false;
  }

  SaveTransfer(){
    this.isLoading = true
    this.classroomStudentService.TransferFromClassToClass(this.ClasssStudent, this.DomainName).subscribe(
      data => {
        this.isLoading = false
        this.closeModal()
        this.getStudentsByClassID()
      }
    )
  }  

  SaveHideSubject(){
    this.isLoading = true 
    this.ClasssStudent.studentClassroomSubjects.forEach(studentClassroomSubject => {
      this.classroomStudentService.IsSubjectHide(studentClassroomSubject, this.DomainName).subscribe(
        data => {
          this.isLoading = false
          this.closeModal()
          this.getStudentsByClassID()
        }
      )
    });
  }

  deleteStudent(id:number){
    Swal.fire({
      title: 'Are you sure you want to delete this Student Classroom?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.classroomStudentService.Delete(id, this.DomainName).subscribe(
          (data: any) => { 
            this.getStudentsByClassID()
          }
        );
      }
    });
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: ClassroomStudent[] = await firstValueFrom(
        this.classroomStudentService.GetByClassId(this.classId, this.DomainName)
      );
      this.ClassStudents = data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.ClassStudents = this.ClassStudents.filter((t) => {
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
      this.ClassStudents = [];
    }
  }

}
