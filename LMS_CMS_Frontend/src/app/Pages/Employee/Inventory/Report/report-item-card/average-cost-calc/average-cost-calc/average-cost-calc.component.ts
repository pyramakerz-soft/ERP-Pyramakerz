import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { InventoryDetailsService } from '../../../../../../../Services/Employee/Inventory/inventory-details.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-average-cost-calc',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './average-cost-calc.component.html',
  styleUrl: './average-cost-calc.component.css',
})
export class AverageCostCalcComponent {
  dateFrom: string = '';
  dateTo: string = '';
  isLoading: boolean = false;
  progress: number = 0;
  calculationComplete: boolean = false;
  message: string = '';
  errorMessage: string = '';

  constructor(
    private inventoryDetailsService: InventoryDetailsService,
    private router: Router
  ) {}

  validateDateRange(): boolean {
    if (!this.dateFrom || !this.dateTo) {
      return true;
    }

    const fromDate = new Date(this.dateFrom);
    const toDate = new Date(this.dateTo);

    if (fromDate > toDate) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date Range',
        text: '"Date From" cannot be after "Date To"',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
      return false;
    }
    return true;
  }

  formatDateForAPI(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '';
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDateChange() {
    if (this.dateFrom && this.dateTo) {
      this.validateDateRange();
    }
  }

  async calculateAverage() {
    if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
      Swal.fire({
        title: 'Invalid Date Range',
        text: 'Start date cannot be later than end date.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.isLoading = true;
    this.calculationComplete = false;
    this.progress = 0;
    this.message = 'Starting calculation...';
    this.errorMessage = '';

    try {
      const formattedFromDate = this.formatDateForAPI(this.dateFrom);
      const formattedToDate = this.formatDateForAPI(this.dateTo);

      // TODO: Replace with new endpoint when available
      // await this.inventoryDetailsService.getAverageCostTable(
      //   formattedFromDate,
      //   formattedToDate,
      //   this.inventoryDetailsService.ApiServ.GetHeader()
      // ).toPromise().then(response => {
      //   console.log('Average Cost Table Response:', response);
      // });

      this.message = 'Waiting for new endpoint implementation...';
    } catch (error) {
      console.error('Error calculating average cost:', error);
      this.message = '';
      this.errorMessage = 'Error calculating average cost. Please try again.';
      this.progress = 0;
    } finally {
      this.isLoading = false;
    }
  }

  dismiss() {
    this.router.navigate(['/Employee/report item card with average']);
    this.errorMessage = '';
  }
}
