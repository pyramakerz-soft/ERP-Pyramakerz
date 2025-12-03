import { Component } from '@angular/core';
import { LeaveRequest } from '../../../../Models/HR/leave-request';
import { LeaveRequestService } from '../../../../Services/Employee/HR/leave-request.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';
// import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { Employee } from '../../../../Models/Employee/employee';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { BounsTypeService } from '../../../../Services/Employee/HR/bouns-type.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './leave-request.component.html',
  styleUrl: './leave-request.component.css'
})

@InitLoader()
export class LeaveRequestComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  TableData: LeaveRequest[] = [];
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'employeeEnName'];

  leaveRequest: LeaveRequest = new LeaveRequest();
  OldleaveRequest: LeaveRequest = new LeaveRequest();

  validationErrors: { [key in keyof LeaveRequest]?: string } = {};
  isLoading = false;

  employees: Employee[] = [];
  selectedEmployee: Employee = new Employee();

  CurrentPage: number = 1
  PageSize: number = 10
  TotalPages: number = 1
  TotalRecords: number = 0
  isDeleting: boolean = false;
  MonthlyLeaveRequestBalanceError: boolean = false;

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    private translate: TranslateService,
    public account: AccountService,
    private languageService: LanguageService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public LeaveRequestServ: LeaveRequestService,
    public BounsTypeServ: BounsTypeService,
    public EmployeeServ: EmployeeService,
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

    this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize)

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

  GetAllData(DomainName: string, pageNumber: number, pageSize: number) {
    this.TableData = [];
    this.LeaveRequestServ.Get(DomainName, pageNumber, pageSize).subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage
        this.PageSize = data.pagination.pageSize
        this.TotalPages = data.pagination.totalPages
        this.TotalRecords = data.pagination.totalRecords
        this.TableData = data.data
      },
      (error) => {
        if (error.status == 404) {
          if (this.TotalRecords != 0) {
            let lastPage
            if (this.isDeleting) {
              lastPage = (this.TotalRecords - 1) / this.PageSize
            } else {
              lastPage = this.TotalRecords / this.PageSize
            }
            if (lastPage >= 1) {
              if (this.isDeleting) {
                this.CurrentPage = Math.floor(lastPage)
                this.isDeleting = false
              } else {
                this.CurrentPage = Math.ceil(lastPage)
              }
              this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize)
            }
          }
        }
      }
    )
  }

  Create() {
    this.mode = 'Create';
    this.leaveRequest = new LeaveRequest();
    this.validationErrors = {};
    this.openModal();
  }

  async Delete(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('Request') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.LeaveRequestServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize)
        });
      }
    });
  }

  Edit(id: number) {
    this.mode = 'Edit';
    this.LeaveRequestServ.GetByID(id, this.DomainName).subscribe((d) => {
      this.leaveRequest = { ...d };
      this.OldleaveRequest = { ...d };
      console.log(123,this.leaveRequest)
      // this.leaveRequest.remains = this.leaveRequest.monthlyLeaveRequestBalance - this.leaveRequest.used
    });
    this.openModal();
  }

  EmployeeIsChanged() {
    if (this.leaveRequest.employeeID && this.leaveRequest.date) {
      this.LeaveRequestServ.GetRemainLeavRequestsByEmployeeId(this.leaveRequest.employeeID, this.leaveRequest.date, this.DomainName).subscribe((emp) => {
        this.selectedEmployee = emp
        this.leaveRequest.monthlyLeaveRequestBalance = emp.monthlyLeaveRequestBalance
        this.leaveRequest.used = emp.monthlyLeaveRequestUsed
        this.leaveRequest.remains = this.leaveRequest.monthlyLeaveRequestBalance - this.leaveRequest.used
        this.MonthlyLeaveRequestBalanceError = false
        this.CalculateRemains();
      }, async error => { 
        if (typeof error.error === 'string' && error.error.includes("Monthly leave request for this employee is required")) {
          this.MonthlyLeaveRequestBalanceError = true

          const Swal = await import('sweetalert2').then(m => m.default);

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'This employee does not have a Monthly leave request!',
            confirmButtonText: 'Okay',
            customClass: { confirmButton: 'secondaryBg' }
          });
        }
      });
    }
  }

  CalculateRemains() {
    const balance = Number(this.leaveRequest.monthlyLeaveRequestBalance) || 0;
    const alreadyUsed = Number(this.selectedEmployee.monthlyLeaveRequestUsed) || 0;

    const currentHours = Number(this.leaveRequest.hours) || 0;
    const currentMinutes = Number(this.leaveRequest.minutes) || 0;

    if (this.mode === 'Edit') {
      // Convert old values to minutes
      const oldHours = Number(this.OldleaveRequest.hours) || 0;
      const oldMinutes = Number(this.OldleaveRequest.minutes) || 0;
      const oldTotalMinutes = (oldHours * 60) + oldMinutes;

      // Convert new values to minutes
      const newTotalMinutes = (currentHours * 60) + currentMinutes;

      // Already used (from DB) includes the old request, so subtract it first, then add the new one
      let usedMinutes = (alreadyUsed * 60) - oldTotalMinutes + newTotalMinutes;

      if (usedMinutes < 0) usedMinutes = 0;

      // Remaining minutes
      let remainingMinutes = (balance * 60) - usedMinutes;
      if (remainingMinutes < 0) remainingMinutes = 0;

      this.leaveRequest.used = usedMinutes / 60;
      this.leaveRequest.remains = remainingMinutes / 60;

    } else {
      // Create mode → always add current
      const balanceMinutes = balance * 60;
      const usedMinutes = (alreadyUsed * 60) + (currentHours * 60) + currentMinutes;

      let remainingMinutes = balanceMinutes - usedMinutes;
      if (remainingMinutes < 0) remainingMinutes = 0;

      this.leaveRequest.used = usedMinutes / 60;
      this.leaveRequest.remains = remainingMinutes / 60;
    }
  }

  formatHours(value: number | null): string {
    if(value){
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }else{
      return ``;
    }
  }

  validateNumber(event: any, field: keyof LeaveRequest): void {
    let value = event.target.value;
    // Allow only digits
    value = value.replace(/[^0-9]/g, '');
    event.target.value = value;

    if (value === '') {
      this.leaveRequest[field] = 0 as never;
      return;
    }

    const numericValue = Number(value);

    if (field === 'minutes') {
      if (numericValue > 59) {
        this.leaveRequest.minutes = 59; // cap minutes at 59
        event.target.value = '59';
      } else {
        this.leaveRequest.minutes = numericValue;
        this.validationErrors['minutes'] = '';
        this.validationErrors['hours'] = '';
      }
    }

    if (field === 'hours') {
      if (numericValue > this.leaveRequest.monthlyLeaveRequestBalance) {
        this.leaveRequest.hours = this.leaveRequest.monthlyLeaveRequestBalance;
        event.target.value = String(this.leaveRequest.monthlyLeaveRequestBalance);
      } else {
        this.leaveRequest.hours = numericValue;
        this.validationErrors['hours'] = '';
      }
    }

    this.CalculateRemains();
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

  async CreateOREdit() {
    if (await this.isFormValid()) {
      const Swal = await import('sweetalert2').then(m => m.default);

      this.isLoading = true;
      if (this.mode == 'Create') {
        this.LeaveRequestServ.Add(this.leaveRequest, this.DomainName).subscribe(
          (d) => {
            this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize)
            this.isLoading = false;
            this.closeModal();
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Created Successfully',
              confirmButtonColor: '#089B41',
            });
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
        this.LeaveRequestServ.Edit(this.leaveRequest, this.DomainName).subscribe(
          (d) => {
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Updated Successfully',
              confirmButtonColor: '#089B41',
            });
            this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize)
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

  closeModal() {
    this.isModalVisible = false;
  }

  openModal() {
    this.validationErrors = {};
    this.isModalVisible = true;
    this.getAllEmployees()
  }

  getAllEmployees() {
    this.EmployeeServ.Get_Employees(this.DomainName).subscribe((d) => {
      this.employees = d
      if (this.mode == 'Edit') {
        var emp = this.employees.find(e => e.id == this.leaveRequest.employeeID)
        if (emp) {
          this.selectedEmployee = emp
        }
      }
    })
  }

  async isFormValid(): Promise<boolean> {
  let isValid = true;
  
  // Basic field validation
  for (const key in this.leaveRequest) {
    if (this.leaveRequest.hasOwnProperty(key)) {
      const field = key as keyof LeaveRequest;
      if (!this.leaveRequest[field]) {
        if (
          field == 'date' ||
          field == 'employeeID'
        ) {
          this.validationErrors[field] = this.getRequiredErrorMessage(
            this.capitalizeField(field)
          );
          isValid = false;
        }
      }
    }
  }
    if (this.leaveRequest.hours == 0 && this.leaveRequest.minutes == 0 || this.leaveRequest.hours == null && this.leaveRequest.minutes == null || this.leaveRequest.hours == 0 && this.leaveRequest.minutes == null || this.leaveRequest.hours == null && this.leaveRequest.minutes == 0) {
      this.validationErrors['hours'] = "Please enter hours or minutes."
      isValid = false;
    }
    // validate tha not give him more than this.leaveRequest.remains
    if (this.leaveRequest.used && this.leaveRequest.used > this.leaveRequest.monthlyLeaveRequestBalance) {
      this.validationErrors['hours'] = "You Can not exceed Monthly Leave Request Balance"
      isValid = false;
    }
    if (this.MonthlyLeaveRequestBalanceError) {
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'This employee does not have a Monthly leave request!',
        confirmButtonText: 'Okay',
        customClass: { confirmButton: 'secondaryBg' }
      });
      isValid = false;
    }
    return isValid;
  }

  capitalizeField(field: keyof LeaveRequest): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof LeaveRequest; value: any }) {
    this.validationErrors['hours'] = '';
    const { field, value } = event;
    (this.leaveRequest as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
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
        this.LeaveRequestServ.Get(this.DomainName, this.CurrentPage, this.PageSize)
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
    this.CurrentPage = currentPage
    this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize)
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
      this.PageSize = 0
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