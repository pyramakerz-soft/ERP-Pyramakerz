import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NumberFormatService {

  constructor() { }

  formatNumber(value: any): number | string {
    if (value === null || value === undefined) return '';
    
    const numValue = Number(value);
    if (isNaN(numValue)) return value;
    
    if (Number.isInteger(numValue) || Math.abs(numValue - Math.round(numValue)) < 0.0001) {
      return Math.round(numValue); // Return as integer
    } else {
      return Math.round(numValue * 100) / 100;
    }
  }

  formatNumberForDisplay(value: any): string {
    if (value === null || value === undefined) return '';
    
    const numValue = Number(value);
    if (isNaN(numValue)) return String(value);
    
    // Check if the number is a whole number
    if (Number.isInteger(numValue) || Math.abs(numValue - Math.round(numValue)) < 0.0001) {
      return Math.round(numValue).toString(); // Return as integer string
    } else {
      // Return with proper decimal formatting
      return numValue.toFixed(2).replace(/\.?0+$/, '');
    }
  }

  formatCurrency(value: any, currencySymbol: string = '$'): string {
    const formatted = this.formatNumberForDisplay(value);
    return formatted ? `${currencySymbol}${formatted}` : '';
  }

  formatPercentage(value: any, decimalPlaces: number = 2): string {
    if (value === null || value === undefined) return '';
    
    const numValue = Number(value);
    if (isNaN(numValue)) return String(value);
    
    return `${numValue.toFixed(decimalPlaces)}%`;
  }

  isWholeNumber(value: any): boolean {
    if (value === null || value === undefined) return false;
    
    const numValue = Number(value);
    if (isNaN(numValue)) return false;
    
    return Number.isInteger(numValue) || Math.abs(numValue - Math.round(numValue)) < 0.0001;
  }
}