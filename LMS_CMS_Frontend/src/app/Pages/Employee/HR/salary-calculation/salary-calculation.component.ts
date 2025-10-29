import { Component } from '@angular/core';
import { Employee } from '../../../../Models/Employee/employee';
import { SalaryCalculationService } from '../../../../Services/Employee/HR/salary-calculation.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';

@Component({
  selector: 'app-salary-calculation',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './salary-calculation.component.html',
  styleUrl: './salary-calculation.component.css'
})
export class SalaryCalculationComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';
  progress = 0;
  progressText = "Calculating...";
  isLoading = false;
  employees: Employee[] = [];
  month: number = 0
  year: number = 0
  SelectedEmpId: number = 0
  selectedMonth: string = ''; // will store YYYY-MM

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private languageService: LanguageService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    private translate: TranslateService,
    public ApiServ: ApiService,
    public SalaryCalculationServ: SalaryCalculationService,
    public EmployeeServ: EmployeeService,
    private realTimeService: RealTimeNotificationServiceService,
  ) { }
  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
    this.getAllEmployee()
  }

  getAllEmployee() {
    this.EmployeeServ.Get_Employees(this.DomainName).subscribe((d) => {
      this.employees = d
    })
  }

  calculateSalary() {
    this.isLoading = true;
    this.progress = 0;
    this.progressText = "Calculating...";

    // simulate progress updates
    const interval = setInterval(() => {
      if (this.progress < 90) {
        this.progress += 10;
        if (this.progress < 70) {
          this.progressText = "Calculating...";
        } else if (this.progress < 90) {
          this.progressText = "Finishing up...";
        }
      }
    }, 500);

    this.SalaryCalculationServ.SalaryCalculation(this.DomainName, this.month, this.year ,this.SelectedEmpId).subscribe({
      next: (res) => {
        clearInterval(interval);
        this.progress = 100;
        this.progressText = "Done!";
        setTimeout(() => {
          this.isLoading = false; // hide bar after done
        }, 1500);
      },
      error: (err) => {
        console.log(err)
        clearInterval(interval);
        this.progressText = "Error!";
        this.progress = 100;
        setTimeout(() => {
          this.isLoading = false;
        }, 2000);
      }
    });
  }

  onDateChange() {
    if (this.selectedMonth) {
      const parts = this.selectedMonth.split('-'); // format is "YYYY-MM"
      this.year = +parts[0];
      this.month = +parts[1];
      console.log("Selected:", this.month, this.year);
    }
  }

}
