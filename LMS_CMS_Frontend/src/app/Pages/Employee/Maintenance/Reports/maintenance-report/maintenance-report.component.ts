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
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Maintenance } from '../../../../../Models/Maintenance/maintenance';
import { MaintenanceService } from '../../../../../Services/Employee/Maintenance/maintenance.services';

@Component({
  selector: 'app-maintenance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './maintenance-report.component.html',
  styleUrl: './maintenance-report.component.css'
})
export class MaintenanceReportComponent implements OnInit {
  // Filter properties
  dateFrom: string = '';
  dateTo: string = '';
  selectedItemId: number | null = null;
  selectedCompanyId: number | null = null;
  selectedEmployeeId: number | null = null;

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
    reportHeaderOneEn: 'Conduct Report',
    reportHeaderTwoEn: 'Student Behavior Records',
    reportHeaderOneAr: 'تقرير الصيانة',
    reportHeaderTwoAr: 'سجلات سلوك الطلاب'
  };

  constructor(
    // private maintenanceReportService: MaintenanceReport,
    private maintenanceReportService: MaintenanceService,
    private maintenanceItemService: MaintenanceItemService,
    private maintenanceCompaniesService: MaintenanceCompaniesService,
    private maintenanceEmployeesService: MaintenanceEmployeesService,
    private apiService: ApiService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService,
    private reportsService: ReportsService
  ) {}

  ngOnInit() {
    this.loadDropdownData();
    
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
    this.showViewReportBtn = this.dateFrom !== '' && this.dateTo !== '' ;
    this.maintenanceReports = [];
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

  // Check if both Company and Employee are selected
  if (this.selectedCompanyId && this.selectedEmployeeId) {
    Swal.fire({
      title: 'Invalid Selection',
      text: 'You cannot filter by both Employee and Company at the same time.',
      icon: 'warning',
      confirmButtonText: 'OK',
    });
    return;
  }

  this.isLoading = true;
  this.showTable = false;

  try {
    const domainName = this.apiService.GetHeader();
    
    // Create proper request object with actual filter values
    const request: any = {
      fromDate: this.dateFrom ? new Date(this.dateFrom).toISOString().split('T')[0] : null,
      toDate: this.dateTo ? new Date(this.dateTo).toISOString().split('T')[0] : null,
      itemId: this.selectedItemId || 0,
      companyId: this.selectedCompanyId || 0,
      maintenanceEmployeeId: this.selectedEmployeeId || 0
    };

    // Remove properties with 0 values (optional, depending on backend requirements)
    Object.keys(request).forEach(key => {
      if (request[key] === 0 || request[key] === null || request[key] === undefined) {
        delete request[key];
      }
    });

    console.log('Sending request:', request);

    const response = await firstValueFrom(
      this.maintenanceReportService.getMaintenanceReport(domainName, request)
    );

    console.log('API Response:', response);
    
    if (Array.isArray(response)) {
      this.maintenanceReports = response;
      console.log('Maintenance reports loaded:', this.maintenanceReports.length);
    } else {
      console.log('Response is not an array:', response);
      this.maintenanceReports = [];
    }

    this.prepareExportData();
    this.showTable = true;
  } catch (error) {
    console.error('Error loading maintenance reports:', error);
    this.maintenanceReports = [];
    this.showTable = true;
    Swal.fire('Error', 'Failed to load maintenance reports', 'error');
  } finally {
    this.isLoading = false;
  }
}

onCompanyChange() {
  if (this.selectedCompanyId && this.selectedEmployeeId) {
    // If both are selected, clear the employee selection
    this.selectedEmployeeId = null;
    Swal.fire({
      title: 'Selection Changed',
      text: 'Company selected. Employee selection cleared.',
      icon: 'info',
      confirmButtonText: 'OK',
    });
  }
  this.onFilterChange();
}

onEmployeeChange() {
  if (this.selectedEmployeeId && this.selectedCompanyId) {
    // If both are selected, clear the company selection
    this.selectedCompanyId = null;
    Swal.fire({
      title: 'Selection Changed',
      text: 'Employee selected. Company selection cleared.',
      icon: 'info',
      confirmButtonText: 'OK',
    });
  }
  this.onFilterChange();
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
    return this.maintenanceItems.find(i => i.id === this.selectedItemId)?.en_Name || 'All Items';
  }

  getCompanyName(): string {
    return this.maintenanceCompanies.find(c => c.id === this.selectedCompanyId)?.en_Name || 'All Companies';
  }

  getEmployeeName(): string {
    return this.maintenanceEmployees.find(e => e.id === this.selectedEmployeeId)?.en_Name || 'All Employees';
  }

// In maintenance-report.component.ts - update the getInfoRows method and related helper methods

getInfoRows(): any[] {
  const infoRows = [
    { keyEn: 'From Date: ' + this.dateFrom },
    { keyEn: 'To Date: ' + this.dateTo },
    { keyEn: 'Item: ' + this.getItemName() }
  ];

  // Handle Company/Employee display logic
  if (this.selectedCompanyId) {
    infoRows.push({ keyEn: 'Company: ' + this.getCompanyName() });
    // infoRows.push({ keyEn: 'Employee: All Employees' });
  } else if (this.selectedEmployeeId) {
    // infoRows.push({ keyEn: 'Company: All Companies' });
    infoRows.push({ keyEn: 'Employee: ' + this.getEmployeeName() });
  } else {
    // Neither is selected
    infoRows.push({ keyEn: 'Company: All Companies' });
    infoRows.push({ keyEn: 'Employee: All Employees' });
  }

  return infoRows;
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
    // Prepare info rows with the same logic as getInfoRows
    const infoRows = [
      { key: 'From Date', value: this.dateFrom },
      { key: 'To Date', value: this.dateTo },
      { key: 'Item', value: this.getItemName() }
    ];

    // Handle Company/Employee display logic
    if (this.selectedCompanyId) {
      infoRows.push({ key: 'Company', value: this.getCompanyName() });
      // infoRows.push({ key: 'Employee', value: 'All Employees' });
    } else if (this.selectedEmployeeId) {
      // infoRows.push({ key: 'Company', value: 'All Companies' });
      infoRows.push({ key: 'Employee', value: this.getEmployeeName() });
    } else {
      // Neither is selected
      infoRows.push({ key: 'Company', value: 'All Companies' });
      infoRows.push({ key: 'Employee', value: 'All Employees' });
    }

    await this.reportsService.generateExcelReport({
      mainHeader: {
        en: 'Maintenance Report',
        ar: 'تقرير الصيانة'
      },
      // subHeaders: [
      //   {
      //     en: 'Maintenance Records',
      //     ar: 'سجلات الصيانة'
      //   }
      // ],
      infoRows: infoRows,
      tables: [
        {
          // title: 'Maintenance Report Data',
          headers: ['Date', 'Item', 'Company', 'Employee', 'Cost', 'Notes'],
          data: this.reportsForExcel
        }
      ],
      filename: `Maintenance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    Swal.fire('Error', 'Failed to export to Excel', 'error');
  } finally {
    this.isExporting = false;
  }
}
}