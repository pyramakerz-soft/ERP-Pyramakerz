import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms'; 
import { NotificationService } from '../../../../Services/Employee/Communication/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { Notification } from '../../../../Models/Communication/notification';
import { UserTypeService } from '../../../../Services/Employee/Administration/user-type.service';
import { UserType } from '../../../../Models/Administrator/user-type';
import Swal from 'sweetalert2';
import { Department } from '../../../../Models/Administrator/department';
import { Employee } from '../../../../Models/Employee/employee';
import { School } from '../../../../Models/school';
import { Section } from '../../../../Models/LMS/section';
import { Grade } from '../../../../Models/LMS/grade';
import { Classroom } from '../../../../Models/LMS/classroom';
import { Student } from '../../../../Models/student';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { UserFilters } from '../../../../Models/Communication/user-filters';
import { DepartmentService } from '../../../../Services/Employee/Administration/department.service';
import { SectionService } from '../../../../Services/Employee/LMS/section.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { StudentService } from '../../../../Services/student.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {

  TableData:Notification[] = []
  notification: Notification = new Notification()
  isLoading = false;

  validationErrors: { [key in keyof Notification]?: string } = {}; 
   isRtl: boolean = false;
  subscription!: Subscription;
  AllowDelete: boolean = false; 
  AllowDeleteForOthers: boolean = false;
  path: string = '';

  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', ''); 

  userTypes:UserType[] = []
  selectedUserTypeId = 0
  
  isEmployeeHovered = false;
  isStudentHovered = false;
  isParentHovered = false;
  
  departments:Department[] = []
  employees:Employee[] = []
  schools:School[] = []
  sections:Section[] = []
  grades:Grade[] = []
  classrooms:Classroom[] = []
  students:Student[] = []

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService,
    private languageService: LanguageService,
    public activeRoute: ActivatedRoute,
    public router: Router,
    public notificationService: NotificationService,
    public userTypeService: UserTypeService,
    public employeeService: EmployeeService,
    public departmentService: DepartmentService,
    public schoolService: SchoolService,
    public sectionService: SectionService,
    public gradeService: GradeService,
    public classroomService: ClassroomService,
    public studentService: StudentService,
    private realTimeService: RealTimeNotificationServiceService
  ) { }

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
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others; 
      }
    });
    this.getAllData()
    this.getUserTypeData()
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

  getAllData(){
    this.TableData = []
    this.notificationService.Get(this.DomainName).subscribe(
      data => {
        this.TableData = data
      }
    )
  }

  getNotificationById(id: number){
    this.notification = new Notification()
    this.notificationService.GetById(id, this.DomainName).subscribe(
      data => {
        this.notification = data 
        if(this.notification.userTypeID == 1){
          this.isEmployeeHovered = true;
          this.isStudentHovered = false;
          this.isParentHovered = false;
        }else if(this.notification.userTypeID == 2){
          this.isStudentHovered = true;
          this.isEmployeeHovered = false;
          this.isParentHovered = false;
        }else if(this.notification.userTypeID == 3){
          this.isParentHovered = true;
          this.isStudentHovered = false;
          this.isEmployeeHovered = false;
        }
      }
    )
  }

  getUserTypeData(){
    this.userTypes = []
    this.userTypeService.Get(this.DomainName).subscribe(
      data => {
        this.userTypes = data
      }
    )
  }

  openModal(Id?: number) {
    this.notification= new Notification();
    this.isStudentHovered = true;
    this.notification.userTypeID = 2
    this.getSchool() 

    if (Id) {
      this.getNotificationById(Id);
    }

    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');

  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');
    this.validationErrors = {};  
    
    this.notification= new Notification();
    this.isLoading = false 
    this.isEmployeeHovered = false;
    this.isStudentHovered = false;
    this.isParentHovered = false;
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(
      InsertedByID,
      this.UserID,
      this.AllowDeleteForOthers
    );
    return IsAllow;
  } 
  
  onImageFileSelected(event: any) {
    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;

    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        this.validationErrors['imageFile'] = 'The file size exceeds the maximum limit of 25 MB.';
        this.notification.imageFile = null;
        return; 
      }
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        this.notification.imageFile = file; 
        this.validationErrors['imageFile'] = ''; 

        const reader = new FileReader();
        reader.readAsDataURL(file);
      } else {
        this.validationErrors['imageFile'] = 'Invalid file type. Only JPEG, JPG and PNG are allowed.';
        this.notification.imageFile = null;
        return; 
      }
    }
    
    input.value = '';
  }

  onIsAllowDismissChange(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.notification.isAllowDismiss = isChecked
  }

  selectType(userID:number) { 
    this.notification.userTypeID = userID;
    this.notification.userFilters = new UserFilters()
    if (this.notification.userTypeID == 1) {
      this.isEmployeeHovered = true;
      this.isStudentHovered = false;
      this.isParentHovered = false;
      this.getDepartment()
    }
    else if (this.notification.userTypeID == 2) {
      this.isEmployeeHovered = false;
      this.isStudentHovered = true;
      this.isParentHovered = false;
      this.getSchool()
    }
    else if (this.notification.userTypeID == 3) {
      this.isEmployeeHovered = false;
      this.isStudentHovered = false;
      this.isParentHovered = true;
      this.getSchool()
    } 
  }

  onDepartmentChange(event: Event) {
    this.employees = [] 
    this.notification.userFilters.employeeID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.notification.userFilters.departmentID = Number(selectedValue)
    if (this.notification.userFilters.departmentID) {
      this.getEmployee(); 
    }
  }

  onSchoolChange(event: Event) {
    this.sections = [] 
    this.grades = [] 
    this.classrooms = [] 
    this.students = [] 
    this.notification.userFilters.sectionID = 0
    this.notification.userFilters.gradeID = 0
    this.notification.userFilters.classroomID = 0
    this.notification.userFilters.studentID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.notification.userFilters.schoolID = Number(selectedValue)
    if (this.notification.userFilters.schoolID) {
      this.getSection(); 
    }
  }

  onSectionChange(event: Event) { 
    this.grades = [] 
    this.classrooms = [] 
    this.students = []  
    this.notification.userFilters.gradeID = 0
    this.notification.userFilters.classroomID = 0
    this.notification.userFilters.studentID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.notification.userFilters.sectionID = Number(selectedValue)
    if (this.notification.userFilters.sectionID) {
      this.getGrade(); 
    }
  }

  onGradeChange(event: Event) {  
    this.classrooms = [] 
    this.students = []   
    this.notification.userFilters.classroomID = 0
    this.notification.userFilters.studentID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.notification.userFilters.gradeID = Number(selectedValue)
    if (this.notification.userFilters.gradeID) {
      this.getClassroom(); 
    }
  }

  onClassroomChange(event: Event) {   
    this.students = []    
    this.notification.userFilters.studentID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.notification.userFilters.classroomID = Number(selectedValue)
    if (this.notification.userFilters.classroomID) {
      this.getStudent(); 
    }
  }
  
  getDepartment(){
    this.departments = [] 
    this.departmentService.Get(this.DomainName).subscribe(
      data => {
        this.departments = data
      }
    )
  }
  
  getEmployee(){
    this.employees = [] 
    this.employeeService.GetByDepartmentId(this.notification.userFilters.departmentID, this.DomainName).subscribe(
      data => {
        this.employees = data
      }
    )
  }
  
  getSchool(){
    this.schools = [] 
    this.schoolService.Get(this.DomainName).subscribe(
      data => {
        this.schools = data
      }
    )
  }
  
  getSection(){
    this.sections = [] 
    this.sectionService.GetBySchoolId(this.notification.userFilters.schoolID, this.DomainName).subscribe(
      data => {
        this.sections = data
      }
    )
  }
  
  getGrade(){
    this.grades = [] 
    this.gradeService.GetBySectionId(this.notification.userFilters.sectionID, this.DomainName).subscribe(
      data => {
        this.grades = data
      }
    )
  }
  
  getClassroom(){
    this.classrooms = [] 
    this.classroomService.GetByGradeId(this.notification.userFilters.gradeID, this.DomainName).subscribe(
      data => {
        this.classrooms = data
      }
    )
  }
  
  getStudent(){
    this.students = [] 
    this.studentService.GetByClassID(this.notification.userFilters.classroomID, this.DomainName).subscribe(
      data => {
        this.students = data
      }
    )
  }

  Save(){
    if(this.notification.text == '' && this.notification.link == '' && this.notification.imageFile == null){
      Swal.fire({
        title: 'You have to insert at least one item (Image - Text - Link)',
        icon: 'warning', 
        confirmButtonColor: '#089B41', 
        confirmButtonText: "OK"
      })
    } else{
      this.isLoading = true;
      this.notificationService.Add(this.notification, this.DomainName).subscribe(
        (result: any) => {
          this.closeModal();
          this.getAllData()
        },
        error => {
          this.isLoading = false;
          Swal.fire({
            title: error.error,
            icon: 'error', 
            confirmButtonColor: '#089B41', 
            confirmButtonText: "OK"
          })
        }
      ); 
    }
  } 

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this notification?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: "Yes, I'm sure",
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.notificationService.Delete(id, this.DomainName).subscribe((d) => {
          this.getAllData()
        });
      }
    });  
  }

  filterByTypeID($event: Event) {
    const selectedId = ($event.target as HTMLSelectElement).value; 
    this.TableData = []
    this.notificationService.GetByUserTypeID(+selectedId, this.DomainName).subscribe(
      data => {
        this.TableData = data
      }
    )
  }

  ResetFilter(){
    this.selectedUserTypeId = 0
    this.getAllData()

  }
}
