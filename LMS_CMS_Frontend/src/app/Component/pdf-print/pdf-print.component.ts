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
  
  // Specific handling for item card report columns
  if (headerLower.includes('average') || headerLower.includes('avg') || headerLower.includes('cost')) {
    return { 
      width: '12%', 
      'min-width': '80px',
      'max-width': '100px',
      'word-wrap': 'break-word',
      'white-space': 'normal'
    };
  }
  
  if (headerLower.includes('price') || headerLower.includes('total')) {
    return { 
      width: '10%', 
      'min-width': '70px',
      'max-width': '90px',
      'word-wrap': 'break-word',
      'white-space': 'normal'
    };
  }
  
  if (headerLower.includes('details') || headerLower.includes('authority')) {
    return { 
      width: '15%', 
      'min-width': '100px',
      'max-width': '150px',
      'word-wrap': 'break-word',
      'white-space': 'normal'
    };
  }
  
  if (headerLower.includes('transaction') || headerLower.includes('type')) {
    return { 
      width: '12%', 
      'min-width': '90px',
      'max-width': '120px',
      'word-wrap': 'break-word',
      'white-space': 'normal'
    };
  }
  
  // Default for other columns
  return { 
    width: '8%', 
    'min-width': '60px',
    'max-width': '80px',
    'word-wrap': 'break-word',
    'white-space': 'normal'
  };
}

  isSmallTable(data: any[]): boolean {
    return data && data.length <= 5;
  }

  isLargeTable(data: any[]): boolean {
    return data && data.length > 10;
  }
}