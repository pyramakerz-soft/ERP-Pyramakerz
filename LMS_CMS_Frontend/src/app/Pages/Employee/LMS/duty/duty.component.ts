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
import { DutyService } from '../../../../Services/Employee/LMS/duty.service';
// import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';

@Component({
  selector: 'app-duty',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './duty.component.html',
  styleUrl: './duty.component.css',
})

@InitLoader()
export class DutyComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

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
    private translate: TranslateService,
    private ClassroomServ: ClassroomService,  
    private loadingService: LoadingService 
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

  ngOnDestroy(): void { 
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
    this.mode = 'Create'
    if (id) {
      this.mode = 'Edit'
      this.DutyServ.GetById(id, this.DomainName).subscribe((d) => {
        this.duty = d
        console.log(d,this.duty)
        this.ClassroomServ.GetBySchoolId(this.duty.schoolID, this.DomainName).subscribe((d) => {
          this.class = d
        })
        this.DutyServ.GetNumberOfPeriods(this.duty.date, this.duty.classID, this.DomainName).subscribe((d) => {
          this.periods = Array.from({ length: d }, (_, i) => i + 1);
        });
        this.DutyServ.GetAllTeachersValidForSessionTime(this.duty.date, this.duty.period, this.DomainName).subscribe((d) => {
          this.teachers = d
          const emp = new Employee()
          emp.id=this.duty.teacherID
          emp.en_name=this.duty.teacherEnName
          emp.ar_name=this.duty.teacherArName
          this.teachers.push(emp)
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

  async CreateOREdit() {
    if (this.isFormValid()) {
      const Swal = await import('sweetalert2').then(m => m.default);

      this.isLoading = true
      if (this.mode == "Create") {
        this.DutyServ.Add(this.duty, this.DomainName).subscribe((d) => {
          this.date = this.duty.date
          this.GetByDate()
          this.closeModal()
          this.isLoading = false
        },
          error => {
            this.isLoading = false;
            const errorMsg = error?.error ?? ''; // extract error message
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
                text: error.error,
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
          error => {
            this.isLoading = false
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
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
      },async error=>{
          const Swal = await import('sweetalert2').then(m => m.default);

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.error,
            confirmButtonText: 'Okay',
            customClass: { confirmButton: 'secondaryBg' }
          });
        console.log(123,error.error)
      });
    }
  }

  async Delete(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذه') + " " +this.translate.instant('duty') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
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
