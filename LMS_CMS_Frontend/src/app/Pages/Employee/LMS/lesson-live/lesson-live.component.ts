import { Component } from '@angular/core';
import { LessonLive } from '../../../../Models/LMS/lesson-live';
import { LessonLiveService } from '../../../../Services/Employee/LMS/lesson-live.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { DaysService } from '../../../../Services/Octa/days.service';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { Subject } from '../../../../Models/LMS/subject';
import { Day } from '../../../../Models/day';
import { Classroom } from '../../../../Models/LMS/classroom';
import { AcademicYear } from '../../../../Models/LMS/academic-year';
import { School } from '../../../../Models/school';
import { AcadimicYearService } from '../../../../Services/Employee/LMS/academic-year.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-lesson-live',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './lesson-live.component.html',
  styleUrl: './lesson-live.component.css'
})
export class LessonLiveComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: LessonLive[] = [];
  subject: Subject[] = [];
  days: Day[] = [];
  classrooms: Classroom[] = [];
  isRtl: boolean = false;
  subscription!: Subscription;
  SelectedGradeId: number = 0;
  SelectedClassId: number = 0;
  SelectedSubjectId: number = 0;
  SelectedDayId: number = 0;

  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'liveLink', 'weekDayName', 'classroomName', 'subjectEnglishName'];

  live: LessonLive = new LessonLive();

  validationErrors: { [key in keyof LessonLive]?: string } = {};
  isLoading = false;

  selectedSchool: number = 0
  selectedYear: number = 0
  selectedYearForModal: number = 0
  selectedClass: number = 0
  Schools: School[] = []
  Years: AcademicYear[] = []
  YearsForModal: AcademicYear[] = []
  ClassesForFilter: Classroom[] = []

  constructor(
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public LessonLiveServ: LessonLiveService,
    public ClassroomServ: ClassroomService,
    public weekdaysServ: DaysService,
    public acadimicYearService: AcadimicYearService,
    public schoolService: SchoolService,
    public SubjectServ: SubjectService,
    private translate: TranslateService,
    private languageService: LanguageService, 
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

    this.GetAllSchools();
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


  onSchoolChange() {
    this.selectedYear = 0;
    this.selectedClass = 0
    this.Years = [];
    this.ClassesForFilter = []

    if (this.selectedSchool) {
      this.acadimicYearService.GetBySchoolId(this.selectedSchool, this.DomainName).subscribe(
        (data) => {
          this.Years = data
        }
      )
    }
  }

  onYearChange() {
    this.selectedClass = 0
    this.ClassesForFilter = []

    if (this.selectedYear) {
      this.ClassroomServ.GetByAcYearId(this.selectedYear, this.DomainName).subscribe(
        (data) => {
          this.ClassesForFilter = data
        }
      )
    }
  }

  onYearChangeForModal() {
    this.live.classroomID = 0
    this.live.subjectID = 0
    this.SelectedGradeId = 0
    this.classrooms = []

    if (this.selectedYearForModal) {
      this.getAllClass()
    }
  }

  onClassChange() {
    this.GetLessonsByClassID()
  }

  GetLessonsByClassID() {
    this.TableData = [];
    this.LessonLiveServ.GetByClassId(this.selectedClass, this.DomainName).subscribe((d) => {
      this.TableData = d;
    });
  }

  GetAllSchools() {
    this.Schools = [];
    this.schoolService.Get(this.DomainName).subscribe((d) => {
      this.Schools = d;
    });
  }

  GetAllYears() {
    this.YearsForModal = [];
    this.acadimicYearService.Get(this.DomainName).subscribe((d) => {
      this.YearsForModal = d;
    });
  }

  Create() {
    this.mode = 'Create';
    this.validationErrors = {};
    this.openModal();
  }

  Delete(id: number) {
    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " +  this.translate.instant('Live') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.LessonLiveServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetLessonsByClassID();
        });
      }
    });
  }

  Edit(row: LessonLive) {
    this.mode = 'Edit';
    this.LessonLiveServ.GetByID(row.id, this.DomainName).subscribe((d) => {
      this.live = d;
      this.selectedYearForModal = this.live.academicYearID;
      this.getAllClass()
    });
    this.openModal();
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

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true;
      if (this.mode == 'Create') {
        this.LessonLiveServ.Add(
          this.live,
          this.DomainName
        ).subscribe(
          (d) => {
            this.GetLessonsByClassID();
            this.isLoading = false;
            this.closeModal();
          },
          (error) => {
            this.isLoading = false; // Hide spinner
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' }
            });
          }
        );
      }
      if (this.mode == 'Edit') {
        this.LessonLiveServ.Edit(
          this.live,
          this.DomainName
        ).subscribe(
          (d) => {
            this.GetLessonsByClassID();
            this.isLoading = false;
            this.closeModal();
          },
          (error) => {
            this.isLoading = false; // Hide spinner
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' }
            });
          }
        );
      }
    }
  }

  getAllSubject() {
    this.subject = []
    this.live.subjectID = 0
    this.SubjectServ.GetByClassroom(this.live.classroomID, this.DomainName).subscribe((d) => {
      this.subject = d
    })
  }

  getAllDays() {
    this.days = []
    this.live.weekDayID = 0
    this.weekdaysServ.Get(this.DomainName).subscribe((d) => {
      this.days = d
    })
  }

  getAllClass() {
    this.SelectedClassId = 0
    this.classrooms = []
    this.SelectedSubjectId = 0
    this.subject = []
    this.ClassroomServ.GetByAcYearId(this.selectedYearForModal, this.DomainName).subscribe((d) => {
      this.classrooms = d
      if (this.live.id) {
        this.SubjectServ.GetByClassroom(this.live.classroomID, this.DomainName).subscribe((d) => {
          this.subject = d
        })
      }
    })
  }

  closeModal() {
    this.isModalVisible = false;
    this.selectedYearForModal = 0;
    this.SelectedGradeId = 0;
    this.validationErrors = {};
    this.live = new LessonLive();
  }

  openModal() {
    this.getAllDays();
    this.GetAllYears();
    this.isModalVisible = true;
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.live) {
      if (this.live.hasOwnProperty(key)) {
        const field = key as keyof LessonLive;
        if (!this.live[field]) {
          if (
            field == 'period' ||
            field == 'name' ||
            field == 'liveLink' ||
            field == 'weekDayID' ||
            field == 'classroomID' ||
            field == 'subjectID'
          ) {
            const displayName =
              field === 'weekDayID' ? 'Week Day' :
              field === 'classroomID' ? 'Classroom' :
              field === 'subjectID' ? 'Subject' :
              field === 'liveLink' ? 'Live Link' :
              this.capitalizeField(field);
            this.validationErrors[field] = this.getRequiredErrorMessage(displayName);
             isValid = false;
          }
        }
      }
    }
    return isValid;
  }

  private getRequiredErrorMessage(fieldName: string): string {
    const fieldTranslated = this.translate.instant(fieldName);
    const requiredTranslated = this.translate.instant('Is Required');

    if (this.isRtl) {
      return `${requiredTranslated} ${fieldTranslated}`;
    } else {
      return `${fieldTranslated} ${requiredTranslated}`;
    }
  }

  capitalizeField(field: keyof LessonLive): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof LessonLive; value: any }) {
    const { field, value } = event;
    (this.live as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: LessonLive[] = await firstValueFrom(
        this.LessonLiveServ.Get(this.DomainName)
      );
      this.TableData = data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.TableData = this.TableData.filter((t) => {
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
      this.TableData = [];
    }
  }

  validateNumber(event: any, field: keyof LessonLive): void {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '')
    event.target.value = value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.live[field] === 'string') {
        this.live[field] = '' as never;
      }
    }
  }

  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
