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

  constructor(
    private inventoryDetailsService: InventoryDetailsService,
    private router: Router
  ) {}

  validateDateRange(): boolean {
    if (!this.dateFrom || !this.dateTo) {
      return true; // Let the required field validation handle empty cases
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
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
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

    try {
      const formattedFromDate = this.formatDateForAPI(this.dateFrom);
      const formattedToDate = this.formatDateForAPI(this.dateTo);

      // Simulate progress updates
      const interval = setInterval(() => {
        this.progress += 10;
        if (this.progress >= 90) clearInterval(interval);
        this.message = `Calculating... ${this.progress}%`;
      }, 300);

      await this.inventoryDetailsService
        .getMovingAverageCost(
          0, // storeId
          0, // shopItemId
          formattedFromDate,
          formattedToDate,
          this.inventoryDetailsService.ApiServ.GetHeader()
        )
        .toPromise();

      clearInterval(interval);
      this.progress = 100;
      this.message = 'Calculation completed successfully';
      this.calculationComplete = true;
    } catch (error) {
      console.error('Error calculating average cost:', error);
      this.message = 'Error calculating average cost';
      this.progress = 0;
    } finally {
      this.isLoading = false;
    }
  }

  dismiss() {
    this.router.navigate(['../']);
  }
}
