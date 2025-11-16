import { Component, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { EmployeeService } from '../../../../../Services/Employee/employee.service';
import { JobCategoriesService } from '../../../../../Services/Employee/Administration/job-categories.service';
import { JobService } from '../../../../../Services/Employee/Administration/job.service';
import { ApiService } from '../../../../../Services/api.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../../../Services/loading.service';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-employee-job-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './employee-job-report.component.html',
  styleUrl: './employee-job-report.component.css'
})

@InitLoader()
export class EmployeeJobReportComponent  implements OnInit {
  // Filter properties
  selectedJobCategoryId: number = 0;
  selectedJobId: number = 0;

  // Data sources
  jobCategories: any[] = [];
  jobs: any[] = [];

  // Report data
  jobReports: any[] = [];
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
    reportHeaderOneEn: 'Job Report',
    reportHeaderTwoEn: 'Employee Job Records',
    reportHeaderOneAr: 'تقرير الوظائف',
    reportHeaderTwoAr: 'سجلات موظفي الوظائف'
  };

  constructor(
    private employeeService: EmployeeService,
    private jobCategoriesService: JobCategoriesService,
    private jobService: JobService,
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
    if (this.selectedJobCategoryId) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.jobService.GetByCtegoty(this.selectedJobCategoryId, domainName)
        );
        this.jobs = data;
        this.selectedJobId = 0;
        this.onFilterChange();
      } catch (error) {
        console.error('Error loading jobs:', error);
      }
    } else {
      this.jobs = [];
      this.selectedJobId = 0;
      this.onFilterChange();
    }
  }

  onFilterChange() {
    this.showTable = false;
    this.showViewReportBtn = !!this.selectedJobCategoryId && !!this.selectedJobId;
    this.jobReports = [];
  }

  async viewReport() {
    if (!this.selectedJobCategoryId || !this.selectedJobId) {
      Swal.fire({
        title: 'Incomplete Selection',
        text: 'Please select Job Category and Job to generate the report.',
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
        this.employeeService.GetJobReport(
          this.selectedJobId,
          this.selectedJobCategoryId,
          domainName
        )
      );

      console.log('API Response:', response);
      
      if (Array.isArray(response)) {
        this.jobReports = response;
        console.log('Job reports loaded:', this.jobReports.length);
      } else {
        console.log('Response is not an array:', response);
        this.jobReports = [];
      }

      this.prepareExportData();
      this.showTable = true;
    } catch (error) {
      console.error('Error loading job reports:', error);
      this.jobReports = [];
      this.showTable = true;
      Swal.fire({
        title: 'Error',
        text: 'Failed to load job reports',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      this.isLoading = false;
    }
  }

  private prepareExportData(): void {
    console.log('Preparing export data for', this.jobReports.length, 'reports');
    // For PDF (object format)
    this.reportsForExport = this.jobReports.map((report) => ({
      'ID': report.id,
      'Employee': report.en_name || '-',
    }));

    // For Excel (array format)
    this.reportsForExcel = this.jobReports.map((report) => [
      report.id,
      report.name || report.ar_name || '-'
    ]);
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

  getInfoRows(): any[] {
    return [
      { keyEn: 'Job Category: ' + this.getJobCategoryName() },
      { keyEn: 'Job: ' + this.getJobName() }
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
          en: 'Job Report',
          ar: 'تقرير الوظائف'
        },
        // subHeaders: [
        //   {
        //     en: 'Employee Job Records',
        //     ar: 'سجلات موظفي الوظائف'
        //   }
        // ],
        infoRows: [
          { key: 'Job Category', value: this.getJobCategoryName() },
          { key: 'Job', value: this.getJobName() }
        ],
        tables: [
          {
            // title: 'Job Report Data',
            headers: ['ID', 'Employee Name'],
            data: this.reportsForExcel
          }
        ],
        filename: `Job_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Swal.fire('Error', 'Failed to export to Excel', 'error');
    } finally {
      this.isExporting = false;
    }
  }
}