import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-filter-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-header.component.html',
})
export class FilterHeaderComponent {
  selectedTab: 'Week' | 'Month' | 'Year' | 'Custom' = 'Month';
  currentDate = new Date();

  get formattedDate(): string {
    const month = this.currentDate.toLocaleString('default', { month: 'long' });
    const year = this.currentDate.getFullYear();
    return `${month} ${year}`;
  }

  selectTabTyped(tab: string) {
    this.selectedTab = tab as 'Week' | 'Month' | 'Year' | 'Custom';
  }

  changeMonth(delta: number) {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    this.currentDate = new Date(this.currentDate);
  }
}
