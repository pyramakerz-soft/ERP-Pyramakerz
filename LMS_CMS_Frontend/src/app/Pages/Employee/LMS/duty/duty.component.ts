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
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';

@Component({
  selector: 'app-duty',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent , TranslateModule],
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
  teachers: Employee[] = [];
  isRtl: boolean = false;
  subscription!: Subscription;
  SelectedYearId: number = 0;
  SelectedGradeId: number = 0;
  SelectedSubjectId: number = 0;
  isModalVisible: boolean = false;
  mode: string = 'Create';

  TableData: Duty[] = [];
  validationErrors: { [key in keyof Duty]?: string } = {};
  duty: Duty = new Duty();
  isLoading: boolean = false;

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    private menuService: MenuService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    private languageService: LanguageService,
    private SchoolServ: SchoolService,
    private DutyServ: DutyService,
    private ClassroomServ: ClassroomService
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
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });
    const today = new Date();
    this.date = today.toISOString().split('T')[0];  // format as 'YYYY-MM-DD'
    this.GetByDate()
    this.GetSchools()
        
    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  GetByDate() {
    this.TableData = []
    this.DutyServ.GetByDate(this.date, this.DomainName).subscribe((d) => {
      this.TableData = d
    })
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID,this.UserID,this.AllowDeleteForOthers);
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

  openModal(id?: number) {
    this.validationErrors = {};
    this.isModalVisible = true;
    this.duty = new Duty();
    if (id) {
      this.mode = 'Edit'
      this.DutyServ.GetById(id, this.DomainName).subscribe((d) => {
        this.duty = d
        this.ClassroomServ.GetBySchoolId(this.duty.schoolID, this.DomainName).subscribe((d) => {
          this.class = d
        })
        this.DutyServ.GetNumberOfPeriods(this.duty.date, this.duty.classID, this.DomainName).subscribe((d) => {
          this.periods = Array.from({ length: d }, (_, i) => i + 1);
        });
        this.DutyServ.GetAllTeachersValidForSessionTime(this.duty.date, this.duty.period, this.DomainName).subscribe((d) => {
          this.teachers = d
        })
      })
    }
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

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true
      if (this.mode == "Create") {
        console.log(this.duty)
        this.DutyServ.Add(this.duty, this.DomainName).subscribe((d) => {
          this.date = this.duty.date
          this.GetByDate()
          this.closeModal()
          this.isLoading = false
        },
          err => {
            this.isLoading = false;
            console.log(err);
            const errorMsg = err?.error ?? ''; // extract error message
            if (errorMsg.includes("This Day doesn`t exist in current time table")) {
              Swal.fire({
                icon: 'warning',
                title: 'Invalid Day!',
                text: 'This day is not part of the current timetable.',
                confirmButtonText: 'Okay',
                customClass: { confirmButton: 'secondaryBg' },
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Try Again Later!',
                confirmButtonText: 'Okay',
                customClass: { confirmButton: 'secondaryBg' },
              });
            }
          })
      } else if (this.mode == "Edit") {
        this.DutyServ.Edit(this.duty, this.DomainName).subscribe((d) => {
          this.date = this.duty.date
          this.GetByDate()
          this.closeModal()
          this.isLoading = false
        },
          err => {
            this.isLoading = false
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Try Again Later!',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          })
      }
    }
  }

  GetClassBySchool() {
    this.class = []
    this.periods = []
    this.teachers = []
    this.duty.classID = 0
    this.duty.period = 0
    this.duty.teacherID = 0
    this.ClassroomServ.GetBySchoolId(this.duty.schoolID, this.DomainName).subscribe((d) => {
      this.class = d
    })
  }

  GetSchools() {
    this.schools = []
    this.class = []
    this.periods = []
    this.teachers = []
    this.duty.classID = 0
    this.duty.period = 0
    this.duty.teacherID = 0
    this.duty.schoolID = 0
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schools = d
    })
  }

  GetTeachers() {
    this.teachers = [];
    this.duty.teacherID = 0
    this.DutyServ.GetAllTeachersValidForSessionTime(this.duty.date, this.duty.period, this.DomainName).subscribe((d) => {
      this.teachers = d
    })
  }

  GetNumberOfPeriod() {
    this.periods = [];
    this.teachers = [];
    this.duty.period = 0
    this.duty.teacherID = 0
    if (this.duty.date != '' && this.duty.classID != 0) {
      this.DutyServ.GetNumberOfPeriods(this.duty.date, this.duty.classID, this.DomainName).subscribe((d) => {
        this.periods = Array.from({ length: d }, (_, i) => i + 1);
      });
    }
  }

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this Duty?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.DutyServ.Delete(id, this.DomainName).subscribe((data: any) => {
          this.GetByDate();
        });
      }
    });
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.duty) {
      if (this.duty.hasOwnProperty(key)) {
        const field = key as keyof Duty;
        if (!this.duty[field]) {
          if (field == 'date' || field == 'schoolID' || field == 'classID' || field == 'teacherID' || field == 'period') {
            this.validationErrors[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        }
      }
    }
    return isValid;
  }


}
