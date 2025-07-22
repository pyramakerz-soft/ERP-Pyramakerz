import { Component } from '@angular/core';
import { Duty } from '../../../../Models/LMS/duty';
import { Employee } from '../../../../Models/Employee/employee';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Classroom } from '../../../../Models/LMS/classroom';
import { School } from '../../../../Models/school';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { SearchComponent } from '../../../../Component/search/search.component';
import { DutyService } from '../../../../Services/Employee/LMS/duty.service';

@Component({
  selector: 'app-duty',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent],
  templateUrl: './duty.component.html',
  styleUrl: './duty.component.css',
})
export class DutyComponent {
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

  DomainName: string = '';
  UserID: number = 0;
  path: string = '';

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  schools: School[] = [];
  class: Classroom[] = [];
  date: string = '';
  periods: number[] = [];
  SelectedPeriod: number = 0;
  teachers: Employee[] = [];

  SelectedSchoolId: number = 0;
  SelectedYearId: number = 0;
  SelectedGradeId: number = 0;
  SelectedClassId: number = 0;
  SelectedSubjectId: number = 0;
  isModalVisible: boolean = false;
  mode: string = '';

  TableData: Duty[] = [];
  validationErrors: { [key in keyof Duty]?: string } = {};
  duty: Duty = new Duty();

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    private menuService: MenuService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    private SchoolServ: SchoolService,
    private DutyServ: DutyService,
    private ClassroomServ: ClassroomService
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
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });
    const today = new Date();
    this.date = today.toISOString().split('T')[0];  // format as 'YYYY-MM-DD'
    this.GetByDate()
  }

  GetByDate(){
    this.TableData=[]
    this.DutyServ.GetByDate(this.date,this.DomainName).subscribe((d)=>{
      this.TableData=d
    })
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(
      InsertedByID,
      this.UserID,
      this.AllowDeleteForOthers
    );
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(
      InsertedByID,
      this.UserID,
      this.AllowEditForOthers
    );
    return IsAllow;
  }

  closeModal() {
    this.isModalVisible = false;
  }

  openModal() {
    this.validationErrors = {};
    this.isModalVisible = true;
  }

  capitalizeField(field: keyof Duty): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof Duty; value: any }) {
    const { field, value } = event;
    (this.duty as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  CreateOREdit(){

  }

  GetClassBySchool(){
    this.ClassroomServ.GetBySchoolId(this.SelectedSchoolId,this.DomainName).subscribe((d)=>{
      this.class=d
    })
  }

  GetTeachers(){
    this.DutyServ.GetAllTeachersValidForSessionTime(this.date,this.SelectedPeriod,this.DomainName).subscribe((d)=>{
      this.teachers=d
    })
  }
}
