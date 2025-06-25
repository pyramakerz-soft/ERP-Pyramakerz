// electronic-invoice.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { School } from '../../../../Models/school';
import Swal from 'sweetalert2';
import { ZatcaService } from '../../../../Services/Employee/Zatca/zatca.service';
import { ApiService } from '../../../../Services/api.service';
import { firstValueFrom } from 'rxjs';
import { ElectronicInvoice } from '../../../../Models/zatca/electronic-invoice';
import { StateService } from '../../../../Services/Employee/Inventory/state.service';

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

  showTable = false;
  transactions: ElectronicInvoice[] = [];
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  totalRecords = 0;
  isLoading = false;

  constructor(
    private schoolService: SchoolService,
    private stateService: StateService,
    private zatcaService: ZatcaService,
    private datePipe: DatePipe,
    private apiService: ApiService,
    private router: Router
  ) {
    this.DomainName = this.apiService.GetHeader();
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
      console.log(this.schools);
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
    console.log(
      'start',
      this.selectedSchoolId,
      formattedStartDate,
      formattedEndDate,
      this.currentPage,
      this.pageSize,
      this.DomainName
    );
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
    this.saveState(); // Save state before navigating
    this.router.navigate(['/Employee/Zatca Electronic-Invoice', id]);
  }

  sendInvoice(invoice: ElectronicInvoice) {
    // Implement send functionality
    Swal.fire(
      'Success',
      `Invoice ${invoice.invoiceNumber} sent successfully`,
      'success'
    );
  }

  printInvoice(invoice: ElectronicInvoice) {
    // Implement print functionality
    window.print();
  }

  sendAll() {
    // Implement send all functionality
    Swal.fire('Success', 'All invoices sent successfully', 'success');
  }

  printAll() {
    // Implement print all functionality
    window.print();
  }

  private handleError(message: string) {
    console.error(message);
    this.isLoading = false;
    Swal.fire('Error', message, 'error');
  }
}
