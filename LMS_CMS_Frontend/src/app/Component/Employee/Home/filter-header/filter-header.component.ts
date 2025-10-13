import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-filter-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-header.component.html',
})
export class FilterHeaderComponent {
  // selectedTab: 'Week' | 'Month' | 'Year' | 'Custom' = 'Month';
  // currentDate = new Date();

  // get formattedDate(): string {
  //   const month = this.currentDate.toLocaleString('default', { month: 'long' });
  //   const year = this.currentDate.getFullYear();
  //   return `${month} ${year}`;
  // }

  // selectTabTyped(tab: string) {
  //   this.selectedTab = tab as 'Week' | 'Month' | 'Year' | 'Custom';
  // }

  // changeMonth(delta: number) {
  //   this.currentDate.setMonth(this.currentDate.getMonth() + delta);
  //   this.currentDate = new Date(this.currentDate);
  // }

  currentYear: number = new Date().getFullYear();
  selectedMonthIndex: number | null = null;
  // mode: 'year' | 'month' = 'year';

  // months: string[] = [
  //   'January', 'February', 'March', 'April', 'May', 'June',
  //   'July', 'August', 'September', 'October', 'November', 'December'
  // ];

  // @Output() selectionChanged = new EventEmitter<{ year: number; month?: number }>();

  // toggleMode() {
  //   this.mode = this.mode === 'year' ? 'month' : 'year';

  //   if (this.mode === 'year') {
  //     // Reset month when switching to year mode
  //     this.selectedMonthIndex = null;
  //   } else if (this.mode === 'month' && this.selectedMonthIndex === null) {
  //     // Optional: Select current month by default when switching to month mode
  //     this.selectedMonthIndex = new Date().getMonth();
  //   }

  //   this.emitSelection();
  // }

  // prevYear() {
  //   this.currentYear--;
  //   this.emitSelection();
  // }

  // nextYear() {
  //   this.currentYear++;
  //   this.emitSelection();
  // }

  // selectMonth(index: number) {
  //   this.selectedMonthIndex = index;
  //   this.emitSelection();
  // }

  // emitSelection() {
  //   if (this.mode === 'month' && this.selectedMonthIndex !== null) {
  //     this.selectionChanged.emit({ year: this.currentYear, month: this.selectedMonthIndex + 1 });
  //   } else if (this.mode === 'year') {
  //     this.selectionChanged.emit({ year: this.currentYear });
  //   }
  // }

  modes: ('Month' | 'Year')[] = ['Month', 'Year'];
  selectedMode: 'Month' | 'Year' = 'Year';

  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  @Output() selectionChanged = new EventEmitter<{ year: number; month?: number }>();

  selectMode(mode: 'Month' | 'Year') {
    this.selectedMode = mode;

    if (mode === 'Year') {
      this.selectedMonthIndex = null;
    } else if (mode === 'Month' && this.selectedMonthIndex === null) {
      this.selectedMonthIndex = new Date().getMonth();
    }

    this.emitSelection();
  }

  prevYear() {
    this.currentYear--;
    this.emitSelection();
  }

  nextYear() {
    this.currentYear++;
    this.emitSelection();
  }

  selectMonth(index: number) {
    this.selectedMonthIndex = index;
    this.emitSelection();
  }

  emitSelection() {
    if (this.selectedMode === 'Month' && this.selectedMonthIndex !== null) {
      this.selectionChanged.emit({ year: this.currentYear, month: this.selectedMonthIndex + 1 });
    } else if (this.selectedMode === 'Year') {
      this.selectionChanged.emit({ year: this.currentYear });
    }
  }
}
