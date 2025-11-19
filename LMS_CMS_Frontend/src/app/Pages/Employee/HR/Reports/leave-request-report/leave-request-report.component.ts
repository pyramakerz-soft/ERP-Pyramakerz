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
import { LeaveRequestService } from '../../../../../Services/Employee/HR/leave-request.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../../Services/loading.service';

@Component({
  selector: 'app-leave-request-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './leave-request-report.component.html',
  styleUrl: './leave-request-report.component.css'
})

@InitLoader()
export class LeaveRequestReportComponent  implements OnInit {
// Filter properties
selectedJobCategoryId: number | null = null;
selectedJobId: number | null = null;
selectedEmployeeId: number | null = null;
dateFrom: string = '';
dateTo: string = '';

  // Data sources
  jobCategories: any[] = [];
  jobs: any[] = [];
  employees: any[] = [];

  // Report data
  leaveRequestReports: any[] = [];
  showTable: boolean = false;
  isLoading: boolean = false;
  showViewReportBtn: boolean = false;
  isExporting: boolean = false;
  reportsForExcel: any[] = [];

  // Language and RTL
  isRtl: boolean = false;
  subscription!: Subscription;

  // PDF Export
  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  showPDF = false;
  reportsForExport: any[] = [];
  tableSectionsForPDF: any[] = [];
  school = {
    reportHeaderOneEn: 'Leave Request Report',
    reportHeaderTwoEn: 'Employee Leave Request Records',
    reportHeaderOneAr: 'تقرير طلبات الإجازة',
    reportHeaderTwoAr: 'سجلات طلبات إجازة الموظفين'
  };

  constructor(
    private leaveRequestService: LeaveRequestService,
    private jobCategoriesService: JobCategoriesService,
    private jobService: JobService,
    private employeeService: EmployeeService,
    private apiService: ApiService,
    private languageService: LanguageService, 
    private reportsService: ReportsService,
    private loadingService: LoadingService 
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
  this.selectedJobId = null;
  this.employees = [];
  this.selectedEmployeeId = null;
  
  if (this.selectedJobCategoryId && this.selectedJobCategoryId !== null) {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(
        this.jobService.GetByCtegoty(this.selectedJobCategoryId, domainName)
      );
      this.jobs = data;
    } catch (error) {
      console.error('Error loading jobs:', error);
      this.jobs = [];
    }
  } else {
    this.jobs = [];
  }
  
  this.onFilterChange();
}

async loadEmployees() {
  this.selectedEmployeeId = null;
  
  if (this.selectedJobId && this.selectedJobId !== null) {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(
        this.employeeService.GetWithJobId(this.selectedJobId, domainName)
      );
      this.employees = data;
      console.log('this.employees:', this.employees);
    } catch (error) {
      console.error('Error loading employees:', error);
      this.employees = [];
    }
  } else {
    this.employees = [];
  }
  
  this.onFilterChange();
}

  onFilterChange() {
    this.showTable = false;
    this.showViewReportBtn = !!this.dateFrom && !!this.dateTo;
    this.leaveRequestReports = [];
  }

  ResetFilter() {
  this.selectedJobCategoryId = null;
  this.selectedJobId = null;
  this.dateTo = '';
  this.dateFrom = '';
  this.selectedEmployeeId = null;
  this.showTable = false;
  this.showViewReportBtn = false;
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
      if (this.selectedEmployeeId && this.selectedEmployeeId !== null) {
        params.employeeId = this.selectedEmployeeId;
      }
      if (this.selectedJobId && this.selectedJobId !== null && this.selectedJobId !== null) {
        params.jobId = this.selectedJobId;
      }
      if (this.selectedJobCategoryId && this.selectedJobCategoryId !== null && this.selectedJobCategoryId !== null) {
        params.categoryId = this.selectedJobCategoryId;
      }

      console.log('Sending parameters:', params);

      const response = await firstValueFrom(
        this.leaveRequestService.GetLeaveRequestReport(
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
        this.leaveRequestReports = [];
        this.leaveRequestReports = response;
        console.log('Bonus reports loaded:', this.leaveRequestReports.length);
      } else {
        console.log('Response is not an array:', response);
        this.leaveRequestReports = [];
      }

      this.prepareExportData();
      this.showTable = true;
    } catch (error) {
      console.error('Error loading bonus reports:', error);
      this.leaveRequestReports = [];
      this.showTable = true;
    } finally {
      this.isLoading = false;
    }
  }

private prepareExportData(): void {
  // For PDF sections (similar to deduction report)
  this.tableSectionsForPDF = [];
  
  // For regular table display
  this.reportsForExport = [];
  
  this.leaveRequestReports.forEach(employeeLeaveRequest => {
    const employeeName = employeeLeaveRequest.employeeEnName || employeeLeaveRequest.employeeArName || 'Unknown';

    // Create section for PDF (similar to deduction report)
    const section = {
      header: `Employee: ${employeeName}`,
      data: [
        { key: 'Employee ID', value: employeeLeaveRequest.employeeId },
        { key: 'Employee Name', value: employeeName }
      ],
      tableHeaders: [
        'Leave Date', 
        'Hours',
        'Minutes',
        'Monthly Balance', 
        'Notes'
      ],
      tableData: [] as any[]
    };

    if (employeeLeaveRequest.leaveRequests && employeeLeaveRequest.leaveRequests.length > 0) {
      employeeLeaveRequest.leaveRequests.forEach((leaveRequest: any) => {
        // For PDF sections
        section.tableData.push({
          'Leave Date': new Date(leaveRequest.date).toLocaleDateString(),
          'Hours': leaveRequest.hours || '-',
          'Minutes': leaveRequest.minutes || '-',
          'Monthly Balance': leaveRequest.monthlyLeaveRequestBalance || '-',
          'Notes': leaveRequest.notes || '-'
        });

        // For regular export
        this.reportsForExport.push({
          'Employee ID': employeeLeaveRequest.employeeId,
          'Employee Name': employeeName,
          'Leave Request ID': leaveRequest.id,
          'Leave Date': new Date(leaveRequest.date).toLocaleDateString(),
          'Hours': leaveRequest.hours || '-',
          'Minutes': leaveRequest.minutes || '-',
          'Monthly Balance': leaveRequest.monthlyLeaveRequestBalance || '-',
          'Notes': leaveRequest.notes || '-'
        });
      });
    } else {
      // If no leave requests, add placeholder
      section.tableData.push({
        'Leave Date': '-',
        'Hours': '-',
        'Minutes': '-',
        'Monthly Balance': '-',
        'Notes': 'No leave requests found'
      });

      this.reportsForExport.push({
        'Employee ID': employeeLeaveRequest.employeeId,
        'Employee Name': employeeName,
        'Leave Request ID': '-',
        'Leave Date': '-',
        'Hours': '-',
        'Minutes': '-',
        'Monthly Balance': '-',
        'Notes': '-'
      });
    }

    this.tableSectionsForPDF.push(section);
  });

  // For Excel (array format)
  this.reportsForExcel = [];
  this.leaveRequestReports.forEach(employeeLeaveRequest => {
    if (employeeLeaveRequest.leaveRequests && employeeLeaveRequest.leaveRequests.length > 0) {
      employeeLeaveRequest.leaveRequests.forEach((leaveRequest: any) => {
        this.reportsForExcel.push([
          employeeLeaveRequest.employeeId,
          employeeLeaveRequest.employeeEnName || employeeLeaveRequest.employeeArName || 'Unknown',
          new Date(leaveRequest.date).toLocaleDateString(),
          leaveRequest.hours || '-',
          leaveRequest.minutes || '-',
          leaveRequest.monthlyLeaveRequestBalance || '-',
          leaveRequest.notes || '-'
        ]);
      });
    } else {
      this.reportsForExcel.push([
        employeeLeaveRequest.employeeId,
        employeeLeaveRequest.employeeEnName || employeeLeaveRequest.employeeArName || 'Unknown',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-'
      ]);
    }
  });
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
    return [{ keyEn: 'Date From: ' + this.dateFrom, keyAr: this.dateFrom + ': من تاريخ' },
    { keyEn: 'Date To: ' + this.dateTo, keyAr: this.dateTo + ': إلى تاريخ' },
    { keyEn: 'Job Category: ' + this.getJobCategoryName(), keyAr: this.getJobCategoryName() + ': فئة الوظيفة' },
    { keyEn: 'Job: ' + this.getJobName(), keyAr: this.getJobName() + ': الوظيفة' },
    { keyEn: 'Employee: ' + this.getEmployeeName(), keyAr: this.getEmployeeName() + ': الموظف' }
    ]
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
          en: 'Leave Request Report',
          ar: 'تقرير طلبات الإجازة' 
        },
        infoRows: [
          { key: 'Date From', value: this.dateFrom },
          { key: 'Date To', value: this.dateTo },
          { key: 'Job Category', value: this.getJobCategoryName() },
          { key: 'Job', value: this.getJobName() },
          { key: 'Employee', value: this.getEmployeeName() }
        ],
        tables: [
          {
            headers: [
              'Employee ID', 
              'Employee Name',
              // 'Total Amount'  
              'Leave Date', 
              'Hours',
              'Minutes',
              'Monthly Balance'
              // 'Used'  
              // 'Remains'  
              , 'Notes'
            ],
            data: this.reportsForExcel
          }
        ],
        filename: `Leave_Request_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Swal.fire('Error', 'Failed to export to Excel', 'error');
    } finally {
      this.isExporting = false;
    }
  }

  // Helper method to check if employee has leave requests
  hasLeaveRequests(employeeLeaveRequest: any): boolean {
    return employeeLeaveRequest.leaveRequests && employeeLeaveRequest.leaveRequests.length > 0;
  }

  // Helper method to get leave request count
  getLeaveRequestCount(employeeLeaveRequest: any): number {
    return employeeLeaveRequest.leaveRequests ? employeeLeaveRequest.leaveRequests.length : 0;
  }

  // Helper method to format hours and minutes
  formatHoursMinutes(hours: number, minutes: number): string {
    if (hours === 0 && minutes === 0) return '-';
    if (minutes === 0) return `${hours}h`;
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }
}
