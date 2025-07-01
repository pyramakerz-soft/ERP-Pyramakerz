import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-electronic-invoice',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './electronic-invoice.component.html',
  styleUrls: ['./electronic-invoice.component.css'],
  providers: [DatePipe],
})
export class ElectronicInvoiceComponent implements OnInit {
  schools: School[] = [];
  selectedSchoolId: number | null = null;
  dateFrom: string = '';
  dateTo: string = '';
  DomainName: string = '';
  currentSystem: 'zatca' | 'eta' = 'zatca';
  selectedInvoices: number[] = [];

  showTable = false;
  transactions: ElectronicInvoice[] = [];
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  totalRecords = 0;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private schoolService: SchoolService,
    private stateService: StateService,
    private zatcaService: ZatcaService,
    private etaService: EtaService,
    private datePipe: DatePipe,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.DomainName = this.apiService.GetHeader();
    this.route.data.subscribe((data) => {
      this.currentSystem = data['system'] || 'zatca';
    });
  }

  ngOnInit() {
    this.loadSchools();
    this.restoreState();
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

  private validateFilters(): { valid: boolean; message?: string } {
    if (!this.selectedSchoolId) {
      return { valid: false, message: 'Please select a school' };
    }
    if (!this.dateFrom || !this.dateTo) {
      return { valid: false, message: 'Please select both date range fields' };
    }

    const fromDate = new Date(this.dateFrom);
    const toDate = new Date(this.dateTo);

    if (fromDate > toDate) {
      return { valid: false, message: 'End date must be after start date' };
    }

    return { valid: true };
  }

  async viewReport() {
    const validation = this.validateFilters();
    if (!validation.valid) {
      Swal.fire('Error', validation.message, 'error');
      return;
    }

    this.isLoading = true;
    this.showTable = false;

    try {
      const formattedStartDate = this.formatDateForApi(this.dateFrom);
      const formattedEndDate = this.formatDateForApi(this.dateTo);

      const response = await firstValueFrom(
        this.currentSystem === 'zatca'
          ? this.zatcaService.filterBySchoolAndDate(
              this.selectedSchoolId!,
              formattedStartDate,
              formattedEndDate,
              this.currentPage,
              this.pageSize,
              this.DomainName
            )
          : this.zatcaService.filterBySchoolAndDate(
              this.selectedSchoolId!,
              formattedStartDate,
              formattedEndDate,
              this.currentPage,
              this.pageSize,
              this.DomainName
            )
      );

      this.processApiResponse(response);
      this.showTable = true;
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
  }

  private formatDateForApi(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.viewReport();
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

  sendInvoice(invoice: ElectronicInvoice) {
    this.isSubmitting = true;

    const serviceCall =
      this.currentSystem === 'zatca'
        ? this.zatcaService.reportInvoice(invoice.id, this.DomainName)
        : this.etaService.submitInvoice(invoice.id, 0, 0, this.DomainName);

    serviceCall.subscribe({
      next: () => {
        Swal.fire(
          'Success',
          `Invoice ${
            this.currentSystem === 'zatca'
              ? 'reported to ZATCA'
              : 'submitted to ETA'
          } successfully`,
          'success'
        );
        invoice.isValid = true;
      },
      error: (error) => {
        this.handleError(
          `Failed to ${
            this.currentSystem === 'zatca' ? 'report' : 'submit'
          } invoice`,
          error
        );
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  sendAll() {
    if (this.selectedInvoices.length === 0) {
      this.selectedInvoices = this.transactions.map((t) => t.id);

      if (this.selectedInvoices.length === 0) {
        Swal.fire('Warning', 'No invoices available to send', 'warning');
        return;
      }
    }

    this.isSubmitting = true;

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

    serviceCall.subscribe({
      next: () => {
        Swal.fire(
          'Success',
          `Invoices ${
            this.currentSystem === 'zatca'
              ? 'reported to ZATCA'
              : 'submitted to ETA'
          } successfully`,
          'success'
        );
        this.transactions.forEach((t) => {
          if (this.selectedInvoices.includes(t.id)) t.isValid = true;
        });
        this.selectedInvoices = [];
      },
      error: (error) => {
        this.handleError(
          `Failed to ${
            this.currentSystem === 'zatca' ? 'report' : 'submit'
          } invoices`,
          error
        );
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  printAll() {
    if (this.transactions.length === 0) {
      Swal.fire('Warning', 'No data to print', 'warning');
      return;
    }
    window.print();
  }

  private handleError(message: string, error?: any) {
    console.error(message, error);
    this.isLoading = false;
    this.isSubmitting = false;
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
    });
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
}
