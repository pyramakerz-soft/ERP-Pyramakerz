import { Component } from '@angular/core';
import { Employee } from '../../../../Models/Employee/employee';
import { EmployeeClocks } from '../../../../Models/HR/employee-clocks';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { EmployeeClocksService } from '../../../../Services/Employee/HR/employee-clocks.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-clocks',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './employee-clocks.component.html',
  styleUrl: './employee-clocks.component.css',
})
export class EmployeeClocksComponent {
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');

  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  SelectedEmployeeId: number = 0;
  IsShowTabls: boolean = false;
  employees: Employee[] = [];
  TableData: EmployeeClocks[] = [];
  employeeClocks: EmployeeClocks = new EmployeeClocks();
  isLoading = false;
  isLoadingWhenEdit = false;
  year: number = 0;
  month: number = 0;
  validationErrors: { [key in keyof EmployeeClocks]?: string } = {};

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public BusTypeServ: BusTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public EmployeeServ: EmployeeService,
    public EmployeeClocksServ: EmployeeClocksService,
    private languageService: LanguageService, 
    private translate: TranslateService,
    
  ) {}
  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });
    this.getAllEmployee();
    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void { 
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

  getAllEmployee() {
    this.employees = [];
    this.IsShowTabls = false;
    this.EmployeeServ.Get_Employees(this.DomainName).subscribe((d) => {
      this.employees = d;
    });
  }

  formatDateTime(value: string | null): string {
    if (!value) return '';

    const date = new Date(value);

    const tzOffset = date.getTimezoneOffset() * 60000; // offset in ms
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString();

    return localISOTime.slice(0, 16); // "YYYY-MM-DDTHH:mm"
  }

  onTimeChange(row: any, field: string, value: string) {
    if (value) {
      row[field] = value; // keep '2025-10-26T23:02' as-is
    } else {
      row[field] = null;
    }
    if(field == 'clockIn'){
      row.date=value.slice(0,10)
    }
  }

  GetAllData() {
    this.TableData = [];
    if (this.SelectedEmployeeId && this.year && this.month) {
      this.EmployeeClocksServ.Get(this.SelectedEmployeeId,this.year,this.month,this.DomainName).subscribe(
        (data) => {
          this.TableData = data; 
        },
        (error) => {
          if(error.status!=404){
            const errorMessage = error.error?.message || this.translate.instant('Try Again Later');
            this.showErrorAlert(errorMessage);
          }
        }
      );
    }
  }

  Apply() {
    this.IsShowTabls = true;
    this.GetAllData();
  }

  EmployeeChanged() {
    this.IsShowTabls = false;
    this.TableData = [];
  }

  save(): void {
    if (this.isFormValidForCreate()) {
      this.isLoadingWhenEdit = true;
      console.log(this.TableData);
      this.EmployeeClocksServ.Edit(this.TableData, this.DomainName).subscribe(
        (d) => {
          this.isLoadingWhenEdit = false;
          this.GetAllData();
          this.showSuccessAlert(this.translate.instant('Saved Successfully'));
        },
        (error) => { 
          this.isLoadingWhenEdit = false;
          const errorMessage = error.error?.message || this.translate.instant('Try Again Later');
          this.showErrorAlert(errorMessage);
        }
      );
    }
  }

  AddClockIn() {
    if (this.isFormValid()) {
      this.isLoading = true;
      // if (
      //   this.employeeClocks.clockIn &&
      //   this.employeeClocks.clockIn.length === 5
      // ) {
      //   this.employeeClocks.clockIn = this.employeeClocks.clockIn + ':00'; // convert "13:11" -> "13:11:00"
      // }
      // if (
      //   this.employeeClocks.clockOut &&
      //   this.employeeClocks.clockOut.length === 5
      // ) {
      //   this.employeeClocks.clockOut = this.employeeClocks.clockOut + ':00';
      // }
      console.log(this.employeeClocks);
      this.EmployeeClocksServ.Add(
        this.employeeClocks,
        this.DomainName
      ).subscribe(
        (d) => {
          this.isLoading = false;
          this.GetAllData();
          this.closeModal();
          this.showSuccessAlert(this.translate.instant('Saved Successfully'));
        },
        (error) => { 
          this.isLoading = false;
          this.closeModal();
          const errorMessage = error.error?.message || this.translate.instant('Try Again Later');
          this.showErrorAlert(errorMessage);
        }
      );
    }
  }

  closeModal() {
    this.isModalVisible = false;
  }

  openModal() {
    this.employeeClocks = new EmployeeClocks();
    this.validationErrors = {};
    this.isModalVisible = true;
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.employeeClocks) {
      if (this.employeeClocks.hasOwnProperty(key)) {
        const field = key as keyof EmployeeClocks;
        if (!this.employeeClocks[field]) {
          if (field == 'date' || field == 'employeeID' || field == 'clockIn' || field == 'clockOut' ) {
          this.validationErrors[field] = `${this.translate.instant('Field is required')} ${this.translate.instant(field)}`;
          isValid = false;
          }
        }
        if(this.employeeClocks.clockIn){
          this.employeeClocks.date=this.employeeClocks.clockIn.slice(0,10)
        }
      }
    }
    // if (
    //   this.employeeClocks.clockOut &&
    //   this.employeeClocks.clockIn &&
    //   this.employeeClocks.clockOut < this.employeeClocks.clockIn
    // ) {
    //   this.validationErrors['clockOut'] =
    //     'Clock out time cannot be earlier than clock in time.';
    //   isValid = false;
    // }
    return isValid;
  }

  isFormValidForCreate(): boolean {
    let isValid = true;
    // isValid = !this.TableData.some(
    //   (element) =>
    //     element.clockIn &&
    //     element.clockOut
    // );
    return isValid;
  }

  capitalizeField(field: keyof EmployeeClocks): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof EmployeeClocks; value: any }) {
    const { field, value } = event;
    (this.employeeClocks as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  onMonthChange(event: Event) {
    this.IsShowTabls = false;
    this.TableData = [];
    const input = event.target as HTMLInputElement;
    const value = input.value; // e.g. "2025-08"

    if (value) {
      const [year, month] = value.split('-').map(Number);
      this.year = year;
      this.month = month;
    }
  }
}
