import { CommonModule } from '@angular/common';
import { OnChanges, Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import html2pdf from 'html2pdf.js';

interface TableSection {
  header: string;
  data: { key: string; value: any }[];
  tableHeaders: string[];
  tableData: any[];
}

@Component({
  selector: 'app-pdf-print',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './pdf-print.component.html',
  styleUrl: './pdf-print.component.css',
})
export class PdfPrintComponent implements OnChanges {
  @Input() school: any;
  @Input() tableHeaders: string[] | null = null;
  @Input() tableData: any[] | null = null;
  @Input() tableDataWithHeaderArray: TableSection[] | null = null;
  @Input() tableDataWithHeader: any[] | null = null;

  @Input() fileName: string = 'report';
  @Input() Title: string = '';
  @Input() infoRows: {
    keyEn?: string;
    valueEn?: string | number | null;
    keyAr?: string;
    valueAr?: string | number | null;
  }[] = [];
  @Input() PsNotes: {
    EnNote?: string | number | null;
    ArNote?: string | number | null;
  }[] = [];
  @ViewChild('printContainer') printContainer!: ElementRef;
  tableChunks: { headers: string[]; data: any[] }[] = [];
  preservedColumns: string = '';
  @Input() autoDownload: boolean = false;

  // Add to the component class
  @Input() accountingConstraintsData: any[] | null = null;
  @Input() fullTotals: any | null = null;

  // Language properties
  isRtl: boolean = false;
  currentLang = 'en';

  constructor(private translate: TranslateService) {
    // Subscribe to language changes
    this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.isRtl = event.lang === 'ar';
      this.updateDirection();
      this.splitTableGenerically(); // Re-split table when language changes
    });
  }

  ngOnInit() {
    // Set initial direction
    this.currentLang = this.translate.currentLang;
    this.isRtl = this.currentLang === 'ar';
    this.updateDirection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableHeaders'] || changes['tableData'] || changes['tableDataWithHeaderArray']) {
      if (this.tableHeaders) this.preservedColumns = this.tableHeaders[0];
      this.splitTableGenerically();
    }
  }

  private updateDirection() {
    if (this.printContainer) {
      const container = this.printContainer.nativeElement;
      container.dir = this.isRtl ? 'rtl' : 'ltr';
      container.classList.toggle('rtl', this.isRtl);
      container.classList.toggle('ltr', !this.isRtl);
    }
  }

  // Get display value based on current language
  getDisplayValue(item: any, header: string): string {
    if (!item || !header) return '-';
    
    const value = item[header];
    if (value === null || value === undefined) return '-';

    // Check for language-specific fields
    if (this.isRtl) {
      const arabicField = `${header}Ar` || `${header}Arabic`;
      if (item[arabicField]) {
        return item[arabicField];
      }
    } else {
      const englishField = `${header}En` || `${header}English`;
      if (item[englishField]) {
        return item[englishField];
      }
    }

    return value.toString();
  }

  // Get info row value based on current language
  getInfoRowValue(info: any): string {
    if (this.isRtl && info.valueAr !== undefined && info.valueAr !== null) {
      return info.valueAr.toString();
    } else if (info.valueEn !== undefined && info.valueEn !== null) {
      return info.valueEn.toString();
    }
    return '';
  }

  // Get info row key based on current language
  getInfoRowKey(info: any): string {
    if (this.isRtl && info.keyAr) {
      return info.keyAr;
    } else if (info.keyEn) {
      return info.keyEn;
    }
    return '';
  }

  // Get note based on current language
  getNote(note: any): string {
    if (this.isRtl && note.ArNote) {
      return note.ArNote.toString();
    } else if (note.EnNote) {
      return note.EnNote.toString();
    }
    return '';
  }

  getRtlHeaders(headers: string[]): string[] {
    return this.isRtl ? [...headers].reverse() : headers;
  }

  getRtlData(data: any[], headers: string[]): any[] {
    if (!data) return [];
    if (this.isRtl) {
        return data.map(row => {
            const reversedRow: any = {};
            [...headers].reverse().forEach(header => {
                reversedRow[header] = row[header];
            });
            return reversedRow;
        });
    }
    return data;
  }

  print() {
    const printContents = this.printContainer.nativeElement.innerHTML;

    const printStyle = `
    <style>
      @page { size: auto; margin: 0mm; }
      body { margin: 0; }
      .print-content { padding: 20px; }
      @media print {
        body * { visibility: hidden; }
        .print-overlay, .print-overlay * { visibility: visible; }
        .print-content { position: absolute; top: 0; left: 0; }
      }
    </style>
  `;

    const printOverlay = document.createElement('div');
    printOverlay.className = 'print-overlay';
    printOverlay.innerHTML = `
    <div class="print-content">
      ${printContents}
    </div>
  `;

    document.body.appendChild(printOverlay);
    document.body.insertAdjacentHTML('beforeend', printStyle);

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.removeChild(printOverlay);
        const styles = document.querySelectorAll('style[data-print-style]');
        styles.forEach((style) => document.body.removeChild(style));
      }, 100);
    }, 100);
  }

  downloadPDF() {
    if (this.school?.reportImage?.startsWith('http')) {
      this.convertImgToBase64URL(this.school.reportImage).then((base64Img) => {
        this.school.reportImage = base64Img;
        setTimeout(() => this.printPDF(), 100);
      });
    } else {
      setTimeout(() => this.printPDF(), 100);
    }
  }

  convertImgToBase64URL(url: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('');
        ctx.drawImage(img, 0, 0);
        try {
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (e) {
          console.error('toDataURL failed:', e);
          resolve('');
        }
      };
      img.onerror = (e) => {
        console.error('Failed to load image', e);
        resolve('');
      };
      img.src = url;
    });
  }

  estimateHeaderWidth(header: string): number {
    return header.length * 10;
  }

  splitTableGenerically(maxTotalWidth: number = 600) {
    this.tableChunks = [];

    if (!this.tableHeaders || !this.tableData) return;

    const preserved = this.preservedColumns;
    const headers = [...this.tableHeaders];
    let i = 0;

    while (i < headers.length) {
      let widthSum = 0;
      let headersSlice: string[] = [];

      while (i < headers.length) {
        const currentHeader = headers[i];
        const headerWidth = this.estimateHeaderWidth(currentHeader);

        if (widthSum + headerWidth > maxTotalWidth) break;

        headersSlice.push(currentHeader);
        widthSum += headerWidth;
        i++;
      }

      const finalHeaders = headersSlice.includes(preserved)
        ? headersSlice
        : [preserved, ...headersSlice];

      // Apply RTL transformation if needed
      const displayHeaders = this.getRtlHeaders(finalHeaders);
      const displayData = this.getRtlData(this.tableData, finalHeaders);

      const dataChunk = displayData.map((row) => {
        const newRow: any = {};
        displayHeaders.forEach((header) => {
          newRow[header] = this.getDisplayValue(row, header);
        });
        return newRow;
      });

      this.tableChunks.push({ headers: displayHeaders, data: dataChunk });
    }
  }

printPDF() {
  const element = this.printContainer.nativeElement;
  
  // Simple, clean configuration
  const options = {
    margin: 0.5,
    filename: `${this.fileName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  };

  const elementClone = element.cloneNode(true);
  document.body.appendChild(elementClone);
  
  // Generate PDF
  html2pdf()
    .from(elementClone)
    .set(options)
    .save()
    .finally(() => {
      // Clean up
      document.body.removeChild(elementClone);
    });
}

  getColumnWidth(header: string, totalColumns: number): any {
    const headerLower = header.toLowerCase();
    
    if (headerLower.includes('details')) {
      return { 
        width: '35%', 
        'min-width': '200px',
        'max-width': '400px',
        'word-wrap': 'break-word',
        'white-space': 'normal'
      };
    }
    
    const wideColumns = ['details', 'description', 'notes', 'comments', 'permanent drug'];
    const mediumColumns = ['name', 'title', 'address', 'employee name'];
    
    const isWideColumn = wideColumns.some(col => headerLower.includes(col));
    const isMediumColumn = mediumColumns.some(col => headerLower.includes(col));
    
    if (isWideColumn) {
      return { 
        width: '30%', 
        'min-width': '150px',
        'word-wrap': 'break-word',
        'white-space': 'normal'
      };
    } else if (isMediumColumn) {
      return { 
        width: '15%', 
        'min-width': '100px',
        'word-wrap': 'break-word',
        'white-space': 'normal'
      };
    } else {
      return { 
        width: 'auto', 
        'min-width': '80px',
        'word-wrap': 'break-word',
        'white-space': 'normal'
      };
    }
  }

  isSmallTable(data: any[]): boolean {
    return data && data.length <= 5;
  }

  isLargeTable(data: any[]): boolean {
    return data && data.length > 10;
  }

  // Add this method to PdfPrintComponent class
generateEmployeeSalaryDetailedLayout() {
  const element = this.printContainer.nativeElement;
  
  // Clear existing content
  element.innerHTML = '';

  // Create the detailed salary report structure with salary slip
  const detailedSalaryHTML = `
    <div class="employee-salary-detailed-container" [dir]="isRtl ? 'rtl' : 'ltr'">
      <!-- Header Section -->
      <div class="flex justify-between items-center mb-6">
        <div class="w-[40%]">
          <p class="text-base font-semibold mb-1">
            ${this.isRtl ? (this.school?.reportHeaderOneAr || this.school?.reportHeaderOneEn) : this.school?.reportHeaderOneEn}
          </p>
          <p class="text-sm">
            ${this.isRtl ? (this.school?.reportHeaderTwoAr || this.school?.reportHeaderTwoEn) : this.school?.reportHeaderTwoEn}
          </p>
        </div>
        
        <div class="flex justify-center w-[15%]">
          ${this.school?.reportImage ? `<img src="${this.school.reportImage}" style="max-width: 120px; max-height: 120px; width: auto; height: auto;" />` : ''}
        </div>
        
        <div class="w-[40%]" style="${this.isRtl ? 'text-align: left;' : 'text-align: right;'}">
          <p class="text-base font-semibold mb-1">
            ${!this.isRtl ? (this.school?.reportHeaderOneAr || this.school?.reportHeaderOneEn) : this.school?.reportHeaderOneEn}
          </p>
          <p class="text-sm">
            ${!this.isRtl ? (this.school?.reportHeaderTwoAr || this.school?.reportHeaderTwoEn) : this.school?.reportHeaderTwoEn}
          </p>
        </div>
      </div>

      <!-- Title -->
      <div class="my-4 text-center">
        <h1 class="text-2xl font-bold tracking-wide">${this.Title || 'Employee Salary Detailed Report'}</h1>
      </div>

      <!-- Info Rows -->
      <div class="my-4 space-y-2" dir="ltr">
        ${this.infoRows.map(info => `
          <div class="flex justify-between">
            <div class="w-1/2 text-left">
              <div class="text-lg leading-8">${info.keyEn || ''}</div>
            </div>
            <div class="w-1/2 text-right" ${!info.keyAr ? 'style="display: none;"' : ''}>
              <div class="text-lg leading-8">${info.keyAr || ''}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Main Content - Two Column Layout -->
      <div class="flex justify-between items-start space-x-4 mt-6">
        <!-- Left Column - Attendance Table (80%) -->
        <div class="w-[80%]">
          <div class="border border-gray-400 rounded-lg shadow-md p-4 bg-white">
            <div class="text-center font-bold text-lg border-b pb-2 mb-3">
              Monthly Attendance Details
            </div>
            
            <!-- Attendance Table -->
            <table class="w-full text-sm border-collapse">
              <thead class="bg-gray-200">
                <tr>
                  ${this.tableHeaders?.map(header => `
                    <th class="p-2 border border-gray-300 font-semibold text-left">${header}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${this.tableData && this.tableData.length > 0 ? this.tableData.map((row, index) => `
                  <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                    ${this.tableHeaders?.map(header => `
                      <td class="p-2 border border-gray-300">${row[header] || '-'}</td>
                    `).join('')}
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="${this.tableHeaders?.length || 1}" class="p-4 text-center border border-gray-300">
                      No Data Found
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right Column - Salary Slip (20%) -->
        <div class="w-[20%]">
          <div class="border border-gray-400 rounded-lg shadow-md p-4 bg-white">
            <!-- Header -->
            <div class="text-center font-bold text-lg border-b pb-2 mb-3">
              Salary Slip
            </div>

            <!-- Earnings Section -->
            <div class="bg-gray-200 text-center py-1 font-semibold mb-2 text-sm">
              Earnings
            </div>
            <div class="flex justify-between py-1 border-b text-sm">
              <span>Basic Salary</span>
              <span>${this.getSalaryValue('Salary')}</span>
            </div>
            <div class="flex justify-between py-1 border-b text-sm">
              <span>Bonus</span>
              <span>${this.getSalaryValue('Total Bonus')}</span>
            </div>
            <div class="flex justify-between py-1 border-b text-sm">
              <span>Overtime</span>
              <span>${this.getSalaryValue('Total Overtime')}</span>
            </div>
            <div class="flex justify-between py-1 font-semibold text-sm">
              <span>Total Earnings</span>
              <span>${this.calculateTotalEarnings()}</span>
            </div>

            <!-- Deductions Section -->
            <div class="bg-gray-200 text-center py-1 font-semibold mt-3 mb-2 text-sm">
              Deductions
            </div>
            <div class="flex justify-between py-1 border-b text-sm">
              <span>Loans</span>
              <span>${this.getSalaryValue('Total Loans')}</span>
            </div>
            <div class="flex justify-between py-1 border-b text-sm">
              <span>Deductions</span>
              <span>${this.getSalaryValue('Total Deduction')}</span>
            </div>
            <div class="flex justify-between py-1 font-semibold text-sm">
              <span>Total Deductions</span>
              <span>${this.calculateTotalDeductions()}</span>
            </div>

            <!-- Net Salary -->
            <div class="bg-gray-100 text-center font-bold text-sm mt-4 py-2 border rounded">
              Net Salary: ${this.getSalaryValue('Final Salary')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  element.innerHTML = detailedSalaryHTML;
}

// Helper methods for salary calculations
private getSalaryValue(key: string): string {
  const info = this.infoRows.find(row => 
    row.keyEn?.includes(key) || row.keyAr?.includes(key)
  );
  
  if (info) {
    const value = this.isRtl ? info.valueAr : info.valueEn;
    return this.formatCurrency(value);
  }
  
  return '0.00';
}

private calculateTotalEarnings(): string {
  const basicSalary = this.extractNumberValue('Salary');
  const bonus = this.extractNumberValue('Total Bonus');
  const overtime = this.extractNumberValue('Total Overtime');
  return this.formatCurrency(basicSalary + bonus + overtime);
}

private calculateTotalDeductions(): string {
  const loans = this.extractNumberValue('Total Loans');
  const deductions = this.extractNumberValue('Total Deduction');
  return this.formatCurrency(loans + deductions);
}

private extractNumberValue(key: string): number {
  const info = this.infoRows.find(row => 
    row.keyEn?.includes(key) || row.keyAr?.includes(key)
  );
  
  if (info) {
    const value = this.isRtl ? info.valueAr : info.valueEn;
    return parseFloat(value?.toString().replace(/[^\d.-]/g, '') || '0');
  }
  
  return 0;
}

private formatCurrency(value: any): string {
  const num = typeof value === 'number' ? value : parseFloat(value?.toString().replace(/[^\d.-]/g, '') || '0');
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
}