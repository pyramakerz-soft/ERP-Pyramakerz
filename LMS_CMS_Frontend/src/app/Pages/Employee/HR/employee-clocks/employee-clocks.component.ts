import { Component } from '@angular/core';
import { Employee } from '../../../../Models/Employee/employee';
import { EmployeeClocks } from '../../../../Models/HR/employee-clocks';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { EmployeeClocksService } from '../../../../Services/Employee/HR/employee-clocks.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
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

@Component({
  selector: 'app-employee-clocks',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './employee-clocks.component.html',
  styleUrl: './employee-clocks.component.css',
})
export class EmployeeClocksComponent {
  User_Data_After_Login: TokenData = new TokenData(
    '',
    0,
    0,
    0,
    0,
    '',
    '',
    '',
    '',
    ''
  );

  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';

  IsShowTabls: boolean = false;
  employees: Employee[] = [];
  TableData: EmployeeClocks[] = [];
  employeeClocks: EmployeeClocks = new EmployeeClocks();
  isLoading = false;
  year: number = 0;
  month: number = 0;

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
    private realTimeService: RealTimeNotificationServiceService
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
    this.realTimeService.stopConnection();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getAllEmployee() {
    this.employees = [];
    this.IsShowTabls = false;
    this.EmployeeServ.Get_Employees(this.DomainName).subscribe((d) => {
      this.employees = d;
    });
  }

  formatTime(value: string): string {
    if (!value) return '';
    // Take only HH:mm:ss part
    return value.split('.')[0];
  }
  
  GetAllData() {
    this.TableData = [];
    this.EmployeeClocksServ.Get(
      this.employeeClocks.employeeID,
      this.year,
      this.month,
      this.DomainName
    ).subscribe(
      (data) => {
        this.TableData = data;
        console.log(this.TableData);
      },
      (error) => {}
    );
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
    if (this.isFormValid()) {
    }
  }

  isFormValid(): boolean {
    let isValid = true;

    return isValid;
  }

  onMonthChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value; // e.g. "2025-08"

    if (value) {
      const [year, month] = value.split('-').map(Number);
      this.year = year;
      this.month = month;
    }
  }
}
