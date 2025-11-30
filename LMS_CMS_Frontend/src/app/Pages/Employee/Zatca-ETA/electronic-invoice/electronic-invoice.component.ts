import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { School } from '../../../../Models/school';
import Swal from 'sweetalert2';
import { ZatcaService } from '../../../../Services/Employee/Zatca/zatca.service';
import { ApiService } from '../../../../Services/api.service';
import { firstValueFrom } from 'rxjs';
import { ElectronicInvoice } from '../../../../Models/zatca/electronic-invoice';
import { StateService } from '../../../../Services/Employee/Inventory/state.service';
import { EtaService } from '../../../../Services/Employee/ETA/eta.service';
import { PdfPrintComponent } from '../../../../Component/pdf-print/pdf-print.component';
// import * as XLSX from 'xlsx';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
@Component({
  selector: 'app-electronic-invoice',
  standalone: true,
  imports: [FormsModule, CommonModule, PdfPrintComponent , TranslateModule],
  templateUrl: './electronic-invoice.component.html',
  styleUrls: ['./electronic-invoice.component.css'],
  providers: [DatePipe],
})

@InitLoader()
export class ElectronicInvoiceComponent implements OnInit {
  schools: School[] = [];
  selectedSchoolId: number | null = null;
  dateFrom: string = '';
  dateTo: string = '';
  DomainName: string = '';
  currentSystem: 'zatca' | 'eta' = 'zatca';
  selectedInvoices: number[] = [];
  isRtl: boolean = false;
  subscription!: Subscription;
  showTable = false;
  showViewReportBtn = false;
  transactions: ElectronicInvoice[] = [];
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  totalRecords = 0;
  isLoading = false;
  isSubmitting = false;

  // PDF and Export properties
  showPDF = false;
  transactionsForExport: any[] = [];
  school = {
    reportHeaderOneEn: 'Electronic Invoice Report',
    reportHeaderTwoEn: 'Invoice Summary',
    reportHeaderOneAr: 'تقرير الفواتير الإلكترونية',
    reportHeaderTwoAr: 'ملخص الفواتير',
    reportImage: 'assets/images/logo.png',
  };

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  sendingInvoiceId: number | null = null;

  constructor(
    private schoolService: SchoolService,
    private stateService: StateService,
    private zatcaService: ZatcaService,
    private etaService: EtaService,
    private languageService: LanguageService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute, 
    private translate: TranslateService,
    private loadingService: LoadingService 
  ) {
    this.DomainName = this.apiService.GetHeader();
    this.route.data.subscribe((data) => {
      this.currentSystem = data['system'] || 'zatca';
    });
  }

  ngOnInit() {
    this.loadSchools();
    this.restoreState();

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

    private showErrorAlert(errorMessage: string) {
    const translatedTitle = this.translate.instant('Error');
    const translatedButton = this.translate.instant('Okay');

    Swal.fire({
      icon: 'error',
      title: translatedTitle,
      text: errorMessage,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  private showSuccessAlert(message: string) {
    const translatedTitle = this.translate.instant('Success');
    const translatedButton = this.translate.instant('Okay');

    Swal.fire({
      icon: 'success',
      title: translatedTitle,
      text: message,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  private restoreState() {
    const savedState = this.stateService.getInvoiceState();
    if (savedState) {
      this.selectedSchoolId = savedState.selectedSchoolId;
      this.dateFrom = savedState.dateFrom;
      this.dateTo = savedState.dateTo;
      this.transactions = savedState.transactions;
      this.currentPage = savedState.currentPage;
      this.totalPages = savedState.totalPages;
      this.pageSize = savedState.pageSize;
      this.totalRecords = savedState.totalRecords;
      this.showTable = true;
      this.showViewReportBtn = true;
      this.stateService.clearInvoiceState();
    }
  }

  private saveState() {
    this.stateService.setInvoiceState({
      selectedSchoolId: this.selectedSchoolId,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      transactions: this.transactions,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      pageSize: this.pageSize,
      totalRecords: this.totalRecords,
    });
  }

  async loadSchools() {
    try {
      this.schools = await firstValueFrom(
        this.schoolService.Get(this.DomainName)
      );
    } catch (error) {
      this.handleError('Failed to load schools', error);
    }
  }

  onFilterChange() {
    this.showTable = false;
    this.showViewReportBtn =
      this.selectedSchoolId !== null &&
      this.dateFrom !== '' &&
      this.dateTo !== '';
    this.transactions = [];
    this.selectedInvoices = [];
  }

  async viewReport() {
    if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
      Swal.fire({
        title: this.translate.instant('Invalid Date Range'),
        text: this.translate.instant('Start date cannot be later than end date'),
        icon: 'warning',
        confirmButtonText: this.translate.instant('OK'),
      });
      return;
    }

    if (!this.selectedSchoolId) {
      Swal.fire({
        title: this.translate.instant('Missing Information'),
        text: this.translate.instant('Please select a school'),
        icon: 'warning',
        confirmButtonText: this.translate.instant('OK'),
      });
      return;
    }

    this.isLoading = true;
    this.showTable = true;
    this.transactions = [];
    this.selectedInvoices = [];

    try {
      const response = await firstValueFrom(
        this.currentSystem === 'zatca'
          ? this.zatcaService.filterBySchoolAndDate(
              this.selectedSchoolId!,
              this.dateFrom,
              this.dateTo,
              this.currentPage,
              this.pageSize,
              this.DomainName
            )
          : this.etaService.filterBySchoolAndDate(
              this.selectedSchoolId!,
              this.dateFrom,
              this.dateTo,
              this.currentPage,
              this.pageSize,
              this.DomainName
            )
      );

      this.processApiResponse(response);
    } catch (error) {
      this.handleError('Failed to load transactions', error);
    } finally {
      this.isLoading = false;
    }
  }

  private processApiResponse(response: any) {
    if (Array.isArray(response)) {
      this.transactions = response;
      this.totalRecords = response.length;
    } else if (response?.data) {
      this.transactions = response.data;
      this.totalRecords = response.totalRecords || response.data.length;
    } else {
      this.transactions = [];
      this.totalRecords = 0;
    }

    this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
    this.selectedInvoices = [];
    this.prepareExportData();
  }

  prepareExportData(): void {
    this.transactionsForExport = this.transactions.map((t) => ({
      'Invoice ID': t.id,
      Date: new Date(t.date).toLocaleDateString(),
      'Invoice Type': t.flagEnName || '-',
      'Total Value': t.total,
      Status: t.isValid ? 'Sent' : 'Not Sent',
    }));
  }

  getInfoRows(): any[] {
    return [
      { keyEn: 'From Date: ' + this.dateFrom },
      { keyEn: 'To Date: ' + this.dateTo },
      {
        keyEn:
          'School: ' +
          (this.schools.find((s) => s.id === this.selectedSchoolId)?.name ||
            'All Schools'),
      },
    ];
  }

  downloadAsPDF() {
    if (this.transactionsForExport.length === 0) {
      Swal.fire(this.translate.instant('Warning'), this.translate.instant('No data to export!'), this.translate.instant('warning'));
      return;
    }

    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }

  printSingleInvoice(invoice: ElectronicInvoice) {
    this.transactionsForExport = [
      {
        'Invoice ID': invoice.id,
        Date: new Date(invoice.date).toLocaleDateString(),
        'Invoice Type': invoice.flagEnName || '-',
        'Total Value': invoice.total,
        Status: invoice.isValid ? 'Sent' : 'Not Sent',
      },
    ];

    this.printAll();
  }

  printSelectedInvoices() {
    if (this.selectedInvoices.length === 0) {
      Swal.fire({
        title: this.translate.instant('No Selection'),
        text: this.translate.instant('Please select at least one invoice to print'),
        icon: 'warning',
        confirmButtonText: this.translate.instant('OK'),
      });
      return;
    }

    this.transactionsForExport = this.transactions
      .filter((t) => this.selectedInvoices.includes(t.id))
      .map((t) => ({
        'Invoice ID': t.id,
        Date: new Date(t.date).toLocaleDateString(),
        'Invoice Type': t.flagEnName || '-',
        'Total Value': t.total,
        Status: t.isValid ? 'Sent' : 'Not Sent',
      }));

    this.printAll();
  }

  private printAll() {
    if (this.transactionsForExport.length === 0) {
      Swal.fire(this.translate.instant('Warning'), this.translate.instant('No data to export!'), this.translate.instant('warning'));
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

  async exportExcel() {
    if (this.transactions.length === 0) {
      Swal.fire(this.translate.instant('Warning'), this.translate.instant('No data to export!'), this.translate.instant('warning'));
      return;
    } 
    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(
      this.transactions.map((t) => ({
        'Invoice ID': t.id,
        Date: new Date(t.date).toLocaleDateString(),
        'Invoice Type': t.flagEnName || '-',
        'Total Value': t.total,
        Status: t.isValid ? 'Sent' : 'Not Sent',
        School:
          this.schools.find((s) => s.id === this.selectedSchoolId)?.name ||
          '-',
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Electronic_Invoices_${dateStr}.xlsx`);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.viewReport();
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = current - half;
    let end = current + half;

    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  navigateToDetail(id: number) {
    this.saveState();
    const routePrefix =
      this.currentSystem === 'zatca'
        ? '/Employee/Zatca Electronic-Invoice'
        : '/Employee/ETA Electronic-Invoice';
    this.router.navigate([routePrefix, id]);
  }

  toggleInvoiceSelection(id: number) {
    const index = this.selectedInvoices.indexOf(id);
    if (index === -1) {
      this.selectedInvoices.push(id);
    } else {
      this.selectedInvoices.splice(index, 1);
    }
  }

  toggleSelectAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.selectedInvoices = isChecked ? this.transactions.map((t) => t.id) : [];
  }

  async sendInvoice(invoice: ElectronicInvoice) {
    this.sendingInvoiceId = invoice.id;

    try {
      const serviceCall =
        this.currentSystem === 'zatca'
          ? this.zatcaService.reportInvoice(invoice.id, this.DomainName)
          : this.etaService.submitInvoice(invoice.id, 0, 0, this.DomainName);

      await firstValueFrom(serviceCall);

      Swal.fire(
        this.translate.instant('Success'),
        `${this.translate.instant('Invoice')} ${
          this.currentSystem == 'zatca'
            ? this.translate.instant('reported to ZATCA')
            : this.translate.instant('submitted to ETA')
        } ${this.translate.instant('successfully')}`,
        this.translate.instant('success')
      );
      invoice.isValid = true;
    } catch (error) {
      let errorMessage = 'Something went wrong';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'error' in error
      ) {
        errorMessage = (error as any).error;
      }

      this.handleError(
        `${this.translate.instant('Failed to')} ${
          this.currentSystem == 'zatca' ? this.translate.instant('report') : this.translate.instant('submit')
        } ${this.translate.instant('invoice')}`,
        error
      );
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      this.sendingInvoiceId = null;
    }
  }

  async sendAll() {
    if (this.selectedInvoices.length === 0) {
      Swal.fire({
        title: this.translate.instant('No Selection'),
        text: this.translate.instant('Please select at least one invoice to send'),
        icon: 'warning',
        confirmButtonText: this.translate.instant('OK'),
      });
      return;
    }

    this.isSubmitting = true;

    try {
      const serviceCall =
        this.currentSystem === 'zatca'
          ? this.zatcaService.reportInvoices(
              this.selectedSchoolId!,
              this.selectedInvoices,
              this.DomainName
            )
          : this.etaService.submitInvoices(
              this.selectedSchoolId!,
              this.selectedInvoices,
              this.DomainName
            );

      await firstValueFrom(serviceCall);

      Swal.fire(
        this.translate.instant('Success'),
        `${this.translate.instant('Invoice')} ${
          this.currentSystem == 'zatca'
            ? this.translate.instant('reported to ZATCA')
            : this.translate.instant('submitted to ETA')
        } ${this.translate.instant('successfully')}`,
        this.translate.instant('success')
      );

      this.transactions.forEach((t) => {
        if (this.selectedInvoices.includes(t.id)) t.isValid = true;
      });
      this.selectedInvoices = [];
    } catch (error) {
      let errorMessage = 'Something went wrong';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'error' in error
      ) {
        errorMessage = (error as any).error;
      }

      this.handleError(
        `${this.translate.instant('Failed to')} ${
          this.currentSystem == 'zatca' ? this.translate.instant('report') : this.translate.instant('submit')
        } ${this.translate.instant('invoice')}`,
        error
      );
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  private handleError(message: string, error?: any) {
    this.isLoading = false;
    this.isSubmitting = false;
  }

  get isViewReportDisabled(): boolean {
    return (
      !this.selectedSchoolId || !this.dateFrom || !this.dateTo || this.isLoading
    );
  }

  get viewReportButtonClass(): string {
    return this.isViewReportDisabled
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'secondaryBg text-white hover:bg-opacity-90';
  }

  validatePageSize(event: any) {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
    }
  }

  validateNumberForPagination(event: any): void {
    const value = event.target.value;
    this.pageSize = value ? parseInt(value, 10) : 10;
  }
}
