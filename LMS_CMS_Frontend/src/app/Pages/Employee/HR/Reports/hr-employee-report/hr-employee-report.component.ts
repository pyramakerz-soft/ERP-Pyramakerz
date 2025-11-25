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
import { LoadingService } from '../../../../../Services/loading.service';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-hr-employee-report',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule, PdfPrintComponent],
  templateUrl: './hr-employee-report.component.html',
  styleUrl: './hr-employee-report.component.css'
})

@InitLoader()
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
  SelectedJobName: string = '';
  SelectedJobCatName: string = '';
  school = {
    reportHeaderOneEn: 'Employees Report',
    reportHeaderOneAr: 'تقرير الموظفين',
  };

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
    private loadingService: LoadingService 
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
    this.SelectedJobName = ''
    this.employees = []
    const selectedCategory = this.jobscat.find(c => c.id == this.SelectedJobCatId);
    this.SelectedJobCatName = selectedCategory ? selectedCategory.name : '';
    this.JobServ.GetByCtegoty(this.SelectedJobCatId, this.DomainName).subscribe((d) => {
      this.jobs = d
    })
  }

  GetJobName() {
    const selectedJob = this.jobs.find(c => c.id == this.SelectedJobId);
    this.SelectedJobName = selectedJob ? selectedJob.name : '';
    console.log(123,this.jobs , this.jobscat)
  }

  DownloadAsPDF() {
    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => this.showPDF = false, 2000);
    }, 500);
  }

  Print() {
    this.showPDF = true;
    setTimeout(() => {
      const printContents = document.getElementById("Data")?.innerHTML;
      if (!printContents) {
        console.error("Element not found!");
        return;
      }

      const printStyle = `
        <style>
          @page { size: auto; margin: 0mm; }
          body { margin: 0; }
          @media print {
            body > *:not(#print-container) {
              display: none !important;
            }
            #print-container {
              display: block !important;
              position: static !important;
              top: auto !important;
              left: auto !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              box-shadow: none !important;
              margin: 0 !important;
            }
          }
        </style>
      `;

      const printContainer = document.createElement('div');
      printContainer.id = 'print-container';
      printContainer.innerHTML = printStyle + printContents;

      document.body.appendChild(printContainer);
      window.print();

      setTimeout(() => {
        document.body.removeChild(printContainer);
        this.showPDF = false;
      }, 100);
    }, 500);
  }

  async DownloadAsExcel() {
    await this.reportsService.generateExcelReport({
      mainHeader: {
        en: "Employees Report",
        ar: "تقرير الموظفين"
      },
      // subHeaders: [
      //   { en: "Detailed payable information", ar: "معلومات تفصيلية عن الدفع" },
      // ],
      infoRows: [
        { key: 'job Category', value: this.SelectedJobCatName || '' },
        { key: 'job', value: this.SelectedJobName || '' }
      ],
      reportImage: '', // Add image URL if available
      filename: "Employees_Report.xlsx",
      tables: [
        {
          // title: "Payable Details",
          headers: ['id', 'en_name', 'ar_name'],
          data: this.employees.map((row) => [
            row.id || 0,
            row.en_name || 0,
            row.ar_name || '',
          ])
        }
      ]
    });
  }

}
