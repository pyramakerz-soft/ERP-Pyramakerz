import { CommonModule } from '@angular/common';
import { OnChanges, Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import html2pdf from 'html2pdf.js';


// Add this interface at the top of the file
interface TableSection {
  header: string;
  data: { key: string; value: any }[];
  tableHeaders: string[];
  tableData: any[];
}

@Component({
  selector: 'app-pdf-print',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdf-print.component.html',
  styleUrl: './pdf-print.component.css',
})
export class PdfPrintComponent {
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

  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableHeaders'] || changes['tableData']) {
      if (this.tableHeaders) this.preservedColumns = this.tableHeaders[0];
      this.splitTableGenerically();
    }
  }
  print() {
    const printContents = this.printContainer.nativeElement.innerHTML;

    // Create a print-specific stylesheet
    const printStyle = `
    <style>
      @page { size: auto; margin: 0mm; }
      body { margin: 0;
      }
      .print-content {
        padding: 20px;
      }
      @media print {
        body * {
        }
        .print-overlay,
        .print-overlay * {
          visibility: visible;
          position: static;
          background: none;
        }
        .print-content {
        }
      }
    </style>
  `;

    // Create print overlay
    const printOverlay = document.createElement('div');
    printOverlay.className = 'print-overlay';
    printOverlay.innerHTML = `
    <div class="print-content">
      ${printContents}
    </div>
  `;

    // Add to body
    document.body.appendChild(printOverlay);
    document.body.insertAdjacentHTML('beforeend', printStyle);

    // Print and clean up
    setTimeout(() => {
      window.print();

      setTimeout(() => {
        document.body.removeChild(printOverlay);
        const styles = document.querySelectorAll('style[data-print-style]');
        styles.forEach((style) => document.body.removeChild(style));
      }, 100);
    }, 100);
  }

  // ngAfterViewInit(): void {
  //   if (this.school?.reportImage?.startsWith('http')) {
  //     this.convertImgToBase64URL(this.school.reportImage).then((base64Img) => {
  //       this.school.reportImage = base64Img;
  //       setTimeout(() => this.printPDF(), 100);
  //     });
  //   } else {
  //     setTimeout(() => this.printPDF(), 100);
  //   }
  // }

  // ngAfterViewInit(): void {
  //   if (this.autoDownload) {
  //     this.convertImgToBase64URL(this.school.reportImage).then((base64Img) => {
  //       this.school.reportImage = base64Img;
  //       setTimeout(() => this.printPDF(), 100);
  //     });
  //   }
  // }

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
      img.crossOrigin = 'anonymous'; // Important for CORS
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
    // Rough estimate: 10–12px per character
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
      // Add preserved column to every chunk (if not already included)
      const finalHeaders = headersSlice.includes(preserved)
        ? headersSlice
        : [preserved, ...headersSlice];

      const dataChunk = this.tableData.map((row) => {
        const newRow: any = {};
        finalHeaders.forEach((header) => {
          newRow[header] = row[header] ?? '-';
        });
        return newRow;
      });

      this.tableChunks.push({ headers: finalHeaders, data: dataChunk });
    }
  }


printPDF() {
  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5], // top, left, bottom, right margins in inches
    filename: `${this.fileName}.pdf`,
    image: { 
      type: 'jpeg', 
      quality: 0.98 
    },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: false
    },
    jsPDF: { 
      unit: 'in', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: '.page-break-avoid'
    }
  };

  // Apply temporary styles for better PDF rendering
  const printContainer = this.printContainer.nativeElement;
  const originalStyle = printContainer.style.cssText;
  
  // Temporarily apply print-optimized styles
  printContainer.style.cssText += `
    font-size: 12px !important;
    line-height: 1.4 !important;
    color: #000 !important;
  `;

  html2pdf()
    .from(printContainer)
    .set(opt)
    .save()
    .then(() => {
      // Restore original styles
      printContainer.style.cssText = originalStyle;
    })
    .catch((error: any) => {
      console.error('PDF generation failed:', error);
      // Restore original styles even if PDF generation fails
      printContainer.style.cssText = originalStyle;
    });
}


getColumnWidth(header: string, totalColumns: number): any {
  const headerLower = header.toLowerCase();
  
  // Give more space to Details column specifically
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

// Helper method to check if any column contains a specific name
private hasColumnWithName(columnName: string): boolean {
  if (this.tableHeaders) {
    return this.tableHeaders.some(header => 
      header.toLowerCase().includes(columnName.toLowerCase())
    );
  }
  return false;
}

// Method to determine table size for page break control
isSmallTable(data: any[]): boolean {
  // Only consider very small tables (≤5 rows) for strict page-break-avoid
  return data && data.length <= 5;
}

isLargeTable(data: any[]): boolean {
  // Consider a table large if it has more than 10 rows
  return data && data.length > 10;
}


// @Input() certificateType: 'default' | 'kindergarten' = 'default';
// @Input() studentData: any = null;

// // Add this new ViewChild for the kindergarten certificate container
// @ViewChild('kindergartenContainer') kindergartenContainer!: ElementRef;

// // Add this new method for kindergarten certificate PDF download
// downloadKindergartenPDF() {
//   if (this.school?.reportImage?.startsWith('http')) {
//     this.convertImgToBase64URL(this.school.reportImage).then((base64Img) => {
//       this.school.reportImage = base64Img;
//       setTimeout(() => this.printKindergartenPDF(), 100);
//     });
//   } else {
//     setTimeout(() => this.printKindergartenPDF(), 100);
//   }
// }

// // Add this new method for generating kindergarten certificate PDF
// printKindergartenPDF() {
//   const opt = {
//     margin: [0.3, 0.3, 0.3, 0.3],
//     filename: `${this.fileName}.pdf`,
//     image: { 
//       type: 'jpeg', 
//       quality: 0.98 
//     },
//     html2canvas: { 
//       scale: 2,
//       useCORS: true,
//       letterRendering: true,
//       allowTaint: false
//     },
//     jsPDF: { 
//       unit: 'in', 
//       format: 'a4', 
//       orientation: 'portrait',
//       compress: true
//     }
//   };

//   const container = this.kindergartenContainer.nativeElement;
//   const originalStyle = container.style.cssText;
  
//   container.style.cssText += `
//     font-size: 12px !important;
//     line-height: 1.4 !important;
//     color: #000 !important;
//   `;

//   html2pdf()
//     .from(container)
//     .set(opt)
//     .save()
//     .then(() => {
//       container.style.cssText = originalStyle;
//     })
//     .catch((error: any) => {
//       console.error('PDF generation failed:', error);
//       container.style.cssText = originalStyle;
//     });
// }

// // Add this new method for printing kindergarten certificate
// printKindergartenCertificate() {
//   const printContents = this.kindergartenContainer.nativeElement.innerHTML;

//   const printStyle = `
//     <style>
//       @page { size: auto; margin: 0mm; }
//       body { 
//         margin: 0; 
//       }

//       @media print {
//         body > *:not(#print-container) {
//           display: none !important;
//         }
//         #print-container {
//           display: block !important;
//           position: static !important;
//           top: auto !important;
//           left: auto !important;
//           width: 100% !important;
//           height: auto !important;
//           background: white !important;
//           box-shadow: none !important;
//           margin: 0 !important;
//         }
//       }
//     </style>
//   `;

//   const printContainer = document.createElement('div');
//   printContainer.id = 'print-container';
//   printContainer.innerHTML = printStyle + printContents;

//   document.body.appendChild(printContainer);
//   window.print();
  
//   setTimeout(() => {
//     document.body.removeChild(printContainer);
//   }, 100);
// }
}