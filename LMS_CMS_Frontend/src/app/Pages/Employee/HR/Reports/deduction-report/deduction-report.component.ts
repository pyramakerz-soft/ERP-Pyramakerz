import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { Subscription, firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../../Services/api.service';
import { JobCategoriesService } from '../../../../../Services/Employee/Administration/job-categories.service';
import { JobService } from '../../../../../Services/Employee/Administration/job.service';
import { EmployeeService } from '../../../../../Services/Employee/employee.service';
import { DeductionService } from '../../../../../Services/Employee/HR/deduction.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';

@Component({
  selector: 'app-deduction-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './deduction-report.component.html',
  styleUrl: './deduction-report.component.css'
})
export class DeductionReportComponent  implements OnInit {
  // Filter properties
  selectedJobCategoryId: number = 0;
  selectedJobId: number = 0;
  selectedEmployeeId: number = 0;
  dateFrom: string = '';
  dateTo: string = '';

  // Data sources
  jobCategories: any[] = [];
  jobs: any[] = [];
  employees: any[] = [];

  // Report data
  deductionReports: any[] = [];
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
  school = {
    reportHeaderOneEn: 'Deduction Report',
    reportHeaderTwoEn: 'Employee Deduction Records',
    reportHeaderOneAr: 'تقرير الخصومات',
    reportHeaderTwoAr: 'سجلات خصومات الموظفين'
  };

  constructor(
    private deductionService: DeductionService,
    private jobCategoriesService: JobCategoriesService,
    private jobService: JobService,
    private employeeService: EmployeeService,
    private apiService: ApiService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService,
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
    this.realTimeService.stopConnection();
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
    // Enable View Report when both dates are selected.
    // Keep previous full-selection behavior as well (optional).
    const datesSelected = !!this.dateFrom && !!this.dateTo;
    const fullSelection = !!this.dateFrom && !!this.dateTo && !!this.selectedJobCategoryId && !!this.selectedJobId && !!this.selectedEmployeeId;
    this.showViewReportBtn = datesSelected || fullSelection;
    this.deductionReports = [];
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
      const response = await firstValueFrom(
        // pass undefined for filters that are not selected so service omits them
        this.deductionService.GetDeductionReport(
          this.selectedJobCategoryId || undefined,
          this.selectedJobId || undefined,
          this.selectedEmployeeId || undefined,
          this.dateFrom || undefined,
          this.dateTo || undefined,
          domainName
        )
      );

      console.log('API Response:', response);
      
      if (Array.isArray(response)) {
        this.deductionReports = response;
        console.log('Deduction reports loaded:', this.deductionReports.length);
      } else {
        console.log('Response is not an array:', response);
        this.deductionReports = [];
      }

      this.prepareExportData();
      this.showTable = true;
    } catch (error) {
      console.error('Error loading deduction reports:', error);
      this.deductionReports = [];
      this.showTable = true;
    } finally {
      this.isLoading = false;
    }
  }

  private prepareExportData(): void {
    // For PDF (object format) - Flatten the data for the table
    this.reportsForExport = [];
    this.deductionReports.forEach(employeeDeduction => {
      if (employeeDeduction.deductions && employeeDeduction.deductions.length > 0) {
        employeeDeduction.deductions.forEach((deduction: any) => {
          this.reportsForExport.push({
            'Employee ID': employeeDeduction.employeeId,
            'Employee Name': employeeDeduction.employeeEnName || employeeDeduction.employeeArName || 'Unknown',
            'Total Amount': employeeDeduction.totalAmount,
            'Deduction ID': deduction.id,
            'Deduction Date': new Date(deduction.date).toLocaleDateString(),
            'Deduction Type': deduction.deductionTypeName,
            'Hours': deduction.hours || '-',
            'Minutes': deduction.minutes || '-',
            'Number of Deduction Days': deduction.numberOfDeductionDays || '-',
            'Amount': deduction.amount || '-',
            'Notes': deduction.notes || '-'
          });
        });
      } else {
        // If no deductions, still show employee summary
        this.reportsForExport.push({
          'Employee ID': employeeDeduction.employeeId,
          'Employee Name': employeeDeduction.employeeEnName || employeeDeduction.employeeArName || 'Unknown',
          'Total Amount': employeeDeduction.totalAmount,
          'Deduction ID': '-',
          'Deduction Date': '-',
          'Deduction Type': '-',
          'Hours': '-',
          'Minutes': '-',
          'Number of Deduction Days': '-',
          'Amount': '-',
          'Notes': '-'
        });
      }
    });

    // For Excel (array format)
    this.reportsForExcel = [];
    this.deductionReports.forEach(employeeDeduction => {
      if (employeeDeduction.deductions && employeeDeduction.deductions.length > 0) {
        employeeDeduction.deductions.forEach((deduction: any) => {
          this.reportsForExcel.push([
            employeeDeduction.employeeId,
            employeeDeduction.employeeEnName || employeeDeduction.employeeArName || 'Unknown',
            employeeDeduction.totalAmount,
            deduction.id,
            new Date(deduction.date).toLocaleDateString(),
            deduction.deductionTypeName,
            deduction.hours || '-',
            deduction.minutes || '-',
            deduction.numberOfDeductionDays || '-',
            deduction.amount || '-',
            deduction.notes || '-'
          ]);
        });
      } else {
        this.reportsForExcel.push([
          employeeDeduction.employeeId,
          employeeDeduction.employeeEnName || employeeDeduction.employeeArName || 'Unknown',
          employeeDeduction.totalAmount,
          '-',
          '-',
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
    return this.jobCategories.find(jc => jc.id == this.selectedJobCategoryId)?.en_name || 
           this.jobCategories.find(jc => jc.id == this.selectedJobCategoryId)?.ar_name || 
           'All Job Categories';
  }

  getJobName(): string {
    return this.jobs.find(j => j.id == this.selectedJobId)?.en_name || 
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
          en: 'Deduction Report',
          ar: 'تقرير الخصومات'
        },
        // subHeaders: [
        //   {
        //     en: 'Employee Deduction Records',
        //     ar: 'سجلات خصومات الموظفين'
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
            // title: 'Deduction Report Data',
            headers: [
              'Employee ID', 
              'Employee Name', 
              'Total Amount', 
              'Deduction ID', 
              'Deduction Date', 
              'Deduction Type',
              'Hours',
              'Minutes', 
              'Number of Deduction Days', 
              'Amount', 
              'Notes'
            ],
            data: this.reportsForExcel
          }
        ],
        filename: `Deduction_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Swal.fire('Error', 'Failed to export to Excel', 'error');
    } finally {
      this.isExporting = false;
    }
  }

  // Helper method to check if employee has deductions
  hasDeductions(employeeDeduction: any): boolean {
    return employeeDeduction.deductions && employeeDeduction.deductions.length > 0;
  }

  // Helper method to get deduction count
  getDeductionCount(employeeDeduction: any): number {
    return employeeDeduction.deductions ? employeeDeduction.deductions.length : 0;
  }
}
