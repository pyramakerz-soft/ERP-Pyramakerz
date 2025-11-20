import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { Job } from '../../../../../Models/Administrator/job';
import { JobCategories } from '../../../../../Models/Administrator/job-categories';
import { Employee } from '../../../../../Models/Employee/employee';
import { MonthlyAttendance } from '../../../../../Models/HR/monthly-attendance';
import { SalaryHistory } from '../../../../../Models/HR/salary-history';
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
  selector: 'app-attendance-report',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule, PdfPrintComponent],
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.css'
})

@InitLoader()
export class AttendanceReportComponent {

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
  SelectedJobName: string = '';
  SelectedJobCatName: string = '';
  SelectedEmpName: string = '';
  school = {
    reportHeaderOneEn: 'Attendance Report',
    reportHeaderOneAr: ' تقرير الحضور '
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
    this.monthlyAttendenc = []
    this.SalaryReportsServ.GetAttendance(this.DomainName, this.month, this.year, this.SelectedEmpId).subscribe((d) => {
      this.monthlyAttendenc = d
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
    const selectedCategory = this.jobscat.find(c => c.id == this.SelectedJobCatId);
    this.SelectedJobCatName = selectedCategory ? selectedCategory.name : '';
    this.JobServ.GetByCtegoty(this.SelectedJobCatId, this.DomainName).subscribe((d) => {
      this.jobs = d
    })
  }

  getEmployeeByJops() {
    this.employees = []
    this.SelectedEmpId = 0
    const selectedJob = this.jobs.find(c => c.id == this.SelectedJobId);
    this.SelectedJobName = selectedJob ? selectedJob.name : '';
    this.EmployeeServ.GetWithJobId(this.SelectedJobId, this.DomainName).subscribe((d) => {
      this.employees = d
    })
  }

  GetEmployeeName() {
    const selectedEmp = this.employees.find(c => c.id == this.SelectedEmpId);
    this.SelectedEmpName = selectedEmp ? selectedEmp.en_name : '';
  }

  async DownloadAsPDF() {
    await this.getPDFData();
    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => this.showPDF = false, 2000);
    }, 500);
  }

  async getPDFData() {
    // Build rows for each subject
    this.tableDataForPDF = this.monthlyAttendenc.map(d => {
      const row: Record<string, string> = {};
      row['Day'] = d.day;
      row['Day Status'] = d.dayStatusName;
      row['Total Working Hours'] = d.workingHours + ':' + d.workingMinutes;
      row['Leave Request in Hours'] =  d.leaveRequestHours + ':' + d.leaveRequestMinutes;
      row['Overtime in Hours'] =   d.overtimeHours + ':' + d.overtimeMinutes ;
      row['Deduction in Hours'] = d.deductionHours + ':' + d.deductionMinutes;
      return row;
    });

    console.log('Prepared PDF data:', this.tableDataForPDF);
  }

  async Print() {
    await this.getPDFData();
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
        en: "Attendance Report",
        ar: "تقرير الحضور" 
      },
      // subHeaders: [
      //   { en: "Detailed payable information", ar: "معلومات تفصيلية عن الدفع" },
      // ],
      infoRows: [
        { key: 'Month', value: this.month + "/" + this.year || '' },
        { key: 'job Category', value: this.SelectedJobCatName || 'All Job Categories' },
        { key: 'job', value: this.SelectedJobName || 'All Jobs' },
        { key: 'Employee', value: this.SelectedEmpName || 'All Employees' }
      ],
      reportImage: '', // Add image URL if available
      filename: "Attendance_Report.xlsx",
      tables: [
        {
          // title: "Payable Details",
          headers: ['Day', 'Day Status', 'Total Working Hours', 'Leave Request in Hours', 'Overtime in Hours', 'Deduction in Hours'],
          data: this.monthlyAttendenc.map((row) => [
            row.day || 0,
            row.dayStatusName || '',
            row.workingHours + ':' + row.workingMinutes || '',
            row.leaveRequestHours + ':' + row.leaveRequestMinutes || '',
            row.overtimeHours + ':' + row.overtimeMinutes || '',
            row.deductionHours + ':' + row.deductionMinutes || '',
          ])
        }
      ]
    });
  }

  
  getJobCategoryName(): string {
    return this.jobscat.find(jc => jc.id == this.SelectedJobCatId)?.name || 
           'All Job Categories';
  }

  getJobName(): string {
    return this.jobs.find(j => j.id == this.SelectedJobId)?.name || 
           'All Jobs';
  }

  getEmployeeName(): string {
    return this.employees.find(e => e.id == this.SelectedEmpId)?.en_name || 
           this.employees.find(e => e.id == this.SelectedEmpId)?.ar_name || 
           'All Employees';
  }

  getArEmployeeName(): string {
    return this.employees.find(e => e.id == this.SelectedEmpId)?.ar_name || 
           this.employees.find(e => e.id == this.SelectedEmpId)?.en_name || 
           'All Employees';
  }


  getTotal(fieldHours: keyof MonthlyAttendance, fieldMinutes: keyof MonthlyAttendance): string {
  let totalMinutes = this.monthlyAttendenc.reduce((acc, row) => {
    const hours = Number(row[fieldHours]) || 0;
    const minutes = Number(row[fieldMinutes]) || 0;
    return acc + (hours * 60 + minutes);
  }, 0);

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return `${totalHours} : ${remainingMinutes.toString().padStart(2, '0')}`;
 }
}
