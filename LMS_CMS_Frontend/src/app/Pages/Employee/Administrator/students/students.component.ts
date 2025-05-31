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

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [FormsModule,CommonModule,SearchComponent],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent {
  
 keysArray: string[] = ['id', 'name','academicYearName','floorName','gradeName','number'];
  key: string= "id";
  value: any = "";

  OriginStudentData:Student[] = []
  StudentsData:Student[] = []
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = ""

  DomainName: string = "";
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  isLoading=false

  constructor(public account: AccountService, public buildingService: BuildingService, public ApiServ: ApiService, public EditDeleteServ: DeleteEditPermissionService, 
      private menuService: MenuService, public activeRoute: ActivatedRoute, public schoolService: SchoolService, public StudentService: StudentService, public employeeServ : EmployeeService ,
      public sectionService:SectionService, public gradeService:GradeService, public acadimicYearService:AcadimicYearService, public floorService: FloorService, public router:Router){}
      
  ngOnInit(){
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
  } 

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID, this.UserID, this.AllowDeleteForOthers);
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  getStudentData(){
    this.OriginStudentData=[]
    this.StudentsData=[]
    this.StudentService.GetAll(this.DomainName).subscribe(
      (data: Student[]) => { 
        console.log(data)
        this.OriginStudentData = data; 
        this.StudentsData = data; 

      }
    )
  }

  Create(){
    console.log(45)
    this.router.navigateByUrl(`Employee/Registration Form`);
  }
  
}
