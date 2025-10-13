import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-filter-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-header.component.html',
})
export class FilterHeaderComponent { 
  currentYear: number = new Date().getFullYear();
  selectedMonthIndex: number | null = null; 
  modes: ('Month' | 'Year')[] = ['Month', 'Year'];
  selectedMode: 'Month' | 'Year' = 'Year';

  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  monthDropdownOpen = false;

  @Output() selectionChanged = new EventEmitter<{ year: number; month?: number }>();
  @ViewChild('monthDropdownWrapper') monthDropdownWrapper!: ElementRef;

  constructor(private eRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (
      this.monthDropdownOpen &&
      this.monthDropdownWrapper &&
      !this.monthDropdownWrapper.nativeElement.contains(event.target)
    ) {
      this.monthDropdownOpen = false;
    }
  }
  
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
    this.monthDropdownOpen = false; 
    this.emitSelection();
  }

  toggleMonthDropdown() {
    this.monthDropdownOpen = !this.monthDropdownOpen;
  } 

  emitSelection() {
    if (this.selectedMode === 'Month' && this.selectedMonthIndex !== null) {
      this.selectionChanged.emit({ year: this.currentYear, month: this.selectedMonthIndex + 1 });
    } else if (this.selectedMode === 'Year') {
      this.selectionChanged.emit({ year: this.currentYear });
    }
  } 
}
