import { Component } from '@angular/core';
import { VacationEmployee } from '../../../../Models/HR/vacation-employee';
import { VacationTypes } from '../../../../Models/HR/vacation-types';
import { VacationEmployeeService } from '../../../../Services/Employee/HR/vacation-employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { EmployeeGet } from '../../../../Models/Employee/employee-get';
import { LeaveRequest } from '../../../../Models/HR/leave-request';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { VacationTypesService } from '../../../../Services/Employee/HR/vacation-types.service';

@Component({
  selector: 'app-vacation-employee',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './vacation-employee.component.html',
  styleUrl: './vacation-employee.component.css'
})
export class VacationEmployeeComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  TableData: VacationEmployee[] = [];
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'name'];

  vacationEmployee: VacationEmployee = new VacationEmployee();
  OldVacationEmployee: VacationEmployee = new VacationEmployee();

  validationErrors: { [key in keyof VacationEmployee]?: string } = {};
  isLoading = false;

  employees: EmployeeGet[] = [];
  vacationTypes: VacationTypes[] = [];
  selectedEmployee: EmployeeGet = new EmployeeGet();
  HireDateError: boolean = false;

  CurrentPage: number = 1
  PageSize: number = 10
  TotalPages: number = 1
  TotalRecords: number = 0
  isDeleting: boolean = false;

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private languageService: LanguageService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public VacationEmployeeServ: VacationEmployeeService,
    public EmployeeServ: EmployeeService,
    public VacationTypesServ: VacationTypesService,
    private realTimeService: RealTimeNotificationServiceService,
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
    this.realTimeService.stopConnection();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  GetAllData(DomainName: string, pageNumber: number, pageSize: number) {
    this.TableData = [];
    this.VacationEmployeeServ.Get(DomainName, pageNumber, pageSize).subscribe(
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
    this.vacationEmployee = new VacationEmployee();
    this.validationErrors = {};
    this.openModal();
  }

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this vacation?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.VacationEmployeeServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize)
        });
      }
    });
  }

  Edit(id: number) {
    this.mode = 'Edit';
    this.VacationEmployeeServ.GetByID(id, this.DomainName).subscribe((d) => {
      this.vacationEmployee = { ...d };
      this.vacationEmployee.remains = this.vacationEmployee.balance - this.vacationEmployee.used
      this.OldVacationEmployee = { ...d };
    });
    this.openModal();
  }

  EmployeeIsChanged() {
    this.vacationEmployee.balance = 0
    this.vacationEmployee.used = 0
    this.vacationEmployee.remains = 0
    this.OldVacationEmployee.balance = 0
    this.OldVacationEmployee.used = 0
    if (this.vacationEmployee.employeeID && this.vacationEmployee.vacationTypesID && this.vacationEmployee.dateFrom) {
      this.VacationEmployeeServ.GetBalanceAndUsedVacationEmployee(this.vacationEmployee.employeeID, this.vacationEmployee.vacationTypesID, this.vacationEmployee.dateFrom, this.DomainName).subscribe((emp) => {
        console.log(emp)
        this.HireDateError = false
        this.vacationEmployee.balance = emp.balance
        this.vacationEmployee.used = emp.used
        this.vacationEmployee.remains = this.vacationEmployee.balance - emp.used
        this.OldVacationEmployee.balance = emp.balance
        this.OldVacationEmployee.used = emp.used
        this.CalculateRemains()
      }, error => {
        console.log(error.error);
        if (typeof error.error === 'string' && error.error.includes("This employee does not have a hire date set")) {
          this.HireDateError = true
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'This employee does not have a hire date set!',
            confirmButtonText: 'Okay',
            customClass: { confirmButton: 'secondaryBg' }
          });
        }
      });
    }
  }

  DateFromIsChanged() {
    if (this.vacationEmployee.halfDay != true && (this.vacationEmployee.dateTo == '' || this.vacationEmployee.dateTo == null || this.vacationEmployee.dateTo < this.vacationEmployee.dateFrom)) {
      this.vacationEmployee.dateTo = this.vacationEmployee.dateFrom
    }
  }

  CalculateRemains() {
    console.log("Before:", this.vacationEmployee, this.OldVacationEmployee);

    let usedDays = this.OldVacationEmployee.used || 0;

    if (this.mode === "Edit") {
      // --- Remove old vacation days first ---
      let oldDays = 0;
      if (this.OldVacationEmployee.halfDay) {
        oldDays = 0.5;
      } else {
        const from = new Date(this.OldVacationEmployee.dateFrom);
        const to = new Date(this.OldVacationEmployee.dateTo || this.OldVacationEmployee.dateFrom);
        const diffMs = to.getTime() - from.getTime();
        oldDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
      }
      usedDays -= oldDays;

      // --- Add new vacation days ---
      let newDays = 0;
      if (this.vacationEmployee.halfDay) {
        newDays = 0.5;
      } else if (this.vacationEmployee.dateFrom) {
        const from = new Date(this.vacationEmployee.dateFrom);
        const to = new Date(this.vacationEmployee.dateTo || this.vacationEmployee.dateFrom);
        const diffMs = to.getTime() - from.getTime();
        newDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
      }
      usedDays += newDays;

    } else {
      // --- Add new vacation when creating ---
      if (this.vacationEmployee.halfDay) {
        usedDays += 0.5;
      } else if (this.vacationEmployee.dateFrom) {
        const from = new Date(this.vacationEmployee.dateFrom);
        const to = new Date(this.vacationEmployee.dateTo || this.vacationEmployee.dateFrom);
        const diffMs = to.getTime() - from.getTime();
        usedDays += Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
      }
    }

    this.vacationEmployee.used = usedDays;
    this.vacationEmployee.remains = this.vacationEmployee.balance - usedDays;

    console.log("After:", this.vacationEmployee, this.OldVacationEmployee);
  }


  onIshalfDayChange(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.vacationEmployee.halfDay = isChecked;
    if (this.vacationEmployee.halfDay) {
      this.vacationEmployee.dateTo = null
    } else {
      this.vacationEmployee.dateTo = this.vacationEmployee.dateFrom
    }
    this.CalculateRemains()
  }


  validateNumber(event: any, field: keyof VacationEmployee): void {
    let value = event.target.value;
    // Allow only digits
    value = value.replace(/[^0-9]/g, '');
    event.target.value = value;

    if (value === '') {
      this.vacationEmployee[field] = 0 as never;
      return;
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

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true;
      console.log(this.vacationEmployee)
      if (this.mode == 'Create') {
        this.VacationEmployeeServ.Add(this.vacationEmployee, this.DomainName).subscribe(
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
            console.log(error)
            this.isLoading = false; // Hide spinner
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Try Again Later!',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' }
            });
          }
        );
      }
      if (this.mode == 'Edit') {
        this.VacationEmployeeServ.Edit(this.vacationEmployee, this.DomainName).subscribe(
          (d) => {
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Updatedd Successfully',
              confirmButtonColor: '#089B41',
            });
            this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize)
            this.isLoading = false;
            this.closeModal();
          },
          (error) => {
            console.log(error)
            this.isLoading = false; // Hide spinner
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Try Again Later!',
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
    this.vacationEmployee = new VacationEmployee()
    this.OldVacationEmployee = new VacationEmployee()
    this.isModalVisible = true;
    this.getAllEmployees()
    this.getAllVacationType()
  }

  getAllEmployees() {
    this.EmployeeServ.Get_Employees(this.DomainName).subscribe((d) => {
      this.employees = d
      if (this.mode == 'Edit') {
        var emp = this.employees.find(e => e.id == this.vacationEmployee.employeeID)
        if (emp) {
          this.selectedEmployee = emp
        }
      }
    })
  }

  getAllVacationType() {
    this.VacationTypesServ.Get(this.DomainName).subscribe((d) => {
      this.vacationTypes = d
    })
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.vacationEmployee) {
      if (this.vacationEmployee.hasOwnProperty(key)) {
        const field = key as keyof VacationEmployee;
        if (!this.vacationEmployee[field]) {
          if (
            field == 'date' ||
            field == 'employeeID'
          ) {
            this.validationErrors[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        }
      }
    }
    if (this.vacationEmployee.used > this.vacationEmployee.balance) {
      isValid = false;
    }

    if (this.HireDateError == true) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'This employee does not have a hire date set!',
        confirmButtonText: 'Okay',
        customClass: { confirmButton: 'secondaryBg' }
      });
      isValid = false;
    }
    return isValid;
  }

  capitalizeField(field: keyof VacationEmployee): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof VacationEmployee; value: any }) {
    const { field, value } = event;
    (this.vacationEmployee as any)[field] = value;
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
        this.VacationEmployeeServ.Get(this.DomainName, this.CurrentPage, this.PageSize)
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

}
