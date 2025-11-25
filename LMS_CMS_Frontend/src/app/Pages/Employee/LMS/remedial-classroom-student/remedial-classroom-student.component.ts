import { Component } from '@angular/core';
import { RemedialClassroomStudent } from '../../../../Models/LMS/remedial-classroom-student';
import { RemedialClassroom } from '../../../../Models/LMS/remedial-classroom';
import { RemedialClassroomService } from '../../../../Services/Employee/LMS/remedial-classroom.service';
import { RemedialClassroomStudentService } from '../../../../Services/Employee/LMS/remedial-classroom-student.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import Swal from 'sweetalert2';
import { SearchStudentComponent } from '../../../../Component/Employee/search-student/search-student.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { Subscription } from 'rxjs';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';
@Component({
  selector: 'app-remedial-classroom-student',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchStudentComponent, TranslateModule],
  templateUrl: './remedial-classroom-student.component.html',
  styleUrl: './remedial-classroom-student.component.css',
})

@InitLoader()
export class RemedialClassroomStudentComponent {
  keysArray: string[] = [
    'id',
    'name',
    'dateFrom',
    'dateTo',
    'academicYearName',
  ];
  key: string = 'id';
  value: any = '';

  RemedialClassroomID: number = 0;
  TableData: RemedialClassroomStudent[] = [];
  remedialClassroomStudent: RemedialClassroomStudent =
    new RemedialClassroomStudent();
  remedialClassroom: RemedialClassroom = new RemedialClassroom();
  validationErrors: { [key in keyof RemedialClassroomStudent]?: string } = {};
  isRtl: boolean = false;
  subscription!: Subscription;
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = '';

  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  isLoading = false;
  isModalOpen = false;
  preSelectedYear: number | null = null;
  preSelectedGrade: number | null = null;
  preSelectedClassroom: number | null = null;
  hiddenInputs: string[] = ['classroom'];
  hiddenColumns: string[] = ['Actions'];


  constructor(
    public account: AccountService,
    public RemedialClassroomStudentServ: RemedialClassroomStudentService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public router: Router,
    private translate: TranslateService,
    public RemedialClassroomServ: RemedialClassroomService,   
    private languageService: LanguageService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    this.RemedialClassroomID = Number(this.activeRoute.snapshot.paramMap.get('id'));

    this.GetRemedialClassroom();

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });
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

  GetRemedialClassroom() {
    this.RemedialClassroomServ.GetById(this.RemedialClassroomID, this.DomainName).subscribe((d) => {
      this.remedialClassroom = d;
    }, err => {
    });
  }

  openModal() {
    this.isModalOpen = true;
    this.remedialClassroomStudent.remedialClassroomID = this.RemedialClassroomID
  }

  handleStudentSelected(students: number[]) {
    if (students.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Students Selected',
        text: 'You must select at least one student before proceeding.',
        confirmButtonText: 'Got it',
        customClass: { confirmButton: 'secondaryBg' }
      });
    } else {
      this.remedialClassroomStudent.studentIds = students
      this.remedialClassroomStudent.remedialClassroomID = this.RemedialClassroomID
      this.RemedialClassroomStudentServ.Add(this.remedialClassroomStudent, this.DomainName).subscribe((d) => {
        this.GetRemedialClassroom()
        this.closeModal()
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Created Successfully',
          confirmButtonColor: '#089B41',
        });
      }, error => {
        this.closeModal()
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.error,
          confirmButtonText: 'Okay',
          customClass: { confirmButton: 'secondaryBg' }
        });
      })
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.remedialClassroomStudent = new RemedialClassroomStudent();
    this.validationErrors = {};
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    // try {
    //   const data: RemedialClassroomStudent = await firstValueFrom(this.RemedialClassroomServ.GetById(this.RemedialClassroomID ,this.DomainName));
    //   this.remedialClassroom.remedialClassroomStudents = data ;

    //   if (this.value !== "") {
    //     const numericValue = isNaN(Number(this.value)) ? this.value : parseInt(this.value, 10);

    //     this.semesterData = this.semesterData.filter(t => {
    //       const fieldValue = t[this.key as keyof typeof t];
    //       if (typeof fieldValue === 'string') {
    //         return fieldValue.toLowerCase().includes(this.value.toLowerCase());
    //       }
    //       if (typeof fieldValue === 'number') {
    //         return fieldValue.toString().includes(numericValue.toString())
    //       }
    //       return fieldValue == this.value;
    //     });
    //   }
    // } catch (error) {
    //   this.semesterData = [];
    // }
  }

  moveToAcademicYear() {
    this.router.navigateByUrl('Employee/Remedial Classes');
  }

  MoveToSemesterView(id: number) {
    this.router.navigateByUrl(
      'Employee/Working Weeks/' + this.DomainName + '/' + id
    );
  }

  capitalizeField(field: keyof RemedialClassroomStudent): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.remedialClassroom) {
      if (this.remedialClassroom.hasOwnProperty(key)) {
        const field = key as keyof RemedialClassroomStudent;
        if (!this.remedialClassroomStudent[field]) {
          if (field == 'remedialClassroomID') {
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

  onInputValueChange(event: {
    field: keyof RemedialClassroomStudent;
    value: any;
  }) {
    const { field, value } = event;
    (this.remedialClassroom as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
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

  dalete(id: number) {
    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('the') + this.translate.instant('Student') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.RemedialClassroomStudentServ.Delete(id, this.DomainName).subscribe((data: any) => {
          this.GetRemedialClassroom()
        });
      }
    });
  }
}
