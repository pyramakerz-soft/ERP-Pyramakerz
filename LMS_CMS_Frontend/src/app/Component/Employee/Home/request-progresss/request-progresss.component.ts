import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RequestStateCount } from '../../../../Models/Dashboard/dashboard.models';

@Component({
  selector: 'app-request-progress',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="p-6 bg-white rounded-xl shadow border">
      <h2 class="font-semibold mb-4">{{ 'Request Status' | translate }}</h2>
      <hr class="mb-4">
      
      <div class="space-y-4">
        <!-- Progress Bar -->
        <div class="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            class="absolute h-full bg-[#2D8A39] transition-all duration-500"
            [style.width.%]="acceptedPercentage"
          ></div>
          <div 
            class="absolute h-full bg-[#F6A723] transition-all duration-500"
            [style.left.%]="acceptedPercentage"
            [style.width.%]="pendingPercentage"
          ></div>
          <div 
            class="absolute h-full bg-[#E2341D] transition-all duration-500"
            [style.left.%]="acceptedPercentage + pendingPercentage"
            [style.width.%]="declinedPercentage"
          ></div>
        </div>

        <!-- Legend -->
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-[#2D8A39] rounded"></div>
            <div>
              <p class="font-semibold">{{ requestStateCount?.acceptedRequestCount || 0 }}</p>
              <p class="text-gray-500">{{ 'Accepted' | translate }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-[#F6A723] rounded"></div>
            <div>
              <p class="font-semibold">{{ requestStateCount?.requestPending || 0 }}</p>
              <p class="text-gray-500">{{ 'Pending' | translate }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-[#E2341D] rounded"></div>
            <div>
              <p class="font-semibold">{{ requestStateCount?.declinedRequestCount || 0 }}</p>
              <p class="text-gray-500">{{ 'Declined' | translate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RequestProgressComponent implements OnChanges {
  @Input() requestStateCount?: RequestStateCount;
  
  acceptedPercentage: number = 0;
  pendingPercentage: number = 0;
  declinedPercentage: number = 0;

  ngOnChanges(): void {
    this.calculatePercentages();
  }

  private calculatePercentages(): void {
    // Reset percentages
    this.acceptedPercentage = 0;
    this.pendingPercentage = 0;
    this.declinedPercentage = 0;

    if (!this.requestStateCount) {
      return;
    }

    const total = this.requestStateCount.acceptedRequestCount + 
                  this.requestStateCount.requestPending + 
                  this.requestStateCount.declinedRequestCount;

    if (total > 0) {
      this.acceptedPercentage = (this.requestStateCount.acceptedRequestCount / total) * 100;
      this.pendingPercentage = (this.requestStateCount.requestPending / total) * 100;
      this.declinedPercentage = (this.requestStateCount.declinedRequestCount / total) * 100;
    }
  }
}