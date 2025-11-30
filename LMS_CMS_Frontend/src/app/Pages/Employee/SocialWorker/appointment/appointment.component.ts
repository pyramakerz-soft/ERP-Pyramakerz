import { Component } from '@angular/core';
import { Appointment } from '../../../../Models/SocialWorker/appointment';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { AppointmentService } from '../../../../Services/Employee/SocialWorker/appointment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
// import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { School } from '../../../../Models/school';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { AppointmentGrade } from '../../../../Models/SocialWorker/appointment-grade';
import { Grade } from '../../../../Models/LMS/grade';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css'
})

@InitLoader()
export class AppointmentComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  SelectedSchoolId: number = 0;
  TableData: Appointment[] = [];
  DomainName: string = '';
  UserID: number = 0;
  isRtl: boolean = false;
  subscription!: Subscription;
  isModalVisible: boolean = false;
  mode: string = 'Create';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'title'];
  schools: School[] = [];
  schoolsToCreate: School[] = [];
  isLoading = false;

  appointment: Appointment = new Appointment()
  grades: Grade[] = [];

  dropdownOpen = false;
  gradeSelected: AppointmentGrade[] = [];
  validationErrors: { [key in keyof Appointment]?: string } = {};
  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;
  isDeleting: boolean = false;

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public SchoolServ: SchoolService,
    public GradeServ: GradeService,
    public AppointmentServ: AppointmentService, 
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
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });

    this.GetSchools();
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

  // GetAllData(DomainName: string, pageNumber: number, pageSize: number) {
  //   this.TableData = [];
  //   this.AppointmentServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
  //     this.TableData = d;
  //     console.log(d, this.TableData)
  //   });
  // }

  GetAllData(DomainName: string, pageNumber: number, pageSize: number) {
    this.TableData = [];
    this.AppointmentServ.GetBySchoolIdWithPaggination(this.SelectedSchoolId ,DomainName, pageNumber, pageSize).subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage;
        this.PageSize = data.pagination.pageSize;
        this.TotalPages = data.pagination.totalPages;
        this.TotalRecords = data.pagination.totalRecords;
        this.TableData = data.data;
        console.log(this.TableData)
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

  GetAllGrades() {
    this.grades = []
    this.gradeSelected = []
    this.appointment.gradeIds = []
    this.GradeServ.GetBySchoolId(this.appointment.schoolID, this.DomainName).subscribe((d) => {
      this.grades = d
    })
  }

  GetSchools() {
    this.schools = []
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schools = d
      this.schoolsToCreate = d
    })
  }

  Create() {
    this.mode = 'Create';
    this.appointment = new Appointment();
    this.dropdownOpen = false;
    this.openModal();
    this.gradeSelected = [];
  }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
    this.validationErrors = {}
  }

  async Delete(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);
    
    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " +this.translate.instant('the') +this.translate.instant('Appoinment') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.AppointmentServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
        });
      }
    });
  }

  Edit(row: Appointment): void {
    this.mode = 'Edit';
    this.AppointmentServ.GetByID(row.id, this.DomainName).subscribe(
      data => {
        this.appointment = data;
        this.GradeServ.GetBySchoolId(this.appointment.schoolID, this.DomainName).subscribe((d) => {
          this.grades = d
        })
        this.gradeSelected = data.appointmentGrades
        this.appointment.gradeIds = this.appointment.appointmentGrades.map((grade) => grade.gradeID) ?? [];
      }
    )
    this.openModal();
    this.dropdownOpen = false;
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

  async onSearchEvent(event: { key: string; value: any }) {
    this.PageSize = this.TotalRecords;
    this.CurrentPage = 1;
    this.TotalPages = 1;
    this.key = event.key;
    this.value = event.value;
    try {
      const data: any = await firstValueFrom(
        this.AppointmentServ.GetBySchoolIdWithPaggination(this.SelectedSchoolId ,this.DomainName, this.CurrentPage, this.PageSize)
      );
      this.TableData = data.data || [];

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
            return fieldValue.toString().includes(numericValue.toString());
          }
          return fieldValue == this.value;
        });
      }
    } catch (error) {
      this.TableData = [];
    }
  }


  async CreateOREdit() {
    if (this.isFormValid()) {
      const Swal = await import('sweetalert2').then(m => m.default);

      this.isLoading = true
      if (this.mode == 'Create') {
        this.AppointmentServ.Add(this.appointment, this.DomainName).subscribe((d) => {
          this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
          this.closeModal()
          this.isLoading = false
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Created Successfully',
            confirmButtonColor: '#089B41',
          });
        }, error => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.error,
            confirmButtonText: 'Okay',
            customClass: { confirmButton: 'secondaryBg' }
          });
        })
      }
      else if (this.mode == 'Edit') {
        this.AppointmentServ.Edit(this.appointment, this.DomainName).subscribe((d) => {
          this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
          this.closeModal()
          this.isLoading = false
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Updated Successfully',
            confirmButtonColor: '#089B41',
          });
        }, error => {
          this.isLoading = false
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
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.appointment) {
      if (this.appointment.hasOwnProperty(key)) {
        const field = key as keyof Appointment;
        if (!this.appointment[field]) {
          if (
            field == 'gradeIds' ||
            field == 'schoolID' ||
            field == 'date' ||
            field == 'dueDateToParentToAccept' ||
            field == 'title'
          ) {
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
            isValid = false;
          }
        }
        if (this.appointment.gradeIds.length == 0) {
          this.validationErrors["gradeIds"] = `Grade is required`;
          isValid = false;
        }
        if (this.appointment.dueDateToParentToAccept > this.appointment.date) {
          this.validationErrors["dueDateToParentToAccept"] = `Due Date To Parent To Accept Can Not Be After Appointment Date`;
          isValid = false;
        }
      }
    }
    return isValid;
  }

  capitalizeField(field: keyof Appointment): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  View(id:number){
    this.router.navigateByUrl('Employee/Appoinment/'+id);
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectGrade(grade: Grade): void {
    this.validationErrors["gradeIds"] = ``;

    if (!this.gradeSelected.some((e) => e.gradeID === grade.id)) {
      const gradeselect = new AppointmentGrade()
      gradeselect.gradeID = grade.id
      gradeselect.gradeName = grade.name
      this.gradeSelected.push(gradeselect);
    }

    if (!this.appointment.gradeIds.some((e) => e === grade.id)) {
      this.appointment.gradeIds.push(grade.id);
    }

    this.dropdownOpen = false; // Close dropdown after selection
  }

  removeSelected(id: number): void {
    this.gradeSelected = this.gradeSelected.filter((e) => e.gradeID !== id);
    this.appointment.gradeIds = this.appointment.gradeIds.filter((i) => i !== id);
  }

  onInputValueChange(event: { field: keyof Appointment; value: any }) {
    const { field, value } = event;
    (this.appointment as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
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
