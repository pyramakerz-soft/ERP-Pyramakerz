import { Component } from '@angular/core';
import { ApiService } from '../../../../Services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Semester } from '../../../../Models/LMS/semester';
import { SemesterService } from '../../../../Services/Employee/LMS/semester.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SemesterWorkingDays } from '../../../../Models/LMS/semester-working-days';
import { SearchComponent } from '../../../../Component/search/search.component';
import { MenuService } from '../../../../Services/shared/menu.service';
import { AccountService } from '../../../../Services/account.service';
import { TokenData } from '../../../../Models/token-data';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { SemesterWorkingWeekService } from '../../../../Services/Employee/LMS/semester-working-week.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-semester-view',
  standalone: true,
  imports: [CommonModule,FormsModule ,SearchComponent],
  templateUrl: './semester-view.component.html',
  styleUrl: './semester-view.component.css'
})
export class SemesterViewComponent { 
  DomainName: string = "";
  semesterId: number = 0

  semester:Semester = new Semester()
  WorkingWeeks:SemesterWorkingDays[]=[]

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = ""
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")

  constructor(public account: AccountService, public EditDeleteServ: DeleteEditPermissionService, public ApiServ: ApiService, public activeRoute: ActivatedRoute, 
    public router:Router, private menuService: MenuService, public semesterService:SemesterService, public semesterWorkingWeekService:SemesterWorkingWeekService){}

  ngOnInit(){
    this.DomainName = this.ApiServ.GetHeader();
    this.semesterId = Number(this.activeRoute.snapshot.paramMap.get('Id'))
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();

    this.GetSemesterById(this.semesterId)
    this.GetWorkingWeeksBySemesterById(this.semesterId)

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
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID, this.User_Data_After_Login.id, this.AllowDeleteForOthers);
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.User_Data_After_Login.id, this.AllowEditForOthers);
    return IsAllow;
  }

  moveToSemester(){
    this.router.navigateByUrl('Employee/Semester/' + this.DomainName + '/' + this.semester.academicYearID)
  }

  Generate(){
    if(this.WorkingWeeks.length == 0){
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to generate the working weeks?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, generate!',
        confirmButtonColor: '#089B41',
        cancelButtonText: 'No, cancel'
      }).then((result) => {
        if (result.isConfirmed) { 
          this.semesterWorkingWeekService.GenerateWeeks(this.semesterId, this.DomainName).subscribe(
            data => {
              this.GetWorkingWeeksBySemesterById(this.semesterId);
            }
          );
        }
      });
    } else{
      Swal.fire({
        title: 'Are you sure?',
        text: 'This Action Will Remove All the Last Generated Weeks, Are You Sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'I am Sure',
        confirmButtonColor: '#089B41',
        cancelButtonText: 'No, cancel'
      }).then((result) => {
        if (result.isConfirmed) { 
          this.semesterWorkingWeekService.GenerateWeeks(this.semesterId, this.DomainName).subscribe(
            data => {
              this.GetWorkingWeeksBySemesterById(this.semesterId);
            }
          );
        }
      });
    }
  }

  GetSemesterById(Id: number) {
    this.semesterService.GetByID(Id, this.DomainName).subscribe((data) => {
      this.semester = data;
    });
  }

  GetWorkingWeeksBySemesterById(Id: number) {
      this.WorkingWeeks = []
    this.semesterWorkingWeekService.GetBySemesterID(Id, this.DomainName).subscribe((data) => {
      this.WorkingWeeks = data;
    });
  }

  Delete(id:number){
  }

  Edit(id: number) {
  }
}
