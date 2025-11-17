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
import Swal from 'sweetalert2';

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
  cachedTableDataForPDF: any[] = [];
  infoRows: any[] = [];
  employees: Employee[] = [];
  LoanStatus: LoanStatus[] = [];
  SelectedEmpId: number = 0
  selectedEmployee: Employee | undefined;

  totalLoansAll: number = 0;
  totalDeductedAll: number = 0;
  remainingAll: number = 0;

  // School info for PDF
  school = {
    reportHeaderOneEn: 'Loans Status Report',
    reportHeaderTwoEn: 'Employee Loans Summary',
    reportHeaderOneAr: 'تقرير حالة القروض',
    reportHeaderTwoAr: 'ملخص قروض الموظفين',
    reportImage: 'assets/images/logo.png',
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
    public EmployeeServ: EmployeeService,
    public LoansServ: LoansService,
    private languageService: LanguageService,
    public reportsService: ReportsService,
    private cdr: ChangeDetectorRef, 
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
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  GetAllData() {
    this.LoanStatus = []
    this.LoansServ.GetLoansStatus(this.SelectedEmpId, this.DomainName).subscribe((d) => {
      this.LoanStatus = d
      this.totalLoansAll = this.LoanStatus.reduce((sum, x) => sum + (x.totalLoans || 0), 0);
      this.totalDeductedAll = this.LoanStatus.reduce((sum, x) => sum + (x.totalDeducted || 0), 0);
      this.remainingAll = this.LoanStatus.reduce((sum, x) => sum + (x.remaining || 0), 0);
      
      // Find selected employee
      this.selectedEmployee = this.employees.find(emp => emp.id === this.SelectedEmpId);
      
      // Prepare data for export
      this.prepareExportData();
    })
  }

  Apply() {
    this.IsShowTabls = true
    this.GetAllData()
  }

  getEmployee() {
    this.employees = []
    this.EmployeeServ.Get_Employees(this.DomainName).subscribe((d) => {
      this.employees = d
    })
  }

  // PDF and Print Methods
  private prepareExportData(): void {
    this.cachedTableDataForPDF = [];

    this.LoanStatus.forEach((employeeLoan: any) => {
      // Loans Details Section
      if (employeeLoan.loansDTO && employeeLoan.loansDTO.length > 0) {
        const loansSection = {
          header: `Employee: ${employeeLoan.employeeEnName || employeeLoan.employeeArName} - Loans Details`,
          data: [
            { key: 'Employee', value: employeeLoan.employeeEnName || employeeLoan.employeeArName || '-' },
          ],
          tableHeaders: ['Date', 'Amount', 'Deduction Start Month', 'Number Of Deduction', 'Deduction End Month'],
          tableData: [] as any[],
        };

        employeeLoan.loansDTO.forEach((loan: any) => {
          loansSection.tableData.push({
            Date: loan.date || '-',
            Amount: loan.amount || 0,
            'Deduction Start Month': `${loan.deductionStartMonth || '-'} / ${loan.deductionStartYear || '-'}`,
            'Number Of Deduction': loan.numberOfDeduction || 0,
            'Deduction End Month': `${loan.deductionEndMonth || '-'} / ${loan.deductionEndYear || '-'}`,
          });
        });

        this.cachedTableDataForPDF.push(loansSection);
      }

      // Deductions Details Section
      if (employeeLoan.employeeLoansGetDTO && employeeLoan.employeeLoansGetDTO.length > 0) {
        const deductionsSection = {
          header: `Employee: ${employeeLoan.employeeEnName || employeeLoan.employeeArName} - Monthly Deductions`,
          data: [
            { key: 'Employee', value: employeeLoan.employeeEnName || employeeLoan.employeeArName || '-' },
          ],
          tableHeaders: ['Month', 'Deducted Value'],
          tableData: [] as any[],
        };

        employeeLoan.employeeLoansGetDTO.forEach((deduction: any) => {
          deductionsSection.tableData.push({
            Month: `${deduction.month || '-'} / ${deduction.year || '-'}`,
            'Deducted Value': deduction.amount || 0,
          });
        });

        this.cachedTableDataForPDF.push(deductionsSection);
      }

      // Summary Section
      const summarySection = {
        header: `Employee: ${employeeLoan.employeeEnName || employeeLoan.employeeArName} - Summary`,
        data: [
          { key: 'Employee', value: employeeLoan.employeeEnName || employeeLoan.employeeArName || '-' },
          { key: 'Total Loans', value: employeeLoan.totalLoans || 0 },
          { key: 'Total Deducted', value: employeeLoan.totalDeducted || 0 },
          { key: 'Remaining', value: employeeLoan.remaining || 0 },
        ],
        tableHeaders: [],
        tableData: [],
      };

      this.cachedTableDataForPDF.push(summarySection);
    });

    // Overall Summary
    if (this.LoanStatus.length > 0) {
      const overallSummary = {
        header: 'Overall Summary - All Employees',
        data: [
          { key: 'Total Loans (All)', value: this.totalLoansAll },
          { key: 'Total Deducted (All)', value: this.totalDeductedAll },
          { key: 'Remaining (All)', value: this.remainingAll },
        ],
        tableHeaders: [],
        tableData: [],
      };
      this.cachedTableDataForPDF.push(overallSummary);
    }

    if (this.cachedTableDataForPDF.length === 0) {
      this.cachedTableDataForPDF = [
        {
          header: 'No Loans Data Found',
          data: [],
          tableHeaders: [],
          tableData: [],
        },
      ];
    }
  }

  getEmployeeName(): string {
    if (!this.SelectedEmpId) return 'All Employees';
    return this.selectedEmployee?.en_name || '-';
  }

  getGeneratedDate(): string {
    return new Date().toLocaleDateString();
  }

  getInfoRows(): any[] {
    return [
      {
        keyEn: 'Employee: ' + this.getEmployeeName(),
        keyAr: 'الموظف: ' + this.getEmployeeName(),
      },
      {
        keyEn: 'Generated On: ' + this.getGeneratedDate(),
        keyAr: 'تم الإنشاء في: ' + this.getGeneratedDate(),
      },
    ];
  }

  Print() {
    if (this.cachedTableDataForPDF.length === 0) {
      Swal.fire('Warning', 'No data to print!', 'warning');
      return;
    }

    this.showPDF = true;
    setTimeout(() => {
      const printContents = document.getElementById('Data')?.innerHTML;
      if (!printContents) {
        console.error('Element not found!');
        return;
      }

      const printStyle = `
        <style>
          @page { size: auto; margin: 0mm; }
          body { margin: 0; }
          @media print {
            body > *:not(#print-container) { display: none !important; }
            #print-container {
              display: block !important;
              position: static !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
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

  DownloadAsPDF() {
    if (this.cachedTableDataForPDF.length === 0) {
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }

    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }

  async exportExcel() {
    if (this.LoanStatus.length === 0) {
      Swal.fire({
        title: 'Warning',
        text: 'No data to export!',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      // Prepare tables data
      const tables: any[] = [];

      // Process each employee's loan data
      this.LoanStatus.forEach((employeeLoan: any) => {
        // Loans Details Table
        if (employeeLoan.loansDTO && employeeLoan.loansDTO.length > 0) {
          const loansData: any[][] = [];
          
          employeeLoan.loansDTO.forEach((loan: any) => {
            loansData.push([
              loan.date || '-',
              loan.amount || 0,
              `${loan.deductionStartMonth || '-'} / ${loan.deductionStartYear || '-'}`,
              loan.numberOfDeduction || 0,
              `${loan.deductionEndMonth || '-'} / ${loan.deductionEndYear || '-'}`,
            ]);
          });

          tables.push({
            title: `${employeeLoan.employeeEnName || employeeLoan.employeeArName} - Loans Details`,
            headers: ['Date', 'Amount', 'Deduction Start Month', 'Number Of Deduction', 'Deduction End Month'],
            data: loansData
          });
        }

        // Deductions Details Table
        if (employeeLoan.employeeLoansGetDTO && employeeLoan.employeeLoansGetDTO.length > 0) {
          const deductionsData: any[][] = [];
          
          employeeLoan.employeeLoansGetDTO.forEach((deduction: any) => {
            deductionsData.push([
              `${deduction.month || '-'} / ${deduction.year || '-'}`,
              deduction.amount || 0,
            ]);
          });

          tables.push({
            title: `${employeeLoan.employeeEnName || employeeLoan.employeeArName} - Monthly Deductions`,
            headers: ['Month', 'Deducted Value'],
            data: deductionsData
          });
        }

        // Employee Summary
        tables.push({
          title: `${employeeLoan.employeeEnName || employeeLoan.employeeArName} - Summary`,
          headers: ['Metric', 'Value'],
          data: [
            ['Total Loans', employeeLoan.totalLoans || 0],
            ['Total Deducted', employeeLoan.totalDeducted || 0],
            ['Remaining', employeeLoan.remaining || 0],
          ]
        });
      });

      // Overall Summary Table
      tables.push({
        title: 'Overall Summary - All Employees',
        headers: ['Metric', 'Value'],
        data: [
          ['Total Loans (All)', this.totalLoansAll],
          ['Total Deducted (All)', this.totalDeductedAll],
          ['Remaining (All)', this.remainingAll],
        ]
      });

      // Prepare info rows
      const infoRows = [
        { key: 'Employee', value: this.getEmployeeName() },
        { key: 'Generated On', value: new Date().toLocaleDateString() }
      ];

      // Generate Excel using ReportsService
      await this.reportsService.generateExcelReport({
        mainHeader: {
          en: 'LOANS STATUS REPORT',
          ar: 'تقرير حالة القروض'
        },
        infoRows: infoRows,
        tables: tables,
        filename: `Loans_Status_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      });

    } catch (error) {
      console.error('Error generating Excel report:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to generate Excel report',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }
}