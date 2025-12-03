import { Component, OnInit, ViewChild } from '@angular/core';
import { MaintenanceItem } from '../../../../../Models/Maintenance/maintenance-item';
import { MaintenanceCompanies } from '../../../../../Models/Maintenance/maintenance-companies';
import { MaintenanceEmployees } from '../../../../../Models/Maintenance/maintenance-employees';
import { Subscription } from 'rxjs/internal/Subscription';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { MaintenanceItemService } from '../../../../../Services/Employee/Maintenance/maintenance-item.service';
import { MaintenanceCompaniesService } from '../../../../../Services/Employee/Maintenance/maintenance-companies.service';
import { MaintenanceEmployeesService } from '../../../../../Services/Employee/Maintenance/maintenance-employees.service';
import { ApiService } from '../../../../../Services/api.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { firstValueFrom } from 'rxjs';
// import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Maintenance } from '../../../../../Models/Maintenance/maintenance';
import { MaintenanceService } from '../../../../../Services/Employee/Maintenance/maintenance.services';
import { LoadingService } from '../../../../../Services/loading.service';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-maintenance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './maintenance-report.component.html',
  styleUrl: './maintenance-report.component.css'
})

@InitLoader()
export class MaintenanceReportComponent implements OnInit {
  // Filter properties
  dateFrom: string = '';
  dateTo: string = '';
  selectedItemId: number | null = null;
  selectedCompanyId: number | null = null;
  selectedEmployeeId: number | null = null;

  // Checkbox filters
  filterByCompany: boolean = true;
  filterByEmployee: boolean = true;

  // Data sources
  maintenanceItems: MaintenanceItem[] = [];
  maintenanceCompanies: MaintenanceCompanies[] = [];
  maintenanceEmployees: MaintenanceEmployees[] = [];

  // Report data
  maintenanceReports: Maintenance[] = [];
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
    reportHeaderOneEn: 'Maintenance Report',
    reportHeaderOneAr: 'تقرير الصيانة',
  };

  constructor(
    private maintenanceReportService: MaintenanceService,
    private maintenanceItemService: MaintenanceItemService,
    private maintenanceCompaniesService: MaintenanceCompaniesService,
    private maintenanceEmployeesService: MaintenanceEmployeesService,
    private apiService: ApiService,
    private languageService: LanguageService, 
    private reportsService: ReportsService,
    private loadingService: LoadingService 
  ) {}

  ngOnInit() {
    this.loadDropdownData();
    
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

  async loadDropdownData() {
    try {
      const domainName = this.apiService.GetHeader();
      
      // Load maintenance items
      this.maintenanceItems = await firstValueFrom(this.maintenanceItemService.Get(domainName));
      
      // Load maintenance companies
      this.maintenanceCompanies = await firstValueFrom(this.maintenanceCompaniesService.Get(domainName));
      
      // Load maintenance employees
      this.maintenanceEmployees = await firstValueFrom(this.maintenanceEmployeesService.Get(domainName));
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  }

  onFilterChange() {
    this.showTable = false;
    this.showViewReportBtn = this.dateFrom !== '' && this.dateTo !== '';
    this.maintenanceReports = [];
  }

  onCompanyCheckboxChange() {
    if (!this.filterByCompany) {
      this.selectedCompanyId = null;
    }
    this.onFilterChange();
  }

  onEmployeeCheckboxChange() {
    if (!this.filterByEmployee) {
      this.selectedEmployeeId = null;
    }
    this.onFilterChange();
  }

async viewReport() {
  if (this.filterByCompany && this.selectedCompanyId && this.selectedCompanyId > 0 && 
      this.filterByEmployee && this.selectedEmployeeId && this.selectedEmployeeId > 0) {
    const Swal = await import('sweetalert2').then(m => m.default);
    
    Swal.fire({
      title: 'Invalid Selection',
      text: 'You cannot select specific IDs for both Company and Employee at the same time. Please select "All" for one of them or disable one filter.',
      icon: 'warning',
      confirmButtonText: 'OK',
    });
    return;
  }

  // Existing date validation
  if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
    const Swal = await import('sweetalert2').then(m => m.default);
    
    Swal.fire({
      title: 'Invalid Date Range',
      text: 'Start date cannot be later than end date.',
      icon: 'warning',
      confirmButtonText: 'OK',
    });
    return;
  }

  this.isLoading = true;
  this.showTable = false;

  try {
    const domainName = this.apiService.GetHeader();
    
    // Build request object based on filter checkboxes
    const request: any = {
      fromDate: this.dateFrom ? new Date(this.dateFrom).toISOString().split('T')[0] : null,
      toDate: this.dateTo ? new Date(this.dateTo).toISOString().split('T')[0] : null,
    };

    // Add itemId if selected
    if (this.selectedItemId && this.selectedItemId !== 0) {
      request.itemId = this.selectedItemId;
    }

    // Determine filterBy value based on checkboxes
    if (this.filterByCompany && !this.filterByEmployee) {
      // Only companies
      request.filterBy = 1;
      if (this.selectedCompanyId && this.selectedCompanyId !== 0) {
        request.companyId = this.selectedCompanyId;
      }
    } else if (!this.filterByCompany && this.filterByEmployee) {
      // Only employees
      request.filterBy = 2;
      if (this.selectedEmployeeId && this.selectedEmployeeId !== 0) {
        request.maintenanceEmployeeId = this.selectedEmployeeId;
      }
    } else if (this.filterByCompany && this.filterByEmployee) {
      // Both filters are enabled
      // At this point, we know they're not both specific IDs (due to validation above)
      
      // If company has specific ID, employee must be "All" or null
      if (this.selectedCompanyId && this.selectedCompanyId !== 0) {
        request.companyId = this.selectedCompanyId;
        // Employee should be "All" or not included
        if (!this.selectedEmployeeId || this.selectedEmployeeId === 0) {
          // Employee is "All", so don't include it
        }
      }
      // If employee has specific ID, company must be "All" or null
      else if (this.selectedEmployeeId && this.selectedEmployeeId !== 0) {
        request.maintenanceEmployeeId = this.selectedEmployeeId;
        // Company should be "All" or not included
        if (!this.selectedCompanyId || this.selectedCompanyId === 0) {
          // Company is "All", so don't include it
        }
      }
      // If both are "All" (0) or null, don't include either
    }
    // If both are false, only dates are sent

    const response = await firstValueFrom(
      this.maintenanceReportService.getMaintenanceReport(domainName, request)
    ); 
    
    if (Array.isArray(response)) {
      this.maintenanceReports = response; 
    } else { 
      this.maintenanceReports = [];
    }

    this.prepareExportData();
    this.showTable = true;
  } catch (error) { 
    this.maintenanceReports = [];
    this.showTable = true;
    const Swal = await import('sweetalert2').then(m => m.default);
    Swal.fire('Error', 'Failed to load maintenance reports', 'error');
  } finally {
    this.isLoading = false;
  }
}

  private prepareExportData(): void {
    // For PDF (object format)
    this.reportsForExport = this.maintenanceReports.map((report) => ({
      'Date': new Date(report.date).toLocaleDateString(),
      'Item': report.itemEnglishName || report.itemArabicName,
      'Company': report.companyEnglishName || report.companyArabicName || '-',
      'Employee': report.employeeEnglishName || report.employeeArabicName || '-',
      'Cost': report.cost,
      'Notes': report.note || '-'
    }));

    // For Excel (array format)
    this.reportsForExcel = this.maintenanceReports.map((report) => [
      new Date(report.date).toLocaleDateString(),
      report.itemEnglishName || report.itemArabicName,
      report.companyEnglishName || report.companyArabicName || '-',
      report.employeeEnglishName || report.employeeArabicName || '-',
      report.cost,
      report.note || '-'
    ]);
  }

  getItemName(): string {
    if (!this.selectedItemId || this.selectedItemId === 0) {
      return 'All Items';
    }
    return this.maintenanceItems.find(i => i.id === this.selectedItemId)?.en_Name || 'All Items';
  }

  getCompanyName(): string {
    if (!this.filterByCompany) {
      return 'Not Filtered';
    }
    if (!this.selectedCompanyId || this.selectedCompanyId === 0) {
      return 'All Companies';
    }
    return this.maintenanceCompanies.find(c => c.id === this.selectedCompanyId)?.en_Name || 'All Companies';
  }

  getEmployeeName(): string {
    if (!this.filterByEmployee) {
      return 'Not Filtered';
    }
    if (!this.selectedEmployeeId || this.selectedEmployeeId === 0) {
      return 'All Employees';
    }
    return this.maintenanceEmployees.find(e => e.id === this.selectedEmployeeId)?.en_Name || 'All Employees';
  }

  getInfoRows(): any[] {
    const infoRows = [
      { keyEn: 'From Date: ' + this.dateFrom },
      { keyEn: 'To Date: ' + this.dateTo },
      { keyEn: 'Item: ' + this.getItemName() }
    ];

    // Add Company info if filtered
    if (this.filterByCompany) {
      infoRows.push({ keyEn: 'Company: ' + this.getCompanyName() });
    }

    // Add Employee info if filtered
    if (this.filterByEmployee) {
      infoRows.push({ keyEn: 'Employee: ' + this.getEmployeeName() });
    }

    return infoRows;
  }

  async DownloadAsPDF() {
    if (this.reportsForExport.length === 0) {
      const Swal = await import('sweetalert2').then(m => m.default);
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }

    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }

  async Print() {
    if (this.reportsForExport.length === 0) {
      const Swal = await import('sweetalert2').then(m => m.default);
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
      const Swal = await import('sweetalert2').then(m => m.default);
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }

    this.isExporting = true;
    
    try {
      const infoRows = [
        { key: 'From Date', value: this.dateFrom },
        { key: 'To Date', value: this.dateTo },
        { key: 'Item', value: this.getItemName() }
      ];

      // Add Company info if filtered
      if (this.filterByCompany) {
        infoRows.push({ key: 'Company', value: this.getCompanyName() });
      }

      // Add Employee info if filtered
      if (this.filterByEmployee) {
        infoRows.push({ key: 'Employee', value: this.getEmployeeName() });
      }

      await this.reportsService.generateExcelReport({
        mainHeader: {
          en: 'Maintenance Report',
          ar: 'تقرير الصيانة'
        },
        infoRows: infoRows,
        tables: [
          {
            headers: ['Date', 'Item', 'Company', 'Employee', 'Cost', 'Notes'],
            data: this.reportsForExcel
          }
        ],
        filename: `Maintenance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      });
    } catch (error) {
      const Swal = await import('sweetalert2').then(m => m.default);
      Swal.fire('Error', 'Failed to export to Excel', 'error');
    } finally {
      this.isExporting = false;
    }
  }
}