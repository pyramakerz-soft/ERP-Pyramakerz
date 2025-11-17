import { Component } from '@angular/core';
import { Deduction } from '../../../../Models/HR/deduction';
import { DeductionType } from '../../../../Models/HR/deduction-type';
import { DeductionTypeService } from '../../../../Services/Employee/HR/deduction-type.service';
import { DeductionService } from '../../../../Services/Employee/HR/deduction.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { Employee } from '../../../../Models/Employee/employee';
import { Bonus } from '../../../../Models/HR/bonus';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-deduction',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './deduction.component.html',
  styleUrl: './deduction.component.css'
})

@InitLoader()
export class DeductionComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  TableData: Deduction[] = [];
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'employeeEnName' ,'deductionTypeName'];

  deduction: Deduction = new Deduction();

  validationErrors: { [key in keyof Deduction]?: string } = {};
  isLoading = false;

  employees: Employee[] = [];
  SelectedEmployee: Employee= new Employee();
  deductionType: DeductionType[] = [];
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
    public DeductionServ: DeductionService,
    public DeductionTypeServ: DeductionTypeService,
    private translate: TranslateService,
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
    this.DeductionServ.Get(DomainName, pageNumber, pageSize).subscribe(
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
    this.deduction = new Deduction();
    this.validationErrors = {};
    this.openModal();
  }

  Delete(id: number) {
    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('Deduction') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.DeductionServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize)
        });
      }
    });
  }

  Edit(id: number) {
    this.mode = 'Edit';
    this.DeductionServ.GetByID(id, this.DomainName).subscribe((d) => {
      this.deduction = d;
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
      console.log(this.deduction)
      if (this.mode == 'Create') {
        this.DeductionServ.Add(this.deduction, this.DomainName).subscribe(
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
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' }
            });
          }
        );
      }
      if (this.mode == 'Edit') {
        this.DeductionServ.Edit(this.deduction, this.DomainName).subscribe(
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
            console.log(error)
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
    this.getAllTypes()
  }

  getAllEmployees() {
    this.EmployeeServ.Get_Employees(this.DomainName).subscribe((d) => {
      this.employees = d
    })
  }

  getAllTypes() {
    this.DeductionTypeServ.Get(this.DomainName).subscribe((d) => {
      this.deductionType = d
    })
  }

  validateNumber(event: any, field: keyof Deduction): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.deduction[field] === 'string') {
        this.deduction[field] = 0 as never;
      }
    }
    if (field == 'minutes') {
      if (this.deduction.minutes &&this.deduction.minutes > 60) {
        this.deduction.minutes = 0
      }
    }
  }

isFormValid(): boolean {
  this.SelectedEmployee = this.employees.find(e => e.id == this.deduction.employeeID) || new Employee();
  
  let isValid = true;
  
  // Basic field validation
  for (const key in this.deduction) {
    if (this.deduction.hasOwnProperty(key)) {
      const field = key as keyof Deduction;
      if (!this.deduction[field]) {
        if (
          field == 'date' ||
          field == 'deductionTypeID' ||
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

  // Business logic validations
  if (this.SelectedEmployee.hasAttendance != true && (this.deduction.deductionTypeID == 1 || this.deduction.deductionTypeID == 2)) {
    isValid = false;
    this.validationErrors['deductionTypeID'] = this.translate.instant('This Employee Has No Attendance so should take deduction by amount only');
  }

  if (this.deduction.deductionTypeID == 3 && (this.deduction.amount == 0 || this.deduction.amount == null)) {
    isValid = false;
    this.validationErrors['amount'] = this.getRequiredErrorMessage('amount');
  }

  if (this.deduction.deductionTypeID == 2 && (this.deduction.numberOfDeductionDays == 0 || this.deduction.numberOfDeductionDays == null)) {
    isValid = false;
    this.validationErrors['numberOfDeductionDays'] = this.getRequiredErrorMessage('numberOfDeductionDays');
  }

  if (this.deduction.deductionTypeID == 1 && (this.deduction.minutes == 0 || this.deduction.minutes == null) &&(this.deduction.hours == 0 || this.deduction.hours == null)) {
    isValid = false;
    this.validationErrors['hours'] = this.getRequiredErrorMessage('hours');
  }

  return isValid;
}

  capitalizeField(field: keyof Deduction): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof Deduction; value: any }) {
    const { field, value } = event;
    (this.deduction as any)[field] = value;
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
        this.DeductionServ.Get(this.DomainName, this.CurrentPage, this.PageSize)
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

getDeductionDisplayValue(deduction: any): string {
  if (!deduction) return '-';
  
  const deductionTypeID = deduction.deductionTypeID;
  
  switch (deductionTypeID) {
    case 1: // Hours
      const hours = deduction.hours || 0;
      const minutes = deduction.minutes || 0;
      // Format hours and minutes with leading zeros
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      return `${formattedHours}:H ${formattedMinutes}:M`;
      
    case 2: // Day
      const days = deduction.numberOfDeductionDays || 0;
      return days == 1 ? '1 day' : `${days} days`;
      
    case 3: // Amount
      const amount = deduction.amount || 0;
      return `${amount}`;
      
    default:
      return '-';
  }
}
}
