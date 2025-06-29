// electronic-invoice.component.ts
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
  currentSystem: 'zatca' | 'eta' = 'zatca'; // Will be overridden by route data
  selectedInvoices: number[] = [];

  showTable = false;
  transactions: ElectronicInvoice[] = [];
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  totalRecords = 0;
  isLoading = false;

  // Modify the constructor to include ActivatedRoute
  constructor(
    private schoolService: SchoolService,
    private stateService: StateService,
    private zatcaService: ZatcaService,
    private etaService: EtaService,
    private datePipe: DatePipe,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute // Add this
  ) {
    this.DomainName = this.apiService.GetHeader();
    // Get the system from route data
    this.route.data.subscribe((data) => {
      this.currentSystem = data['system'] || 'zatca'; // Default to zatca if not specified
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
      this.handleError('Failed to load schools');
    }
  }

  viewReport() {
    if (!this.selectedSchoolId || !this.dateFrom || !this.dateTo) {
      Swal.fire('Error', 'Please select school and date range', 'error');
      return;
    }

    this.isLoading = true;
    this.showTable = false;

    const formattedStartDate = this.formatDateForApi(this.dateFrom);
    const formattedEndDate = this.formatDateForApi(this.dateTo);

    this.zatcaService
      .filterBySchoolAndDate(
        this.selectedSchoolId,
        formattedStartDate,
        formattedEndDate,
        this.currentPage,
        this.pageSize,
        this.DomainName
      )
      .subscribe({
        next: (response: any) => {
          this.processApiResponse(response);
          this.showTable = true;
          this.isLoading = false;
        },
        error: (error) => {
          this.handleError('Failed to load transactions');
        },
      });
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
    if (this.currentSystem == 'zatca') {
      console.log('zatcaaa');
      console.log(invoice.id);
      this.zatcaService.reportInvoice(invoice.id, this.DomainName).subscribe({
        next: () => {
          Swal.fire(
            'Success',
            'Invoice reported to ZATCA successfully',
            'success'
          );
          invoice.isValid = true;
        },
        error: (error) => {
          Swal.fire('Error', 'Failed to report invoice to ZATCA', 'error');
        },
      });
    } else {
      console.log('eta');
      this.etaService
        .submitInvoice(invoice.id, 0, 0, this.DomainName)
        .subscribe({
          next: () => {
            Swal.fire(
              'Success',
              'Invoice submitted to ETA successfully',
              'success'
            );
            invoice.isValid = true;
          },
          error: (error) => {
            Swal.fire('Error', 'Failed to submit invoice to ETA', 'error');
          },
        });
    }
  }

  sendAll() {
    // If no invoices are selected, select all automatically
    if (this.selectedInvoices.length === 0) {
      this.selectedInvoices = this.transactions.map((t) => t.id);

      // If still no invoices (empty transactions array), show warning
      if (this.selectedInvoices.length === 0) {
        Swal.fire('Warning', 'No invoices available to send', 'warning');
        return;
      }
    }

    if (this.currentSystem == 'zatca') {
      console.log(this.selectedInvoices);
      this.zatcaService
        .reportInvoices(
          this.selectedSchoolId!,
          this.selectedInvoices,
          this.DomainName
        )
        .subscribe({
          next: () => {
            Swal.fire(
              'Success',
              'Invoices reported to ZATCA successfully',
              'success'
            );
            this.transactions.forEach((t) => {
              if (this.selectedInvoices.includes(t.id)) t.isValid = true;
            });
            this.selectedInvoices = [];
          },
          error: (error) => {
            Swal.fire('Error', 'Failed to report invoices to ZATCA', 'error');
          },
        });
    } else {
      this.etaService
        .submitInvoices(
          this.selectedSchoolId!,
          this.selectedInvoices,
          this.DomainName
        )
        .subscribe({
          next: () => {
            Swal.fire(
              'Success',
              'Invoices submitted to ETA successfully',
              'success'
            );
            this.transactions.forEach((t) => {
              if (this.selectedInvoices.includes(t.id)) t.isValid = true;
            });
            this.selectedInvoices = [];
          },
          error: (error) => {
            Swal.fire('Error', 'Failed to submit invoices to ETA', 'error');
          },
        });
    }
  }

  printInvoice(invoice: ElectronicInvoice) {
    window.print();
  }

  printAll() {
    window.print();
  }

  private handleError(message: string) {
    console.error(message);
    this.isLoading = false;
    Swal.fire('Error', message, 'error');
  }
}
