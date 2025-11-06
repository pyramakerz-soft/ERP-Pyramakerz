import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { TokenData } from '../../../../Models/token-data';
import { EmployeeTypeService } from '../../../../Services/Employee/employee-type.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { Employee } from '../../../../Models/Employee/employee';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent, TranslateModule],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})
export class EmployeeComponent {

  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")

  DomainName: string = "";
  UserID: number = 0;
  path: string = "";
  isRtl: boolean = false;
  subscription!: Subscription;
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: Employee[] = []

  keysArray: string[] = ['id', 'user_Name', 'ar_name', 'en_name', 'mobile', 'phone', 'email', 'address', 'role_Name', 'employeeTypeName'];
  key: string = "id";
  value: any = "";
  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;
  isDeleting: boolean = false;

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private translate: TranslateService,
    public ApiServ: ApiService,
    private menuService: MenuService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    public EmpServ: EmployeeService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    if (this.User_Data_After_Login.type === "employee") {
      this.DomainName = this.ApiServ.GetHeader();
      this.activeRoute.url.subscribe(url => {
        this.path = url[0].path
        this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
        this.menuService.menuItemsForEmployee$.subscribe((items) => {
          const settingsPage = this.menuService.findByPageName(this.path, items);
          if (settingsPage) {
            this.AllowEdit = settingsPage.allow_Edit;
            this.AllowDelete = settingsPage.allow_Delete;
            this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others
            this.AllowEditForOthers = settingsPage.allow_Edit_For_Others
          }
        });

      });
    }
    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';

  }


  ngOnDestroy(): void {
    this.realTimeService.stopConnection();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private showErrorAlert(errorMessage: string) {
    const translatedTitle = this.translate.instant('Error');
    const translatedButton = this.translate.instant('Okay');
    
    Swal.fire({
      icon: 'error',
      title: translatedTitle,
      text: errorMessage,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  private showSuccessAlert(message: string) {
    const translatedTitle = this.translate.instant('Success');
    const translatedButton = this.translate.instant('Okay');
    
    Swal.fire({
      icon: 'success',
      title: translatedTitle,
      text: message,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  private showLoadingAlert(message: string) {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  // GetAllData(DomainName: string, pageNumber: number, pageSize: number) {
  //   this.EmpServ.GeTWithPaggination(this.DomainName, this.CurrentPage, this.PageSize).subscribe((data) => {
  //     this.TableData = data
  //   })
  // }

  GetAllData(DomainName: string, pageNumber: number, pageSize: number) {
    this.TableData = [];
    this.EmpServ.GeTWithPaggination(DomainName, pageNumber, pageSize).subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage;
        this.PageSize = data.pagination.pageSize;
        this.TotalPages = data.pagination.totalPages;
        this.TotalRecords = data.pagination.totalRecords;
        this.TableData = data.data;
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
            this.translate.instant('Failed to load Employees');
          this.showErrorAlert(errorMessage);
        }
      }
    );
  }


  Create() {
    this.router.navigateByUrl("Employee/Employee/Create")
  }

  Edit(id: number) {
    this.router.navigateByUrl(`Employee/Employee/Edit/${id}`)

  }

Delete(id: number) {
  const deleteTitle = this.translate.instant('Are you sure you want to delete this employee?');
  const deleteButton = this.translate.instant('Delete');
  const cancelButton = this.translate.instant('Cancel');
  
  Swal.fire({
    title: deleteTitle,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#089B41',
    cancelButtonColor: '#17253E',
    confirmButtonText: deleteButton,
    cancelButtonText: cancelButton,
  }).then((result) => {
    if (result.isConfirmed) {
      this.showLoadingAlert(this.translate.instant('Deleting...'));

      this.EmpServ.Delete(id, this.DomainName).subscribe({
        next: () => {
          this.showSuccessAlert(this.translate.instant('Employee deleted successfully'));
            this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
        },
        error: (error) => {
          const errorMessage = error.error?.message || this.translate.instant('Failed to delete employee');
          this.showErrorAlert(errorMessage);
        },
      });
    }
  });
}

  view(id: number) {
    this.router.navigateByUrl(`Employee/Employee/${id}`)
  }

suspend(emp: Employee) {
  const isSuspending = !emp.isSuspended;
  
  const message = isSuspending 
    ? this.translate.instant('Are you sure you want to suspend this employee?')
    : this.translate.instant('Are you sure you want to unsuspend this employee?');
  
  const confirmButtonText = isSuspending 
    ? this.translate.instant('Suspend')
    : this.translate.instant('Unsuspend');
  
  const cancelButton = this.translate.instant('Cancel');
  
  Swal.fire({
    title: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#089B41',
    cancelButtonColor: '#17253E',
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButton,
  }).then((result) => {
    if (result.isConfirmed) {
      this.EmpServ.Suspend(emp.id, this.DomainName).subscribe({
        next: () => {
          const successMessage = isSuspending
            ? this.translate.instant('Employee suspended successfully')
            : this.translate.instant('Employee unsuspended successfully');
          
          this.showSuccessAlert(successMessage);
          this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
        },
        error: (error) => {
          const errorMessage = error.error?.message || this.translate.instant('Failed to update employee status');
          this.showErrorAlert(errorMessage);
        },
      });
    }
  });
}

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID, this.UserID, this.AllowDeleteForOthers);
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  async onSearchEvent(event: { key: string, value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: Employee[] = await firstValueFrom(this.EmpServ.Get_Employees(this.DomainName));
      this.TableData = data || [];

      if (this.value !== "") {
        const numericValue = isNaN(Number(this.value)) ? this.value : parseInt(this.value, 10);

        this.TableData = this.TableData.filter(t => {
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
}
