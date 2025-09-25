import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchComponent } from '../../../../Component/search/search.component';
import { Student } from '../../../../Models/student';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { AcadimicYearService } from '../../../../Services/Employee/LMS/academic-year.service';
import { BuildingService } from '../../../../Services/Employee/LMS/building.service';
import { FloorService } from '../../../../Services/Employee/LMS/floor.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { SectionService } from '../../../../Services/Employee/LMS/section.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { StudentService } from '../../../../Services/student.service';
import Swal from 'sweetalert2';
import { SearchStudentComponent } from '../../../../Component/Employee/search-student/search-student.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-students',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchStudentComponent, TranslateModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent {

  keysArray: string[] = ['id', 'name', 'academicYearName', 'floorName', 'gradeName', 'number'];
  key: string = "id";
  value: any = "";
 isRtl: boolean = false;
  subscription!: Subscription;
  OriginStudentData: Student[] = []
  StudentsData: Student[] = []
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  isModalOpen: boolean = false;
  path: string = ""

  DomainName: string = "";
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  isLoading = false
  preSelectedYear: number | null = null;
  preSelectedGrade: number | null = null;
  preSelectedClassroom: number | null = null;

  constructor(public account: AccountService, 
    public buildingService: BuildingService, 
    public ApiServ: ApiService, 
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService, 
    public activeRoute: ActivatedRoute, 
    public schoolService: SchoolService, 
    public StudentService: StudentService, 
    public employeeServ: EmployeeService,
    public sectionService: SectionService, 
    private translate: TranslateService,
    public gradeService: GradeService, 
    public acadimicYearService: AcadimicYearService, 
    public floorService: FloorService, 
    public router: Router,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService
    ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });

    this.getStudentData()
    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others
      }
    });

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


  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID, this.UserID, this.AllowDeleteForOthers);
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  getStudentData() {
    this.OriginStudentData = []
    this.StudentsData = []
    this.StudentService.GetAll(this.DomainName).subscribe(
      (data: Student[]) => { 
        this.OriginStudentData = data;
        this.StudentsData = data;

      }
    )
  }

  OpenModal() {
    this.isModalOpen = true;
  }

  Create() {
    this.router.navigateByUrl(`Employee/Create Student`);
  }

  Edit(StuId: number, Rid: number) {
    this.router.navigateByUrl(`Employee/Edit Student/${Rid}/${StuId}`);
  }


  View(id: number) {
    this.router.navigateByUrl(`Employee/Student/` + id);
  }

  Delete(id: number) {
    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('the') +this.translate.instant('Student') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.StudentService.Delete(id, this.DomainName).subscribe((d) => {
          this.getStudentData();
        });
      }
    });
  }

  suspend(stu:Student){ 
    let message = ""
    let doneMessage = ""
    let doneTitle = ""
    if(stu.isSuspended == false){
      message = "Are you sure you want to Suspend this Student?"
      doneMessage = "The Student has been Suspend successfully."
      doneTitle = "Suspend!"
    }else{
      message = "Are you sure you want to UnSuspend this Student?"
      doneMessage = "The Student has been UnSuspend successfully."
      doneTitle = "UnSuspend!"
    }
    Swal.fire({
      title: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: doneTitle,
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) { 
        this.StudentService.Suspend(stu.id, this.DomainName).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: doneTitle,
              text: doneMessage,
              confirmButtonColor: '#089B41',
            });
            this.getStudentData();
          },
          error: (error) => {
            const errorMessage = error?.error || 'An unexpected error occurred.';
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: errorMessage,
              confirmButtonColor: '#089B41',
            });
          },
        });
      }
    });
  }

  closeModal() {
    document.getElementById("Transfer_Modal")?.classList.remove("flex");
    document.getElementById("Transfer_Modal")?.classList.add("hidden");

    document.getElementById("Hide_Modal")?.classList.remove("flex");
    document.getElementById("Hide_Modal")?.classList.add("hidden");

    this.isModalOpen = false;
  }
}
