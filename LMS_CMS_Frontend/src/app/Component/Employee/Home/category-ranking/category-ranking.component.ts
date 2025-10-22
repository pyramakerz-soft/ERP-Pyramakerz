import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryRankings } from '../../../../Models/Dashboard/dashboard.models';

@Component({
  selector: 'app-category-rankings',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="p-4 bg-white rounded shadow">
      <!-- Total Orders -->
      <div class="text-center mb-4">
        <h2 class="text-3xl font-bold text-gray-900">{{ categoryRankings?.totalOrders || 0 }}</h2>
        <p class="text-sm text-gray-500">{{ 'Total' | translate }} {{ 'Orders' | translate }}</p>
        <p class="text-sm text-gray-500">{{ 'Number of orders placed' | translate }}</p>
      </div>

      <hr class="my-4" />

      <!-- Top Categories -->
      <h3 class="text-sm font-semibold text-gray-700 mb-2">
        {{ 'Top' | translate }} {{ 'Categories' | translate }}
      </h3>
      <div class="bg-gray-50 p-3 rounded-lg space-y-3 mb-4">
        <div *ngFor="let category of categoryRankings?.categoryRanking; let i = index">
          <div class="flex justify-between text-sm text-gray-700 font-medium mb-1">
            <span>{{ category.categoryName }}</span>
            <span>{{ 'EGP' | translate }} {{ category.totalCategoryCount }}</span>
          </div>
          <div class="h-1.5 rounded-full" [ngClass]="getProgressBarBgClass(i)">
            <div 
              class="h-full rounded-full transition-all duration-500" 
              [ngClass]="getProgressBarFgClass(i)"
              [style.width.%]="calculateCategoryPercentage(category.totalCategoryCount)"
            ></div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div *ngIf="!categoryRankings?.categoryRanking || categoryRankings?.categoryRanking?.length === 0" 
             class="text-center text-gray-400 py-4">
          {{ 'No category data available' | translate }}
        </div>
      </div>

      <!-- Top Products -->
      <h3 class="text-sm font-semibold text-gray-700 mb-2">
        {{ 'Top' | translate }} {{ 'Products' | translate }}
      </h3>
      <div class="bg-gray-50 p-3 rounded-lg space-y-3 mb-4">
        <div *ngFor="let category of categoryRankings?.categoryRanking" 
             class="flex justify-between items-center text-sm">
          <div>
            <p class="text-gray-800 font-medium">{{ category.shopItem.itemName }}</p>
            <p class="text-gray-500">{{ 'Sold' | translate }} {{ category.shopItem.totalQuantitySold }}</p>
          </div>
          <p class="font-medium text-gray-700">{{ 'EGP' | translate }} {{ category.shopItem.totalQuantitySold }}</p>
        </div>
        
        <!-- Empty state -->
        <div *ngIf="!categoryRankings?.categoryRanking || categoryRankings?.categoryRanking?.length === 0" 
             class="text-center text-gray-400 py-4">
          {{ 'No product data available' | translate }}
        </div>
      </div>
    </div>
  `
})
export class CategoryRankingsComponent {
  @Input() categoryRankings?: CategoryRankings;
  
  private maxCategoryValue: number = 0;

  ngOnChanges(): void {
    this.calculateMaxValue();
  }

  private calculateMaxValue(): void {
    if (!this.categoryRankings?.categoryRanking || this.categoryRankings.categoryRanking.length === 0) {
      this.maxCategoryValue = 0;
      return;
    }
    
    this.maxCategoryValue = Math.max(
      ...this.categoryRankings.categoryRanking.map(c => c.totalCategoryCount)
    );
  }

  calculateCategoryPercentage(value: number): number {
    if (this.maxCategoryValue === 0) return 0;
    return (value / this.maxCategoryValue) * 100;
  }

  getProgressBarBgClass(index: number): string {
    const colors = ['bg-blue-100', 'bg-yellow-100', 'bg-purple-100', 'bg-green-100', 'bg-red-100'];
    return colors[index % colors.length];
  }

  getProgressBarFgClass(index: number): string {
    const colors = ['bg-blue-500', 'bg-yellow-400', 'bg-purple-400', 'bg-green-500', 'bg-red-500'];
    return colors[index % colors.length];
  }
}