import { Injectable } from '@angular/core'; 
// import FileSaver from 'file-saver';
// import saveAs from 'file-saver';
import html2pdf from 'html2pdf.js';  
// import * as ExcelJS from 'exceljs'

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor() { }
 
  DownloadAsPDF(name: string) {
    const elements = document.querySelectorAll('.print-area');
    
    if (!elements || elements.length === 0) {
      console.error("No elements found!");
      return;
    }
  
    const container = document.createElement('div');
  
    elements.forEach(el => {
      container.appendChild(el.cloneNode(true));
    });
  
    html2pdf().from(container).set({
      margin: 10,
      filename: `${name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, allowTaint: true },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    }).save();
  }
  
  PrintPDF(name:string) {
    let Element = document.getElementById('Data');

    if (!Element) {
        console.error("Element not found!");
        return;
    }

    let printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
        console.error("Failed to open print window.");
        return;
    }
 
    let styles = Array.from(document.styleSheets)
        .map(styleSheet => {
            try {
                return Array.from(styleSheet.cssRules)
                    .map(rule => rule.cssText)
                    .join("\n");
            } catch (e) {
                return "";
            }
        })
        .join("\n");

    printWindow.document.write(`
        <html>
        <head>
            <title>${name}</title>
            <style>${styles}</style>  <!-- Injects all styles -->
        </head>
        <body>
            ${Element.outerHTML}
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() { window.close(); };
                };
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
  }

  async getBase64ImageFromUrl(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
  
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

async generateExcelReport(options: {
  mainHeader?: { en: string; ar: string };
  subHeaders?: { en: string; ar: string }[];
  infoRows?: { key: string; value: string | number | boolean }[];
  reportImage?: string;
  tables: {
    title?: string;
    headers: string[];
    data: (string | number | boolean)[][];
  }[];
  filename?: string;
}) {
  const ExcelJS = await import('exceljs');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  function getExcelColumnLetter(colIndex: number): string {
    let temp = '';
    while (colIndex > 0) {
      let remainder = (colIndex - 1) % 26;
      temp = String.fromCharCode(65 + remainder) + temp;
      colIndex = Math.floor((colIndex - 1) / 26);
    }
    return temp;
  }

  let base64Image = '';
  if (options.reportImage?.startsWith('http')) {
    base64Image = await this.getBase64ImageFromUrl(options.reportImage);
  } else if (options.reportImage) {
    base64Image = options.reportImage;
  }

  // FIXED: Use reasonable fixed column spans instead of dynamic calculation
  const enEnd = 'D'; // Fixed position for English section
  const arStart = 'E'; // Fixed position for Arabic section start
  const arEnd = 'H';   // Fixed position for Arabic section end

  // Main header - English
  worksheet.mergeCells(`A1:${enEnd}1`);
  worksheet.getCell('A1').value = options.mainHeader?.en;
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A1').alignment = { horizontal: 'left' };

  // Main header - Arabic
  worksheet.mergeCells(`${arStart}1:${arEnd}1`);
  worksheet.getCell(`${arStart}1`).value = options.mainHeader?.ar;
  worksheet.getCell(`${arStart}1`).font = { bold: true, size: 16 };
  worksheet.getCell(`${arStart}1`).alignment = { horizontal: 'right' };

  // Sub headers
  options.subHeaders?.forEach((header, i) => {
    const row = i + 2;
    
    // English subheader
    worksheet.mergeCells(`A${row}:${enEnd}${row}`);
    worksheet.getCell(`A${row}`).value = header.en;
    worksheet.getCell(`A${row}`).font = { size: 12 };
    worksheet.getCell(`A${row}`).alignment = { horizontal: 'left' };

    // Arabic subheader
    worksheet.mergeCells(`${arStart}${row}:${arEnd}${row}`);
    worksheet.getCell(`${arStart}${row}`).value = header.ar;
    worksheet.getCell(`${arStart}${row}`).font = { size: 12 };
    worksheet.getCell(`${arStart}${row}`).alignment = { horizontal: 'right' };
  });

  const headerOffset = (options.subHeaders?.length || 0) + 2;

  if (base64Image) {
    const imageId = workbook.addImage({
      base64: base64Image.split(',')[1],
      extension: 'png',
    });

    worksheet.addImage(imageId, {
      tl: { col: 4, row: 0 },
      ext: { width: 100, height: 50 },
    });
  }

  worksheet.addRow([]);

  // Info rows (dynamic)--77
  options.infoRows?.forEach(({ key, value }) => {
    const row = worksheet.addRow([`${key}: ${value}`]);
    row.font = { bold: true, size: 12 };
    // Set LTR alignment for info rows
    row.eachCell((cell) => {
      cell.alignment = { horizontal: 'left' };
    });
  });

  worksheet.addRow([]);

  // Tables
  for (const table of options.tables) {
    if (table.title) {
      const titleRow = worksheet.addRow([table.title]);
      titleRow.font = { bold: true, size: 14 };
      worksheet.mergeCells(`A${titleRow.number}:E${titleRow.number}`); // merge columns A–E for the title
      titleRow.alignment = { horizontal: 'center' };
      worksheet.addRow([]); // add an empty row for spacing
    }

    const headerRow = worksheet.addRow(table.headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4F81BD' }
    };

    // Set LTR alignment for header cells
    headerRow.eachCell((cell) => {
      cell.border = { bottom: { style: 'thin' } };
      cell.alignment = { horizontal: 'left' }; // Force LTR for headers
    });

    // Add data rows with LTR alignment
    table.data.forEach((rowData) => {
      const dataRow = worksheet.addRow(rowData);

      // Set LTR alignment and proper formatting for all data cells
      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = { horizontal: 'left' }; // Force LTR for data

        // Format numbers appropriately
        if (typeof cell.value === 'number') {
          // Check if the number is a whole number (no decimal part)
          if (Number.isInteger(cell.value) || cell.value % 1 === 0) {
            cell.numFmt = '0'; // Integer format (no decimals)
          } else {
            cell.numFmt = '0.00'; // Decimal format with 2 decimal places
          }
          cell.value = Number(cell.value); // Ensure it's treated as number
        }
      });
    });

    worksheet.addRow([]);
  }

  // Set column widths and alignment
  worksheet.columns.forEach((col) => {
    col.width = 20;
  });

  // Set worksheet to LTR direction
  worksheet.views = [
    {
      state: 'normal',
      rightToLeft: false, // Explicitly set to LTR
      activeCell: 'A1',
      showGridLines: true
    }
  ];

  const FileSaver = await import('file-saver');
  const buffer = await workbook.xlsx.writeBuffer();
  FileSaver.saveAs(new Blob([buffer]), options.filename || 'Report.xlsx');
}
}
