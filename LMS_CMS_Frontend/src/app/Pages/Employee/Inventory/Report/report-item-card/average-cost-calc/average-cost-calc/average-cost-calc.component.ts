import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { InventoryDetailsService } from '../../../../../../../Services/Employee/Inventory/inventory-details.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-average-cost-calc',
  standalone: true,
  imports: [FormsModule, CommonModule , TranslateModule],
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
  isRtl: boolean = false;
  subscription!: Subscription;  
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private inventoryDetailsService: InventoryDetailsService,
    private router: Router,
    private languageService: LanguageService, 
  ) {}


  
  ngOnInit() {
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
    if (!this.validateDateRange()) {
      return;
    }

    this.isLoading = true;
    this.calculationComplete = false;
    this.progress = 0;
    // this.message = 'Starting calculation...';
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const formattedFromDate = this.formatDateForAPI(this.dateFrom);
      const formattedToDate = this.formatDateForAPI(this.dateTo);

      // Simulate progress (remove this in production)
      const progressInterval = setInterval(() => {
        this.progress += 10;
        if (this.progress >= 90) clearInterval(progressInterval);
      }, 300);

      const response = await this.inventoryDetailsService
        .GetAverageCost(
          formattedFromDate,
          formattedToDate,
          this.inventoryDetailsService.ApiServ.GetHeader()
        )
        .toPromise();

      clearInterval(progressInterval);
      this.progress = 100;

      if (response && response.length > 0) {
        this.successMessage =
          'Average cost calculation completed successfully!';
        this.message = `Processed ${response.length} items.`;
      } else {
        this.successMessage =
          'Calculation completed';
      }

      this.calculationComplete = true;
    } catch (error) {
      console.error('Error calculating average cost:', error);
      this.errorMessage = 'Error calculating average cost. Please try again.';
      this.progress = 0;
    } finally {
      this.isLoading = false;
    }
  }

  dismiss() {
    this.router.navigate(['/Employee/report item card with average']);
    this.resetForm();
  }

  private resetForm() {
    this.dateFrom = '';
    this.dateTo = '';
    this.progress = 0;
    this.message = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.calculationComplete = false;
  }
}
