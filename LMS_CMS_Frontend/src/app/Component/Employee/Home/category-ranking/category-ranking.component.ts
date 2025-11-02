import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
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

      <!-- Merged Categories & Products -->
      <h3 class="text-sm font-semibold text-gray-700 mb-2">
        {{ 'Top' | translate }} {{ 'Categories' | translate }} & {{ 'Products' | translate }}
      </h3>
      <div class="bg-gray-50 p-3 rounded-lg space-y-4 mb-4">
        <div *ngFor="let category of categoryRankings?.categoryRanking; let i = index" 
             class="cursor-pointer hover:bg-white p-2 rounded-lg transition-all duration-300">
          <!-- Category Title with Total Sales -->
          <div class="flex justify-between text-sm text-gray-700 font-medium mb-2">
            <span class="font-semibold">{{ category.categoryName }}</span>
            <span class="text-gray-600">{{ category.totalCategoryCount }} {{ 'sold' | translate }}</span>
          </div>
          
          <!-- Progress Bar with Hover Tooltips -->
          <div class="relative h-4 rounded-full overflow-hidden" [ngClass]="getProgressBarBgClass(i)">
            <!-- Category Bar (Background) -->
            <div 
              class="absolute h-full rounded-full transition-all duration-500 group" 
              [ngClass]="getProgressBarFgClass(i)"
              [style.width.%]="calculateCategoryPercentage(category.totalCategoryCount)"
              (mouseenter)="showTooltip($event, 'other', category, i)"
              (mousemove)="updateTooltipPosition($event)"
              (mouseleave)="hideTooltip()">
            </div>
            
            <!-- Top Item Bar (Foreground) -->
            <div 
              class="absolute h-full rounded-full transition-all duration-500 shadow-lg group z-10" 
              [ngClass]="getTopItemBarClass(i)"
              [style.width.%]="calculateItemPercentage(category.shopItem.totalQuantitySold)"
              (mouseenter)="showTooltip($event, 'topItem', category, i)"
              (mousemove)="updateTooltipPosition($event)"
              (mouseleave)="hideTooltip()">
            </div>
          </div>
          
          <!-- Permanently Visible Info -->
          <div class="mt-2 text-xs text-gray-600 pl-2">
            <div class="flex justify-between items-center">
              <span>
                <span class="font-medium text-gray-800">{{ 'Top Item' | translate }}:</span> 
                {{ category.shopItem.itemName }}
              </span>
              <span class="font-semibold text-gray-700">{{ category.shopItem.totalQuantitySold }} {{ 'sold' | translate }}</span>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div *ngIf="!categoryRankings?.categoryRanking || categoryRankings?.categoryRanking?.length === 0" 
             class="text-center text-gray-400 py-4">
          {{ 'No data available' | translate }}
        </div>
      </div>

      <!-- Custom Tooltip -->
      <div 
        *ngIf="tooltipData.visible"
        class="fixed pointer-events-none z-50 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm"
        [style.left.px]="tooltipData.x"
        [style.top.px]="tooltipData.y"
        [style.transform]="'translate(-50%, -120%)'">
        <div class="font-semibold">{{ tooltipData.label }}</div>
        <div>{{ tooltipData.value }} {{ 'sold' | translate }}</div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CategoryRankingsComponent {
  @Input() categoryRankings?: CategoryRankings;
  
  private maxCategoryValue: number = 0;
  
  tooltipData = {
    visible: false,
    x: 0,
    y: 0,
    label: '',
    value: 0
  };

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

  calculateItemPercentage(value: number): number {
    if (this.maxCategoryValue === 0) return 0;
    return (value / this.maxCategoryValue) * 100;
  }

  getProgressBarBgClass(index: number): string {
    const colors = ['bg-blue-100', 'bg-yellow-100', 'bg-purple-100', 'bg-green-100', 'bg-red-100'];
    return colors[index % colors.length];
  }

  getProgressBarFgClass(index: number): string {
    const colors = ['bg-blue-300', 'bg-yellow-300', 'bg-purple-300', 'bg-green-300', 'bg-red-300'];
    return colors[index % colors.length];
  }

  getTopItemBarClass(index: number): string {
    const colors = ['bg-blue-600', 'bg-yellow-500', 'bg-purple-600', 'bg-green-600', 'bg-red-600'];
    return colors[index % colors.length];
  }

  showTooltip(event: MouseEvent, type: 'topItem' | 'other', category: any, index: number): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    
    if (type === 'topItem') {
      this.tooltipData = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        label: category.shopItem.itemName,
        value: category.shopItem.totalQuantitySold
      };
    } else {
      const otherItemsCount = category.totalCategoryCount - category.shopItem.totalQuantitySold;
      this.tooltipData = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        label: 'Other Items',
        value: otherItemsCount
      };
    }
  }

  updateTooltipPosition(event: MouseEvent): void {
    if (this.tooltipData.visible) {
      this.tooltipData.x = event.clientX;
      this.tooltipData.y = event.clientY;
    }
  }

  hideTooltip(): void {
    this.tooltipData.visible = false;
  }
}