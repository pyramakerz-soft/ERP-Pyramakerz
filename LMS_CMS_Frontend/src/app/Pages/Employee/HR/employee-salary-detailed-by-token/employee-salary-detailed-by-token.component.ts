import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PdfPrintComponent } from '../../../../Component/pdf-print/pdf-print.component';
import { Job } from '../../../../Models/Administrator/job';
import { JobCategories } from '../../../../Models/Administrator/job-categories';
import { Employee } from '../../../../Models/Employee/employee';
import { MonthlyAttendance } from '../../../../Models/HR/monthly-attendance';
import { SalaryHistory } from '../../../../Models/HR/salary-history';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { JobCategoriesService } from '../../../../Services/Employee/Administration/job-categories.service';
import { JobService } from '../../../../Services/Employee/Administration/job.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { SalaryReportsService } from '../../../../Services/Employee/HR/salary-reports.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { ReportsService } from '../../../../Services/shared/reports.service';

@Component({
  selector: 'app-employee-salary-detailed-by-token',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule, PdfPrintComponent],
  templateUrl: './employee-salary-detailed-by-token.component.html',
  styleUrl: './employee-salary-detailed-by-token.component.css'
})
export class EmployeeSalaryDetailedByTokenComponent {

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
  month: number = 0
  year: number = 0
  selectedMonth: string = '';
  SelectedEmpName: string = '';

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

    this.SalaryReportsServ.GetEmployeeSalaryDetailedByToken(this.DomainName, this.month, this.year).subscribe((d) => {
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

  GetEmployeeName(){
    this.EmployeeServ.Get_Employee_By_ID(this.UserID,this.DomainName).subscribe((d)=>{
      this.SelectedEmpName=d.en_name
    })
  }

  async DownloadAsPDF() {
    await this.GetEmployeeName();
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
      row['Leave Request in Hours'] = d.leaveRequestHours + ':' + d.leaveRequestMinutes;
      row['Overtime in Hours'] = d.overtimeHours + ':' + d.overtimeMinutes;
      row['Deduction in Hours'] = d.deductionHours + ':' + d.deductionMinutes;
      return row;
    });

    console.log('Prepared PDF data:', this.tableDataForPDF);
  }

  async Print() {
    await this.GetEmployeeName();
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
    await this.GetEmployeeName();
    await this.reportsService.generateExcelReport({
      mainHeader: {
        en: "Salary Summary Report",
        ar: "تقرير الموظفين"
      },
      // subHeaders: [
      //   { en: "Detailed payable information", ar: "معلومات تفصيلية عن الدفع" },
      // ],
      infoRows: [
        { key: 'Month', value: this.month + "/" + this.year || '' },
        { key: 'Employee', value: this.SelectedEmpName || 'All Employees' },
        { key: 'Salary', value: this.salaryHistory.basicSalary || '' },
        { key: 'Total Bonus', value: this.salaryHistory.totalBonus || '' },
        { key: 'Total Overtime', value: this.salaryHistory.totalOvertime || '' },
        { key: 'Total Loans', value: this.salaryHistory.totalLoans || '' },
        { key: 'Total Deduction', value: this.salaryHistory.totalDeductions || '' },
        { key: 'Final Salary', value: this.salaryHistory.netSalary || '' }
      ],
      reportImage: '', // Add image URL if available
      filename: "Salary_Summary_Report.xlsx",
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

}
