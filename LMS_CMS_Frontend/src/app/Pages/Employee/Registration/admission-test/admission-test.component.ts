import { Component } from '@angular/core';
import { TokenData } from '../../../../Models/token-data';
import { Test } from '../../../../Models/Registration/test';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { School } from '../../../../Models/school';
import { AcademicYear } from '../../../../Models/LMS/academic-year';
import { Grade } from '../../../../Models/LMS/grade';
import { Subject } from '../../../../Models/LMS/subject';
import { TestService } from '../../../../Services/Employee/Registration/test.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { AcadimicYearService } from '../../../../Services/Employee/LMS/academic-year.service';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
// import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { firstValueFrom, Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';
@Component({
  selector: 'app-admission-test',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent, TranslateModule],
  templateUrl: './admission-test.component.html',
  styleUrl: './admission-test.component.css'
})

@InitLoader()
export class AdmissionTestComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  DomainName: string = '';
  UserID: number = 0;
  path: string = '';

  Data: Test[] = [];
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  mode: string = 'Create'

  isModalVisible: boolean = false;

  test: Test = new Test();

  Schools: School[] = [];
  AcadenicYears: AcademicYear[] = []
  Grades: Grade[] = []
  Subjects: Subject[] = []

  SchoolId: number = 0;

  validationErrors: { [key in keyof Test]?: string } = {};

  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'title', 'totalMark', 'subjectName', 'academicYearName'];
  isRtl: boolean = false;
  subscription!: Subscription;
  isLoading = false;

  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;
  isDeleting: boolean = false;

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    private menuService: MenuService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    public testServ: TestService,
    public SchoolServ: SchoolService,
    public GradeServ: GradeService,
    public AcadimicYearServ: AcadimicYearService,
    public SubjectServ: SubjectService,
    private translate: TranslateService,
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
    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others
      }
    });

    this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);

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



  onSchoolChange(selectedSchoolId: number) {
    this.test.academicYearID = 0
    this.test.gradeID = 0
    this.test.subjectID = 0
    this.SchoolId = selectedSchoolId;
    if (this.SchoolId && this.SchoolId !== 0) {
      this.GetYearsBySchoolId()
      this.GetGradesBySchoolId()
    } else {
      this.AcadenicYears = [];
    }
  }

  onGradeChange(selectedGradeId: number) {
    this.test.subjectID = 0
    this.test.gradeID = selectedGradeId;
    if (this.test.gradeID && this.test.gradeID !== 0) {
      this.GetSubjectsByGradeId()
    } else {
      this.Subjects = [];
    }
  }

  onSubjectChange(selectedSubjectId: number) {
    this.test.subjectID = selectedSubjectId;
  }

  // GetAllData() {
  //   this.Data = []
  //   this.testServ.GetWithPaggination(this.DomainName).subscribe((d) => {
  //     this.Data = d
  //   })
  // }

  GetAllData(DomainName: string, pageNumber: number, pageSize: number) {
    this.Data = [];
    this.testServ.GetWithPaggination(DomainName, pageNumber, pageSize).subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage;
        this.PageSize = data.pagination.pageSize;
        this.TotalPages = data.pagination.totalPages;
        this.TotalRecords = data.pagination.totalRecords;
        this.Data = data.data;
      },
      (error) => {
        if (error.status == 404) {
          if (this.TotalRecords != 0) {
            let lastPage;
            if (this.isDeleting) {
              lastPage = (this.TotalRecords - 1) / this.PageSize;
            } else {
              lastPage = this.TotalRecords / this.PageSize;
            }
            if (lastPage >= 1) {
              if (this.isDeleting) {
                this.CurrentPage = Math.floor(lastPage);
                this.isDeleting = false;
              } else {
                this.CurrentPage = Math.ceil(lastPage);
              }
              this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
            }
          }
        } else {
          const errorMessage =
            error.error?.message ||
            this.translate.instant('Failed to load Data');
          this.showErrorAlert(errorMessage);
        }
      }
    );
  }

  private async showErrorAlert(errorMessage: string) {
    const translatedTitle = this.translate.instant('Error');
    const translatedButton = this.translate.instant('Okay');

    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      icon: 'error',
      title: translatedTitle,
      text: errorMessage,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }
  

  GetGradesBySchoolId() {
    this.Grades = []
    this.GradeServ.GetBySchoolId(this.SchoolId, this.DomainName).subscribe((d) => {
      this.Grades = d
    })
  }

  GetSubjectsByGradeId() {
    this.Subjects = []
    this.SubjectServ.GetByGradeId(this.test.gradeID, this.DomainName).subscribe((d) => {
      this.Subjects = d
    })
  }

  GetAllSchools() {
    this.Schools = []
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.Schools = d
    })
  }

  GetYearsBySchoolId() {
    this.AcadenicYears = []
    this.AcadimicYearServ.GetBySchoolId(this.SchoolId, this.DomainName).subscribe((d) => {
      this.AcadenicYears = d
    })
  }


  Create() {
    this.mode = 'Create';
    this.test = new Test();
    this.openModal();
  }

  async Delete(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('Admission Test') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.testServ.Delete(id, this.DomainName).subscribe(
          (data: any) => {
            this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
          }
        );
      }
    });
  }

  Edit(row: Test) {
    this.mode = 'Edit';
    this.testServ.GetByID(row.id, this.DomainName).subscribe((d) => {
      this.test = d 
      this.SchoolId = this.test.schoolID 
      this.GetYearsBySchoolId()
      this.GetGradesBySchoolId()
      this.GetSubjectsByGradeId()
    })
    this.openModal();
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID, this.UserID, this.AllowDeleteForOthers);
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  async CreateOREdit() { 
    if (this.isFormValid()) { 
      const Swal = await import('sweetalert2').then(m => m.default);

      this.isLoading = true
      if (this.mode == "Create") {
        console.log(4)
        this.testServ.Add(this.test, this.DomainName).subscribe(() => {
          this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
          this.closeModal();
          this.isLoading = false
        },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        );
      } if (this.mode == "Edit") {
        this.testServ.Edit(this.test, this.DomainName).subscribe(() => {
          this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
          this.closeModal();
          this.isLoading = false
        },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        );
      }
    }
  }

  closeModal() {
    this.isModalVisible = false; 
    this.test = new Test();
    this.Schools = [];
    this.AcadenicYears = [];
    this.Grades = [];
    this.Subjects = [];
    this.SchoolId = 0; 
    this.validationErrors = {}
  }

  openModal() {
    this.GetAllSchools();  

    this.isModalVisible = true;
  }

  view(id: number) {
    this.router.navigateByUrl(`Employee/Question/${id}`)
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.test) {
      if (this.test.hasOwnProperty(key)) {
        const field = key as keyof Test;
        if (!this.test[field]) {
          // required fields for Test
          if (
            field === 'title' ||
            field === 'totalMark' ||
            field === 'subjectID' ||
            field === 'academicYearID' ||
            field === 'gradeID' ||
            field === 'schoolID'
          ) {
            const displayName = this.getFieldDisplayName(field);
            this.validationErrors[field] = this.getRequiredErrorMessage(displayName);
            isValid = false;
          }
        }
        console.log(this.validationErrors)
      }
    }
    return isValid;
  }

  capitalizeField(field: keyof Test): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof Test, value: any }) {
    const { field, value } = event;
    (this.test as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    } else {
      this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.PageSize = this.TotalRecords;
    this.CurrentPage = 1;
    this.TotalPages = 1;
    this.key = event.key;
    this.value = event.value;
    try {
      const data: any = await firstValueFrom(
        this.testServ.GetWithPaggination(this.DomainName, this.CurrentPage, this.PageSize)
      );
      this.Data = data.data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.Data = this.Data.filter((t) => {
          const fieldValue = t[this.key as keyof typeof t];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(this.value.toLowerCase());
          }
          if (typeof fieldValue === 'number') {
            return fieldValue.toString().includes(numericValue.toString());
          }
          return fieldValue == this.value;
        });
      }
    } catch (error) {
      this.Data = [];
    }
  }

  validateNumber(event: any, field: keyof Test): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = ''; 
      if (typeof this.test[field] === 'string') {
        this.test[field] = '' as never;  
      }
    }
  }

  private getFieldDisplayName(field: keyof Test): string {
    const map: { [key in keyof Test]?: string } = {
      title: 'Title',
      totalMark: 'Total Mark',
      subjectID: 'Subject',
      academicYearID: 'Academic Year',
      gradeID: 'Grade',
      schoolID: 'School',
    };
    return map[field] ?? this.capitalizeField(field);
  }

  changeCurrentPage(currentPage: number) {
    this.CurrentPage = currentPage;
    this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
  }

  validatePageSize(event: any) {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
    }
  }

  get visiblePages(): number[] {
    const total = this.TotalPages;
    const current = this.CurrentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = current - half;
    let end = current + half;

    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  validateNumberPage(event: any): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      this.PageSize = 0;
    }
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
  
}
