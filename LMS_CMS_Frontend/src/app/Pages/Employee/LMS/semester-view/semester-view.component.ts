import { Component } from '@angular/core';
import { ApiService } from '../../../../Services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Semester } from '../../../../Models/LMS/semester';
import { SemesterService } from '../../../../Services/Employee/LMS/semester.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { SearchComponent } from '../../../../Component/search/search.component';
import { MenuService } from '../../../../Services/shared/menu.service';
import { AccountService } from '../../../../Services/account.service';
import { TokenData } from '../../../../Models/token-data';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { SemesterWorkingWeekService } from '../../../../Services/Employee/LMS/semester-working-week.service';
// import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { SemesterWorkingWeek } from '../../../../Models/LMS/semester-working-week';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';
@Component({
  selector: 'app-semester-view',
  standalone: true,
  imports: [CommonModule,FormsModule ,SearchComponent, TranslateModule],
  templateUrl: './semester-view.component.html',
  styleUrl: './semester-view.component.css'
})

@InitLoader()
export class SemesterViewComponent {
  DomainName: string = "";
  semesterId: number = 0

  semester:Semester = new Semester()
  semesterWorkingWeek:SemesterWorkingWeek = new SemesterWorkingWeek()
  WorkingWeeks:SemesterWorkingWeek[]=[]
  isRtl: boolean = false;
  subscription!: Subscription;
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = ""
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  
  keysArray: string[] = ['id', 'englishName' ,"arabicName"];
  key: string = 'id';
  value: any = '';

  editWorkingWeek: boolean = false;
  validationErrors: { [key in keyof SemesterWorkingWeek]?: string } = {};
  isLoading = false; 
  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;
  isDeleting: boolean = false;

  constructor(private languageService: LanguageService,public account: AccountService, public EditDeleteServ: DeleteEditPermissionService, public ApiServ: ApiService, public activeRoute: ActivatedRoute, private translate: TranslateService,
    public router:Router, private menuService: MenuService, public semesterService:SemesterService, public semesterWorkingWeekService:SemesterWorkingWeekService,
    private loadingService: LoadingService){}

  ngOnInit(){
    this.DomainName = this.ApiServ.GetHeader();
    this.semesterId = Number(this.activeRoute.snapshot.paramMap.get('Id'))
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();

    this.GetSemesterById(this.semesterId)
    this.GetWorkingWeeksBySemesterById(this.semesterId,this.DomainName, this.CurrentPage, this.PageSize);

    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
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

private async showSuccessAlert(message: string) {
  const translatedTitle = this.translate.instant('Success');
  const translatedButton = this.translate.instant('Okay');

  const Swal = await import('sweetalert2').then(m => m.default);

  Swal.fire({
    icon: 'success',
    title: translatedTitle,
    text: message,
    confirmButtonText: translatedButton,
    customClass: { confirmButton: 'secondaryBg' },
  });
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

async Generate() {
  const translatedTitle = this.translate.instant('Are you sure?');
  const translatedCancel = this.translate.instant('No, cancel');
  const translatedConfirm = this.translate.instant('Yes, generate!');
  const translatedSure = this.translate.instant('I am Sure');
  const successMessage = this.translate.instant('Generated successfully');

  const Swal = await import('sweetalert2').then(m => m.default);

  if (this.WorkingWeeks.length == 0) {
    Swal.fire({
      title: translatedTitle,
      text: this.translate.instant('Do you want to generate the working weeks?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: translatedConfirm,
      confirmButtonColor: '#089B41',
      cancelButtonText: translatedCancel
    }).then((result) => {
      if (result.isConfirmed) {
        this.semesterWorkingWeekService.GenerateWeeks(this.semesterId, this.DomainName).subscribe({
          next: () => {
            this.GetWorkingWeeksBySemesterById(this.semesterId, this.DomainName, this.CurrentPage, this.PageSize);
            this.showSuccessAlert(successMessage);
          },
          error: (error) => {
            const errorMessage = error.error?.message || this.translate.instant('Failed to generate working weeks');
            this.showErrorAlert(errorMessage);
          }
        });
      }
    });
  } else {
    Swal.fire({
      title: translatedTitle,
      text: this.translate.instant('This Action Will Remove All the Last Generated Weeks, Are You Sure?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: translatedSure,
      confirmButtonColor: '#089B41',
      cancelButtonText: translatedCancel
    }).then((result) => {
      if (result.isConfirmed) {
        this.semesterWorkingWeekService.GenerateWeeks(this.semesterId, this.DomainName).subscribe({
          next: () => {
            this.GetWorkingWeeksBySemesterById(this.semesterId, this.DomainName, this.CurrentPage, this.PageSize);
            this.showSuccessAlert(successMessage);
          },
          error: (error) => {
            const errorMessage = error.error?.message || this.translate.instant('Failed to regenerate working weeks');
            this.showErrorAlert(errorMessage);
          }
        });
      }
    });
  }
}

  GetSemesterById(Id: number) {
    this.semesterService.GetByID(Id, this.DomainName).subscribe((data) => {
      this.semester = data;
    });
  }

  GetSemesterWeekDayById(Id: number) {
    this.semesterWorkingWeekService.GetByID(Id, this.DomainName).subscribe((data) => {
      this.semesterWorkingWeek = data;
    });
  } 

  // GetWorkingWeeksBySemesterById(Id: number) {
  //   this.WorkingWeeks = []
  //   this.semesterWorkingWeekService.GetBySemesterID(Id, this.DomainName).subscribe((data) => {
  //     this.WorkingWeeks = data;
  //   });
  // }

GetWorkingWeeksBySemesterById(Id: number, DomainName: string, pageNumber: number, pageSize: number) {
  this.WorkingWeeks = [];
  this.semesterWorkingWeekService.GetBySemesterIDWithPaggination(Id, DomainName, pageNumber, pageSize).subscribe(
    (data) => {
      this.CurrentPage = data.pagination.currentPage;
      this.PageSize = data.pagination.pageSize;
      this.TotalPages = data.pagination.totalPages;
      this.TotalRecords = data.pagination.totalRecords;
      this.WorkingWeeks = data.data;
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
            this.GetWorkingWeeksBySemesterById(Id, this.DomainName, this.CurrentPage, this.PageSize);
          }
        }
      } else {
        // Show error message for other errors
        const errorMessage = error.error?.message || this.translate.instant('Failed to load working weeks');
        this.showErrorAlert(errorMessage);
      }
    }
  );
}

  openModal(Id?: number) {
    if (Id) {
      this.editWorkingWeek = true;
      this.GetSemesterWeekDayById(Id); 
    } 
    document.getElementById("Add_Modal")?.classList.remove("hidden");
    document.getElementById("Add_Modal")?.classList.add("flex");
  }

  closeModal() {
    document.getElementById("Add_Modal")?.classList.remove("flex");
    document.getElementById("Add_Modal")?.classList.add("hidden");

    this.semesterWorkingWeek= new SemesterWorkingWeek()

    if(this.editWorkingWeek){
      this.editWorkingWeek = false
    }
    this.validationErrors = {}; 
  } 

  capitalizeField(field: keyof SemesterWorkingWeek): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

isFormValid(): boolean {
  let isValid = true;
  for (const key in this.semesterWorkingWeek) {
    if (this.semesterWorkingWeek.hasOwnProperty(key)) {
      const field = key as keyof SemesterWorkingWeek;
      if (!this.semesterWorkingWeek[field]) {
        if (field == "englishName" || field == "arabicName" || field == "dateFrom" || field == "dateTo") {
          const fieldName = this.capitalizeField(field);
          this.validationErrors[field] = `*${this.translate.instant(fieldName)} ${this.translate.instant('Is Required')}`;
          isValid = false;
        }
      } else {
        if (field == "englishName" || field == "arabicName") {
          if (this.semesterWorkingWeek[field]?.toString().length > 100) {
            const fieldName = this.capitalizeField(field);
            this.validationErrors[field] = `*${this.translate.instant(fieldName)} ${this.translate.instant('cannot be longer than 100 characters')}`;
            isValid = false;
          }
        } else {
          this.validationErrors[field] = '';
        }
      }
    }
  }
  return isValid;
}

async Delete(id: number) {
  const translatedTitle = this.translate.instant('Are you sure?');
  const translatedText = this.translate.instant('You will not be able to recover this item!');
  const translatedConfirm = this.translate.instant('Yes, delete it!');
  const translatedCancel = this.translate.instant('No, keep it');
  const successMessage = this.translate.instant('Deleted successfully');

  const Swal = await import('sweetalert2').then(m => m.default);

  Swal.fire({
    title: translatedTitle,
    text: translatedText,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#089B41',
    cancelButtonColor: '#17253E',
    confirmButtonText: translatedConfirm,
    cancelButtonText: translatedCancel,
  }).then((result) => {
    if (result.isConfirmed) {
      this.semesterWorkingWeekService.Delete(id, this.DomainName).subscribe({
        next: () => {
          this.GetWorkingWeeksBySemesterById(this.semesterId, this.DomainName, this.CurrentPage, this.PageSize);
          this.showSuccessAlert(successMessage);
        },
        error: (error) => {
          console.error('Error deleting week:', error);
          const errorMessage = error.error?.message || this.translate.instant('Failed to delete the week');
          this.showErrorAlert(errorMessage);
        }
      });
    }
  });
}

  onInputValueChange(event: { field: keyof SemesterWorkingWeek, value: any }) {
    const { field, value } = event;
    (this.semesterWorkingWeek as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }
  
async checkFromToDate() {
  let valid = true;

  const semesterFrom: Date = new Date(this.semester.dateFrom);
  const semesterTo: Date = new Date(this.semester.dateTo);
  const workingWeekFrom: Date = new Date(this.semesterWorkingWeek.dateFrom);
  const workingWeekTo: Date = new Date(this.semesterWorkingWeek.dateTo);

  const Swal = await import('sweetalert2').then(m => m.default);

  if (workingWeekTo.getTime() < workingWeekFrom.getTime()) {
    valid = false;
    Swal.fire({
      title: this.translate.instant('From Date Must Be Before To Date'),
      icon: 'warning',
      confirmButtonColor: '#089B41',
      confirmButtonText: this.translate.instant('Ok'),
    });
    this.isLoading = false;
    return false;
  }

  if (
    workingWeekFrom.getTime() < semesterFrom.getTime() ||
    workingWeekTo.getTime() > semesterTo.getTime()
  ) {
    valid = false;
    Swal.fire({
      title: this.translate.instant('Working Week dates must be within the Semester Range'),
      icon: 'warning',
      confirmButtonColor: '#089B41',
      confirmButtonText: this.translate.instant('Ok'),
    });
    this.isLoading = false;
    return false;
  }

  return valid;
}
   
async Save() {
  if (this.isFormValid()) {
    this.isLoading = true;
    this.semesterWorkingWeek.semesterID = this.semesterId;
    
    if (await this.checkFromToDate()) {
      const successMessage = this.editWorkingWeek
        ? this.translate.instant('Updated successfully')
        : this.translate.instant('Created successfully');

      const operation = this.editWorkingWeek
        ? this.semesterWorkingWeekService.Edit(this.semesterWorkingWeek, this.DomainName)
        : this.semesterWorkingWeekService.Add(this.semesterWorkingWeek, this.DomainName);

      operation.subscribe({
        next: () => {
          this.GetWorkingWeeksBySemesterById(this.semesterId, this.DomainName, this.CurrentPage, this.PageSize);
          this.closeModal();
          this.showSuccessAlert(successMessage);
          this.isLoading = false;
        },
        error: (error) => {
          console.error(`Error ${this.editWorkingWeek ? 'updating' : 'creating'} week:`, error);
          const errorMessage = error.error?.message ||
            this.translate.instant(`Failed to ${this.editWorkingWeek ? 'update' : 'create'} week`);
          this.showErrorAlert(errorMessage);
          this.isLoading = false;
        },
      });
    }
  }
}

  async onSearchEvent(event: { key: string; value: any }) {
    this.PageSize = this.TotalRecords
    this.CurrentPage = 1
    this.TotalPages = 1
    this.key = event.key;
    this.value = event.value;
    try {
      const data: any = await firstValueFrom(
        this.semesterWorkingWeekService.GetBySemesterIDWithPaggination(this.semesterId, this.DomainName, this.CurrentPage, this.PageSize)
      );
      this.WorkingWeeks = data.data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.WorkingWeeks = this.WorkingWeeks.filter((t) => {
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
      this.WorkingWeeks = [];
    }
  }

  changeCurrentPage(currentPage: number) {
    this.CurrentPage = currentPage;
    this.GetWorkingWeeksBySemesterById(this.semesterId,this.DomainName, this.CurrentPage, this.PageSize);
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
}
