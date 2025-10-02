import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PdfPrintComponent } from '../../../../Component/pdf-print/pdf-print.component';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { ReportsService } from '../../../../Services/shared/reports.service';
import { Employee } from '../../../../Models/Employee/employee';
import { JobCategories } from '../../../../Models/Administrator/job-categories';
import { Job } from '../../../../Models/Administrator/job';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { JobService } from '../../../../Services/Employee/Administration/job.service';
import { JobCategoriesService } from '../../../../Services/Employee/Administration/job-categories.service';
import { MonthlyAttendance } from '../../../../Models/HR/monthly-attendance';
import { SalaryHistory } from '../../../../Models/HR/salary-history';
import { SalaryCalculationService } from '../../../../Services/Employee/HR/salary-calculation.service';
import { SalaryReportsService } from '../../../../Services/Employee/HR/salary-reports.service';

@Component({
  selector: 'app-employee-salary-detailed',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule, PdfPrintComponent],
  templateUrl: './employee-salary-detailed.component.html',
  styleUrl: './employee-salary-detailed.component.css'
})
export class EmployeeSalaryDetailedComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';

  IsShowTabls: boolean = false
  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  showPDF = false;
  tableHeadersForPDF: any[] = [];
  tableDataForPDF: any[] = [];
  infoRows: any[] = [];
  monthlyAttendenc: MonthlyAttendance[] = [];
  salaryHistory: SalaryHistory = new SalaryHistory();
  employees: Employee[] = [];
  jobscat: JobCategories[] = [];
  jobs: Job[] = [];
  month: number = 0
  year: number = 0
  SelectedEmpId: number = 0
  SelectedJobId: number = 0
  SelectedJobCatId: number = 0
  selectedMonth: string = '';

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public BusTypeServ: BusTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public SalaryReportsServ: SalaryReportsService,
    public EmployeeServ: EmployeeService,
    public JobServ: JobService,
    public JobCategoriesServ: JobCategoriesService,
    private languageService: LanguageService,
    public reportsService: ReportsService,
    private cdr: ChangeDetectorRef,
    private realTimeService: RealTimeNotificationServiceService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
    this.getJobsCategory()
  }

  ngOnDestroy(): void {
    this.realTimeService.stopConnection();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  GetAllData() {
    this.monthlyAttendenc = []
      this.salaryHistory = new SalaryHistory()

    this.SalaryReportsServ.GetEmployeeSalaryDetailed(this.DomainName, this.month, this.year, this.SelectedEmpId).subscribe((d) => {
      this.monthlyAttendenc = d.monthlyAttendance
      this.salaryHistory = d.salaryHistory
    })
  }

  Apply() {
    this.IsShowTabls = true
    this.GetAllData()
  }

  onDateChange() {
    if (this.selectedMonth) {
      const parts = this.selectedMonth.split('-'); // format is "YYYY-MM"
      this.year = +parts[0];
      this.month = +parts[1];
      console.log("Selected:", this.month, this.year);
    }
  }

  getJobsCategory() {
    this.JobCategoriesServ.Get(this.DomainName).subscribe((d) => {
      this.jobscat = d
    })
  }

  getJobsByCategory() {
    this.jobs = []
    this.SelectedJobId = 0
    this.employees = []
    this.SelectedEmpId = 0
    this.JobServ.GetByCtegoty(this.SelectedJobCatId, this.DomainName).subscribe((d) => {
      this.jobs = d
    })
  }

  getEmployeeByJops() {
    this.employees = []
    this.SelectedEmpId = 0
    this.EmployeeServ.GetWithJobId(this.SelectedJobId, this.DomainName).subscribe((d) => {
      this.employees = d
    })
  }
}
