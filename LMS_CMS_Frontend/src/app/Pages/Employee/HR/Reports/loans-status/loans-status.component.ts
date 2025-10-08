import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { LoansService } from '../../../../../Services/Employee/HR/loans.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { Employee } from '../../../../../Models/Employee/employee';
import { TokenData } from '../../../../../Models/token-data';
import { AccountService } from '../../../../../Services/account.service';
import { ApiService } from '../../../../../Services/api.service';
import { BusTypeService } from '../../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../../Services/Employee/domain.service';
import { EmployeeService } from '../../../../../Services/Employee/employee.service';
import { DeleteEditPermissionService } from '../../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { MenuService } from '../../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { LoanStatus } from '../../../../../Models/HR/loan-status';

@Component({
  selector: 'app-loans-status',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule, PdfPrintComponent],
  templateUrl: './loans-status.component.html',
  styleUrl: './loans-status.component.css'
})
export class LoansStatusComponent {

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
  LoanStatus: LoanStatus[] = [];
  SelectedEmpId: number = 0

  totalLoansAll: number = 0;
  totalDeductedAll: number = 0;
  remainingAll: number = 0;

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
    public LoansServ: LoansService,
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
    this.getEmployee()
  }

  ngOnDestroy(): void {
    this.realTimeService.stopConnection();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  GetAllData() {
    this.LoanStatus = []
    this.LoansServ.GetLoansStatus(this.SelectedEmpId ,this.DomainName,).subscribe((d) => {
      this.LoanStatus = d
      this.totalLoansAll = this.LoanStatus.reduce((sum, x) => sum + (x.totalLoans || 0), 0);
      this.totalDeductedAll = this.LoanStatus.reduce((sum, x) => sum + (x.totalDeducted || 0), 0);
      this.remainingAll = this.LoanStatus.reduce((sum, x) => sum + (x.remaining || 0), 0);
      console.log(123,d)
    })
  }

  Apply() {
    this.IsShowTabls = true
    this.GetAllData()
  }

  getEmployee() {
    this.employees = []
    this.EmployeeServ.Get_Employees( this.DomainName).subscribe((d) => {
      this.employees = d
    })
  }

  // async DownloadAsPDF() {
  //   await this.getPDFData();
  //   this.showPDF = true;
  //   setTimeout(() => {
  //     this.pdfComponentRef.downloadPDF();
  //     setTimeout(() => this.showPDF = false, 2000);
  //   }, 500);
  // }

  // async getPDFData() {
  //   // Build rows for each subject
  //   this.tableDataForPDF = this.monthlyAttendenc.map(d => {
  //     const row: Record<string, string> = {};
  //     row['Day'] = d.day;
  //     row['Day Status'] = d.dayStatusName;
  //     row['Total Working Hours'] = d.workingHours + ':' + d.workingMinutes;
  //     row['Leave Request in Hours'] =  d.leaveRequestHours + ':' + d.leaveRequestMinutes;
  //     row['Overtime in Hours'] =   d.overtimeHours + ':' + d.overtimeMinutes ;
  //     row['Deduction in Hours'] = d.deductionHours + ':' + d.deductionMinutes;
  //     return row;
  //   });

  //   console.log('Prepared PDF data:', this.tableDataForPDF);
  // }

  // async Print() {
  //   await this.getPDFData();
  //   this.showPDF = true;
  //   setTimeout(() => {
  //     const printContents = document.getElementById("Data")?.innerHTML;
  //     if (!printContents) {
  //       console.error("Element not found!");
  //       return;
  //     }

  //     const printStyle = `
  //       <style>
  //         @page { size: auto; margin: 0mm; }
  //         body { margin: 0; }
  //         @media print {
  //           body > *:not(#print-container) {
  //             display: none !important;
  //           }
  //           #print-container {
  //             display: block !important;
  //             position: static !important;
  //             top: auto !important;
  //             left: auto !important;
  //             width: 100% !important;
  //             height: auto !important;
  //             background: white !important;
  //             box-shadow: none !important;
  //             margin: 0 !important;
  //           }
  //         }
  //       </style>
  //     `;

  //     const printContainer = document.createElement('div');
  //     printContainer.id = 'print-container';
  //     printContainer.innerHTML = printStyle + printContents;

  //     document.body.appendChild(printContainer);
  //     window.print();

  //     setTimeout(() => {
  //       document.body.removeChild(printContainer);
  //       this.showPDF = false;
  //     }, 100);
  //   }, 500);
  // }

  // async DownloadAsExcel() {
  //   await this.reportsService.generateExcelReport({
  //     mainHeader: {
  //       en: "Salary Summary Report",
  //       ar: "تقرير الموظفين"
  //     },
  //     // subHeaders: [
  //     //   { en: "Detailed payable information", ar: "معلومات تفصيلية عن الدفع" },
  //     // ],
  //     infoRows: [
  //       { key: 'Month', value: this.month + "/" + this.year || '' },
  //       { key: 'job Category', value: this.SelectedJobCatName || 'All Job Categories' },
  //       { key: 'job', value: this.SelectedJobName || 'All Jobs' },
  //       { key: 'Employee', value: this.SelectedEmpName || 'All Employees' }
  //     ],
  //     reportImage: '', // Add image URL if available
  //     filename: "Salary_Summary_Report.xlsx",
  //     tables: [
  //       {
  //         // title: "Payable Details",
  //         headers: ['Day', 'Day Status', 'Total Working Hours', 'Leave Request in Hours', 'Overtime in Hours', 'Deduction in Hours'],
  //         data: this.monthlyAttendenc.map((row) => [
  //           row.day || 0,
  //           row.dayStatusName || '',
  //           row.workingHours + ':' + row.workingMinutes || '',
  //           row.leaveRequestHours + ':' + row.leaveRequestMinutes || '',
  //           row.overtimeHours + ':' + row.overtimeMinutes || '',
  //           row.deductionHours + ':' + row.deductionMinutes || '',
  //         ])
  //       }
  //     ]
  //   });
  // }

//   getTotal(fieldHours: keyof MonthlyAttendance, fieldMinutes: keyof MonthlyAttendance): string {
//   let totalMinutes = this.monthlyAttendenc.reduce((acc, row) => {
//     const hours = Number(row[fieldHours]) || 0;
//     const minutes = Number(row[fieldMinutes]) || 0;
//     return acc + (hours * 60 + minutes);
//   }, 0);

//   const totalHours = Math.floor(totalMinutes / 60);
//   const remainingMinutes = totalMinutes % 60;

//   return `${totalHours} : ${remainingMinutes.toString().padStart(2, '0')}`;
//  }
}
