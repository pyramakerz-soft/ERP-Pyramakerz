import { Component } from '@angular/core';
import { TokenData } from '../../../../Models/token-data';
import { EmployeeGet } from '../../../../Models/Employee/employee-get';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditPass } from '../../../../Models/Employee/edit-pass';
import Swal from 'sweetalert2';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { FloorService } from '../../../../Services/Employee/LMS/floor.service';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { Floor } from '../../../../Models/LMS/floor';
import { Grade } from '../../../../Models/LMS/grade';
import { Subject } from '../../../../Models/LMS/subject';

@Component({
  selector: 'app-employee-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-view.component.html',
  styleUrl: './employee-view.component.css'
})
export class EmployeeViewComponent {

  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")

  DomainName: string = "";
  UserID: number = 0;
  path: string = "";

  Data: EmployeeGet = new EmployeeGet()
  EmpId: number = 0;

  PasswordError: string = "";
  isChange = false;
  OldPasswordError: string = ""; 
  password:string =""
  confirmPassword:string =""

  editpasss: EditPass = new EditPass();

  AllowEdit: boolean = false;
  AllowEditForOthers: boolean = false;
  isFloorMonitor = false;
  isGradeSupervisor = false;
  isSubjectSupervisor = false;
  floors: Floor[] = [];
  floorsSelected: Floor[] = [];
  grades: Grade[] = [];
  gradeSelected: Grade[] = [];
  subject: Subject[] = [];
  subjectSelected: Subject[] = [];



  constructor(public activeRoute: ActivatedRoute, public account: AccountService, public ApiServ: ApiService, private menuService: MenuService, public EditDeleteServ: DeleteEditPermissionService, private router: Router, public EmpServ: EmployeeService, public FloorServ: FloorService,
    public GradeServ: GradeService,
    public SubjectServ: SubjectService,
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    if (this.User_Data_After_Login.type === "employee") {
      this.DomainName = this.ApiServ.GetHeader();
      this.activeRoute.url.subscribe(url => {
        this.path = url[0].path
        this.EmpId = Number(this.activeRoute.snapshot.paramMap.get('id'))
        this.EmpServ.Get_Employee_By_ID(this.EmpId, this.DomainName).subscribe(async (data) => {
          this.Data = data; 
          if (data.files == null) {
            this.Data.files = []
          }
          this.Data.id = this.EmpId;
          if (this.Data.floorsSelected.length > 0) {
            this.isFloorMonitor = true
          }
          if (this.Data.gradeSelected.length > 0) {
            this.isGradeSupervisor = true
          }
          if (this.Data.subjectSelected.length > 0) {
            this.isSubjectSupervisor = true
          }
          this.FloorServ.Get(this.DomainName).subscribe((data) => {
            this.floors = data;
            if (this.Data.floorsSelected.length > 0) {
              this.isFloorMonitor = true
              this.floorsSelected = this.floors.filter((s) =>
                this.Data.floorsSelected.includes(s.id)
              );
            }
          });
          this.GradeServ.Get(this.DomainName).subscribe((data) => {
            this.grades = data;
            if (this.Data.gradeSelected.length > 0) {
              this.isGradeSupervisor = true
              this.gradeSelected = this.grades.filter((s) =>
                this.Data.gradeSelected.includes(s.id)
              );
            }
          });
          this.SubjectServ.Get(this.DomainName).subscribe((data) => {
            this.subject = data;
            if (this.Data.subjectSelected.length > 0) {
              this.isSubjectSupervisor = true
              this.subjectSelected = this.subject.filter((s) =>
                this.Data.subjectSelected.includes(s.id)
              );
            }
          });
        })
      });
    }
    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName("Employee", items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others
      }
    });
  }

  moveToEmployee() {
    this.router.navigateByUrl("Employee/Employee")
  }
  edit() {
    this.router.navigateByUrl(`Employee/Employee Edit/${this.EmpId}`)
  }

  downloadFile(file: any): void {
    fetch(file.link)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name || 'downloaded_file';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Download failed:', error);
      });
  }

  toggleChangePassword() {
    this.isChange = !this.isChange;
  }

  UpdatePassword() {
    if(this.password != this.confirmPassword){
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Password and Confirm Password is not the same',
        confirmButtonColor: '#089B41',
      });
    }else{
      if(this.password != "" && this.editpasss.oldPassword != ""){
        this.editpasss.id=this.User_Data_After_Login.id;
        this.editpasss.password=this.password 
        this.EmpServ.EditPassword(this.editpasss,this.DomainName).subscribe(()=>{
            this.isChange = false
            this.password = '';
            this.editpasss = new EditPass()
            this.confirmPassword = ''; 
            this.PasswordError = ''; 
            this.OldPasswordError = ''; 
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Updatedd Successfully',
              confirmButtonColor: '#089B41',
            });
          },
          (error) => {   
            switch(true) {
              case error.error.errors?.Password !== undefined:
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: error.error.errors.Password[0] || 'An unexpected error occurred',
                  confirmButtonColor: '#089B41',
                });
                break; 
              case error.error == "Old Password isn't right":
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.error,
                    confirmButtonColor: '#089B41',
                  });
                  break;
              default:
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: error.error.errors || 'An unexpected error occurred',
                  confirmButtonColor: '#089B41',
                });
                break;
            }
          } 
        ) 
      } else{
        if(this.password == ""){
          this.PasswordError = "Password Can't be Empty"
        }
        if(this.editpasss.oldPassword == ""){
          this.OldPasswordError = "Old Password Can't be Empty"
        }
      }
    } 
  }

  CancelUpdatePassword() {
    this.isChange = false
    this.password = '';
  }
   
  onPasswordChange() {
    this.PasswordError = "" 
  } 

  onoldPasswordChange() {
    this.OldPasswordError = "" 
  } 
  
  IsAllowEdit() {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(this.Data.insertedByUserId, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  SubjectCoTeacher() {
    this.router.navigateByUrl("Employee/Subject Co-Teacher/" + this.EmpId)
  }

  SubjectTeacher() {
    this.router.navigateByUrl("Employee/Subject Teacher/" + this.EmpId)
  }
}
