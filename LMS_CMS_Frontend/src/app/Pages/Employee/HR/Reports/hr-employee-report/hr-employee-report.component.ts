import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Employee } from '../../../../../Models/Employee/employee';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { Job } from '../../../../../Models/Administrator/job';
import { JobCategories } from '../../../../../Models/Administrator/job-categories';
import { TokenData } from '../../../../../Models/token-data';
import { AccountService } from '../../../../../Services/account.service';
import { ApiService } from '../../../../../Services/api.service';
import { JobCategoriesService } from '../../../../../Services/Employee/Administration/job-categories.service';
import { JobService } from '../../../../../Services/Employee/Administration/job.service';
import { BusTypeService } from '../../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../../Services/Employee/domain.service';
import { EmployeeService } from '../../../../../Services/Employee/employee.service';
import { SalaryReportsService } from '../../../../../Services/Employee/HR/salary-reports.service';
import { DeleteEditPermissionService } from '../../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { MenuService } from '../../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';

@Component({
  selector: 'app-hr-employee-report',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule, PdfPrintComponent],
  templateUrl: './hr-employee-report.component.html',
  styleUrl: './hr-employee-report.component.css'
})
export class HrEmployeeReportComponent {

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
  employees: Employee[] = [];
  jobscat: JobCategories[] = [];
  jobs: Job[] = [];
  SelectedJobId: number = 0
  SelectedJobCatId: number = 0

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
    this.employees = []
    this.EmployeeServ.GetWithJobId(this.SelectedJobId, this.DomainName).subscribe((d) => {
      this.employees = d
    })
  }

  Apply() {
    this.IsShowTabls = true
    this.GetAllData()
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
    this.JobServ.GetByCtegoty(this.SelectedJobCatId, this.DomainName).subscribe((d) => {
      this.jobs = d
    })
  }

}
