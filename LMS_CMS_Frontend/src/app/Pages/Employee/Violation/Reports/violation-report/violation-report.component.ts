import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ViolationReport } from '../../../../../Models/Violation/violation-report';
import { EmployeeTypeGet } from '../../../../../Models/Administrator/employee-type-get';
import { ViolationType } from '../../../../../Models/Violation/violation-type';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { ViolationService } from '../../../../../Services/Employee/Violation/violation.service';
import { EmployeeTypeService } from '../../../../../Services/Employee/employee-type.service';
import { ViolationTypeService } from '../../../../../Services/Employee/Violation/violation-type.service';
import { ApiService } from '../../../../../Services/api.service';
import { AccountService } from '../../../../../Services/account.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import * as XLSX from 'xlsx-js-style';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';

@Component({
  selector: 'app-violation-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './violation-report.component.html',
  styleUrl: './violation-report.component.css',
})
export class ViolationReportComponent {
  DomainName: string = '';
  SelectedEmployeeTypeId: number = 0;
  SelectedViolationTypeId: number = 0;
  SelectedStartDate: string = '';
  SelectedEndDate: string = '';

  showTable: boolean = false;
  showViewReportBtn: boolean = false;
  showPDF: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  tableData: ViolationReport[] = [];
  DataToPrint: any = null;

  empTypes: EmployeeTypeGet[] = [];
  violationTypes: ViolationType[] = [];
  tableDataForExport: any[] = [];

  school = {
    reportHeaderOneEn: 'Violation Report',
    reportHeaderTwoEn: 'Detailed Violation Summary',
    reportHeaderOneAr: 'تقرير المخالفات',
    reportHeaderTwoAr: 'ملخص المخالفات التفصيلي',
    reportImage: 'assets/images/logo.png',
  };

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  constructor(
    public violationService: ViolationService,
    public employeeTypeService: EmployeeTypeService,
    public violationTypeService: ViolationTypeService,
    public apiService: ApiService,
    public accountService: AccountService,
    private languageService: LanguageService, 
    private reportsService: ReportsService // Add this line
  ) {}

  ngOnInit() {
    this.DomainName = this.apiService.GetHeader();
    this.GetEmployeeTypes();

    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void { 
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ResetFilter() {
    this.SelectedEmployeeTypeId = 0;
    this.SelectedViolationTypeId = 0;
    this.SelectedStartDate = '';
    this.SelectedEndDate = '';
    this.violationTypes = [];
    this.showTable = false;
    this.showViewReportBtn = false;
    this.tableData = [];
  }

  GetEmployeeTypes() {
    this.employeeTypeService.Get(this.DomainName).subscribe((data) => {
      this.empTypes = data;
    });
  }

  GetViolationTypes() {
    if (this.SelectedEmployeeTypeId) {
      this.violationTypeService
        .GetByEmployeeType(this.SelectedEmployeeTypeId, this.DomainName)
        .subscribe((data) => {
          this.violationTypes = data;
          this.SelectedViolationTypeId = 0;
        });
    } else {
      this.violationTypes = [];
      this.SelectedViolationTypeId = 0;
    }
    this.DateChange();
  }

  DateChange() {
    this.showTable = false;

    if (
      this.SelectedEndDate &&
      this.SelectedStartDate &&
      this.SelectedEmployeeTypeId
    ) {
      this.showViewReportBtn = true;
    } else {
      this.showViewReportBtn = false;
    }
  }

  ViewReport() {
    if (this.SelectedStartDate > this.SelectedEndDate) {
      Swal.fire({
        title: 'Invalid Date Range',
        text: 'Start date cannot be later than end date.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
    } else {
      this.GetData();
      this.showTable = true;
    }
  }

  GetData() {
    this.tableData = [];

    this.violationService
      .GetViolationReport(
        this.SelectedEmployeeTypeId,
        this.SelectedViolationTypeId,
        this.SelectedStartDate,
        this.SelectedEndDate,
        this.DomainName
      )
      .subscribe(
        (data) => {
          this.tableData = data;
          this.prepareExportData(); // Prepare data for export
          this.showTable = true;
        },
        (error) => {
          console.error('Error fetching violation report:', error);
          Swal.fire({
            title: 'Error',
            text: 'Failed to fetch violation report data.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          this.showTable = true;
        }
      );
  }
  get fileName(): string {
    return 'Violation Report';
  }

  get employeeTypeName(): string {
    const empType = this.empTypes.find(
      (e) => e.id == this.SelectedEmployeeTypeId
    );
    return empType ? empType.name : 'All Employees';
  }

  get violationTypeName(): string {
    const violType = this.violationTypes.find(
      (v) => v.id == this.SelectedViolationTypeId
    );
    return violType ? violType.name : 'All Violation Types';
  }

  getInfoRows(): any[] {
    const selectedEmpType = this.empTypes.find(
      (e) => e.id == this.SelectedEmployeeTypeId
    );
    const selectedViolationType = this.violationTypes.find(
      (v) => v.id == this.SelectedViolationTypeId
    );

    return [
      {
        keyEn: 'Employee Type: ' + selectedEmpType?.name,
        keyAr: 'نوع الموظف: ' + selectedEmpType?.name,
      },
      {
        keyEn: 'Violation Type: ' + selectedViolationType?.name,
        keyAr: 'نوع المخالفة: ' + selectedViolationType?.name,
      },
      {
        keyEn: 'Start Date: ' + this.SelectedStartDate,
        keyAr: 'تاريخ البدء: ' + this.SelectedStartDate,
      },
      {
        keyEn: 'End Date: ' + this.SelectedEndDate,
        keyAr: 'تاريخ الانتهاء: ' + this.SelectedEndDate,
      },
      {
        keyEn: 'Generated On: ' + new Date().toLocaleDateString(),
        keyAr: 'تم الإنشاء في: ' + new Date().toLocaleDateString(),
      },
    ];
  }

  private prepareExportData(): void {
    this.tableDataForExport = this.tableData.map((item) => ({
      ID: item.id,
      Date: item.date,
      'Violation Type': item.violationType,
      'Employee Type': item.employeeType,
      'Employee Name': item.employeeEnglishName,
      Details: item.details || '-',
    }));
  }

  getSelectedEmployeeTypeName(): string {
    return (
      this.empTypes.find((e) => e.id == this.SelectedEmployeeTypeId)?.name ||
      'All'
    );
  }

  getSelectedViolationTypeName(): string {
    return (
      this.violationTypes.find((v) => v.id == this.SelectedViolationTypeId)
        ?.name || 'All'
    );
  }

  getTableDataWithHeader(): any[] {
    return [
      {
        header: 'Violation Report',
        summary: this.getInfoRows(),
        table: {
          headers: ['ID', 'Date', 'Employee Name', 'Details'],
          data: this.tableData.map((item) => ({
            ID: item.id,
            Date: item.date,

            'Employee Name': item.employeeEnglishName,
            Details: item.details,
          })),
        },
      },
    ];
  }

  Print() {
    if (this.tableDataForExport.length === 0) {
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
    if (this.tableDataForExport.length === 0) {
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }

    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }

  async DownloadAsExcel() {
    if (!this.tableData || this.tableData.length === 0) {
      Swal.fire({
        title: 'No Data',
        text: 'No data available for export.',
        icon: 'info',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      // Prepare table data for export
      const tableData = this.tableData.map((item) => [
        item.id,
        item.date,
        item.violationType,
        item.employeeType,
        item.employeeEnglishName,
        item.details || '-',
      ]);

      const infoRows = [
        { key: 'Employee Type', value: this.employeeTypeName || 'All' },
        { key: 'Violation Type', value: this.violationTypeName || 'All' },
        { key: 'Start Date', value: this.SelectedStartDate },
        { key: 'End Date', value: this.SelectedEndDate },
        { key: 'Generated On', value: new Date().toLocaleDateString() },
      ];

      const headers = ['ID', 'Date', 'Violation Type', 'Employee Type', 'Employee Name', 'Details'];

      // Generate the Excel report using the service - skip the image to avoid the error
      await this.reportsService.generateExcelReport({
        mainHeader: {
          en: 'Violation Report',
          ar: 'تقرير المخالفات',
        },
        subHeaders: [
          {
            en: 'Detailed Violation Summary',
            ar: 'ملخص المخالفات التفصيلي',
          },
        ],
        infoRows: infoRows,
        reportImage: undefined,
        tables: [
          {
            // title: 'Violation Data',
            headers: headers,
            data: tableData,
          },
        ],
        filename: `Violation_Report_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`,
      });
    } catch (error) {
      console.error('Error generating Excel report:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to generate Excel report.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }

  get generatedOn(): string {
    return new Date().toLocaleDateString();
  }
}
