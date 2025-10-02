import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { ApiService } from '../../../../../Services/api.service';
import { JobCategoriesService } from '../../../../../Services/Employee/Administration/job-categories.service';
import { JobService } from '../../../../../Services/Employee/Administration/job.service';
import { EmployeeService } from '../../../../../Services/Employee/employee.service';
import { VacationEmployeeService } from '../../../../../Services/Employee/HR/vacation-employee.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';

@Component({
  selector: 'app-vacation-employee-report',
  standalone: true,
 imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],  templateUrl: './vacation-employee-report.component.html',
  styleUrl: './vacation-employee-report.component.css'
})
export class VacationEmployeeReportComponent implements OnInit {
  selectedJobCategoryId: number = 0;
  selectedJobId: number = 0;
  selectedEmployeeId: number = 0;
  dateFrom: string = '';
  dateTo: string = '';

  jobCategories: any[] = [];
  jobs: any[] = [];
  employees: any[] = [];

  vacationEmployeeReports: any[] = [];
  showTable: boolean = false;
  isLoading: boolean = false;
  showViewReportBtn: boolean = false;
  isExporting: boolean = false;
  reportsForExcel: any[] = [];

  isRtl: boolean = false;
  subscription!: Subscription;

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  showPDF = false;
  reportsForExport: any[] = [];
  school = {
    reportHeaderOneEn: 'Vacation Employee Report',
    reportHeaderTwoEn: 'Employee Vacation Records',
    reportHeaderOneAr: 'تقرير اجازات الموظفين',
    reportHeaderTwoAr: 'سجلات اجازات الموظفين'
  };

  constructor(
    private vacationEmployeeService: VacationEmployeeService,
    private jobCategoriesService: JobCategoriesService,
    private jobService: JobService,
    private employeeService: EmployeeService,
    private apiService: ApiService,
    private languageService: LanguageService,
    private reportsService: ReportsService
  ) {}

  ngOnInit() {
    this.loadJobCategories();
    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async loadJobCategories() {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(this.jobCategoriesService.Get(domainName));
      this.jobCategories = data;
    } catch (error) {
      console.error('Error loading job categories:', error);
    }
  }

  async loadJobs() {
    if (this.selectedJobCategoryId) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.jobService.GetByCtegoty(this.selectedJobCategoryId, domainName)
        );
        this.jobs = data;
        this.selectedJobId = 0;
        this.employees = [];
        this.selectedEmployeeId = 0;
        this.onFilterChange();
      } catch (error) {
        console.error('Error loading jobs:', error);
      }
    } else {
      this.jobs = [];
      this.selectedJobId = 0;
      this.employees = [];
      this.selectedEmployeeId = 0;
      this.onFilterChange();
    }
  }

  async loadEmployees() {
    if (this.selectedJobId) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.employeeService.GetWithJobId(this.selectedJobId, domainName)
        );
        this.employees = data;
        this.selectedEmployeeId = 0;
        this.onFilterChange();
      } catch (error) {
        console.error('Error loading employees:', error);
        this.employees = [];
        this.selectedEmployeeId = 0;
        this.onFilterChange();
      }
    } else {
      this.employees = [];
      this.selectedEmployeeId = 0;
      this.onFilterChange();
    }
  }

  onFilterChange() {
    this.showTable = false;
    this.showViewReportBtn = !!this.dateFrom && !!this.dateTo;
    this.vacationEmployeeReports = [];
  }

async viewReport() {
  if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
    Swal.fire({
      title: 'Invalid Date Range',
      text: 'Start date cannot be later than end date.',
      icon: 'warning',
      confirmButtonText: 'OK',
    });
    return;
  }

  if (!this.dateFrom || !this.dateTo) {
    Swal.fire({
      title: 'Incomplete Selection',
      text: 'Please select both Date From and Date To to generate the report.',
      icon: 'warning',
      confirmButtonText: 'OK',
    });
    return;
  }

  this.isLoading = true;
  this.showTable = false;

  try {
    const domainName = this.apiService.GetHeader();
    
    // Create parameters object with only non-zero values
    const params: any = {
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    };

    // Only add optional parameters if they have meaningful values
    if (this.selectedEmployeeId && this.selectedEmployeeId !== 0) {
      params.employeeId = this.selectedEmployeeId;
    }
    if (this.selectedJobId && this.selectedJobId !== 0) {
      params.jobId = this.selectedJobId;
    }
    if (this.selectedJobCategoryId && this.selectedJobCategoryId !== 0) {
      params.categoryId = this.selectedJobCategoryId;
    }

    console.log('Sending parameters:', params);

    const response = await firstValueFrom(
      this.vacationEmployeeService.GetVacationReport(
        params.categoryId,    // Will be undefined if not provided
        params.jobId,         // Will be undefined if not provided  
        params.employeeId,    // Will be undefined if not provided
        params.dateFrom,      // Always provided (mandatory)
        params.dateTo,        // Always provided (mandatory)
        domainName
      )
    );

    console.log('API Response:', response);
    
    if (Array.isArray(response)) {
      this.vacationEmployeeReports = response;
      console.log('Leave request reports loaded:', this.vacationEmployeeReports.length);
    } else {
      console.log('Response is not an array:', response);
      this.vacationEmployeeReports = [];
    }

    this.prepareExportData();
    this.showTable = true;
  } catch (error) {
    console.error('Error loading leave request reports:', error);
    this.vacationEmployeeReports = [];
    this.showTable = true;
  } finally {
    this.isLoading = false;
  }
}

  private prepareExportData(): void {
    this.reportsForExport = [];
    this.vacationEmployeeReports.forEach(employee => {
      if (employee.vacationEmployees && employee.vacationEmployees.length > 0) {
        employee.vacationEmployees.forEach((vac: any) => {
          this.reportsForExport.push({
            'Employee ID': employee.employeeId,
            'Employee Name': employee.employeeEnName || employee.employeeArName || 'Unknown',
            'Total Amount': employee.totalAmount,
            'Vacation ID': vac.id,
            'Vacation Type': vac.vacationTypesName,
            'Date': vac.date,
            'Half Day': vac.halfDay ? 'Yes' : 'No',
            'Date From': vac.dateFrom,
            'Date To': vac.dateTo || '-',
            'Balance': vac.balance,
            'Used': vac.used,
            // 'Remains': vac.remains,
            'Notes': vac.notes || '-'
          });
        });
      } else {
        this.reportsForExport.push({
          'Employee ID': employee.employeeId,
          'Employee Name': employee.employeeEnName || employee.employeeArName || 'Unknown',
          'Total Amount': employee.totalAmount,
          'Vacation ID': '-',
          'Vacation Type': '-',
          'Date': '-',
          'Half Day': '-',
          'Date From': '-',
          'Date To': '-',
          'Balance': '-',
          'Used': '-',
          // 'Remains': '-',
          'Notes': '-'
        });
      }
    });
    this.reportsForExcel = this.reportsForExport.map(obj => Object.values(obj));
  }

  getJobCategoryName(): string {
    return this.jobCategories.find(jc => jc.id == this.selectedJobCategoryId)?.name || 
           this.jobCategories.find(jc => jc.id == this.selectedJobCategoryId)?.ar_name || 
           'All Job Categories';
  }

  getJobName(): string {
    return this.jobs.find(j => j.id == this.selectedJobId)?.name || 
           this.jobs.find(j => j.id == this.selectedJobId)?.ar_name || 
           'All Jobs';
  }

  getEmployeeName(): string {
    return this.employees.find(e => e.id == this.selectedEmployeeId)?.en_name || 
           this.employees.find(e => e.id == this.selectedEmployeeId)?.ar_name || 
           'All Employees';
  }

  getInfoRows(): any[] {
    return [
      { keyEn: 'Date From: ' + this.dateFrom },
      { keyEn: 'Date To: ' + this.dateTo },
      { keyEn: 'Job Category: ' + this.getJobCategoryName() },
      { keyEn: 'Job: ' + this.getJobName() },
      { keyEn: 'Employee: ' + this.getEmployeeName() }
    ];
  }

  DownloadAsPDF() {
    if (this.reportsForExport.length === 0) {
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }
    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }

  Print() {
    if (this.reportsForExport.length === 0) {
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

  async exportExcel() {
    if (this.reportsForExcel.length === 0) {
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }
    this.isExporting = true;
    try {
      await this.reportsService.generateExcelReport({
        mainHeader: {
          en: 'Vacation Employee Report',
          ar: 'تقرير اجازات الموظفين'
        },
        // subHeaders: [
        //   {
        //     en: 'Employee Vacation Records',
        //     ar: 'سجلات اجازات الموظفين'
        //   }
        // ],
        infoRows: [
          { key: 'Date From', value: this.dateFrom },
          { key: 'Date To', value: this.dateTo },
          { key: 'Job Category', value: this.getJobCategoryName() },
          { key: 'Job', value: this.getJobName() },
          { key: 'Employee', value: this.getEmployeeName() }
        ],
        tables: [
          {
            // title: 'Vacation Employee Report Data',
            headers: [
              'Employee ID',
              'Employee Name',
              'Total Amount',
              'Vacation ID',
              'Vacation Type',
              'Date',
              'Half Day',
              'Date From',
              'Date To',
              'Balance',
              'Used',
              // 'Remains',
              'Notes'
            ],
            data: this.reportsForExcel
          }
        ],
        filename: `Vacation_Employee_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Swal.fire('Error', 'Failed to export to Excel', 'error');
    } finally {
      this.isExporting = false;
    }
  }

  hasVacationEmployees(employee: any): boolean {
    return employee.vacationEmployees && employee.vacationEmployees.length > 0;
  }

  getVacationEmployeeCount(employee: any): number {
    return employee.vacationEmployees ? employee.vacationEmployees.length : 0;
  }
}
