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

applyBorderToRow(row: any) {
  row.eachCell((cell: any) => {
    cell.border = {
      top:    { style: 'thin', color: { argb: 'FF0000FF' } },
      left:   { style: 'thin', color: { argb: 'FF0000FF' } },
      bottom: { style: 'thin', color: { argb: 'FF0000FF' } },
      right:  { style: 'thin', color: { argb: 'FF0000FF' } }
    };
  });
}
  DownloadAsPDF(name: string) {
    const elements = document.querySelectorAll('.print-area');

    if (!elements || elements.length === 0) { 
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

  PrintPDF(name: string) {
    let Element = document.getElementById('Data');

    if (!Element) { 
      return;
    }

    let printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) { 
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

  infoRows?: { en: string; ar: string }[] |
             { key: string; value: string | number | boolean | Date | null | undefined }[];

  reportImage?: string;
  isRtl?: boolean;
  tables: {
    title?: string;
    headers: string[];
    data: (string | number | boolean)[][];
  }[];

  filename?: string;

}) {

  const ExcelJS = await import('exceljs');
  const Excel = ExcelJS.default || ExcelJS;

  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("Report");

 const applyBorderToRow = (row: any) => {
  row.eachCell((cell: any) => {
    cell.border = {
      top:    { style: 'thin', color: { argb: 'FF0000FF' } },
      left:   { style: 'thin', color: { argb: 'FF0000FF' } },
      bottom: { style: 'thin', color: { argb: 'FF0000FF' } },
      right:  { style: 'thin', color: { argb: 'FF0000FF' } }
    };
  });
};


  worksheet.mergeCells(`A1:D1`);
  worksheet.getCell(`A1`).value = options.mainHeader?.en;
  worksheet.getCell(`A1`).font = { bold: true, size: 16 };
  worksheet.getCell(`A1`).alignment = { horizontal: 'left' };

  worksheet.mergeCells(`F1:I1`);
  worksheet.getCell(`F1`).value = options.mainHeader?.ar;
  worksheet.getCell(`F1`).font = { bold: true, size: 16 };
  worksheet.getCell(`F1`).alignment = { horizontal: 'right' };


  options.subHeaders?.forEach((header, i) => {
    const rowIndex = i + 2;

    worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = header.en;
    worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'left' };

    worksheet.mergeCells(`F${rowIndex}:I${rowIndex}`);
    worksheet.getCell(`F${rowIndex}`).value = header.ar;
    worksheet.getCell(`F${rowIndex}`).alignment = { horizontal: 'right' };
  });

  worksheet.addRow([]);


  options.infoRows?.forEach((infoRow: any) => {
    let englishValue = '';
    let arabicValue = '';

    if ('en' in infoRow && 'ar' in infoRow) {
      englishValue = infoRow.en || '';
      arabicValue = infoRow.ar || '';
    } else {
      englishValue = infoRow.key || '';
      arabicValue = infoRow.value instanceof Date
        ? infoRow.value.toLocaleDateString()
        : (infoRow.value ?? '').toString();
    }

    const row = worksheet.addRow([englishValue]);
    worksheet.mergeCells(`A${row.number}:D${row.number}`);
    row.alignment = { horizontal: 'left' };
    row.font = { bold: true };

    const arRow = worksheet.getRow(row.number);
    arRow.getCell('F').value = arabicValue;
    worksheet.mergeCells(`F${row.number}:I${row.number}`);
    arRow.getCell('F').alignment = { horizontal: 'right' };
    arRow.getCell('F').font = { bold: true };

    applyBorderToRow(row);
  });

  worksheet.addRow([]);

  for (const table of options.tables) {

    // ---- Title Row (with borders)
    if (table.title) {
      const titleRow = worksheet.addRow([table.title]);
      titleRow.font = { bold: true, size: 14 };
      worksheet.mergeCells(`A${titleRow.number}:I${titleRow.number}`);
      titleRow.alignment = { horizontal: 'center' };

      applyBorderToRow(titleRow);

      worksheet.addRow([]);
    }

    const headerRow = worksheet.addRow(table.headers);
    headerRow.font = { bold: true,color: { argb: "FF0000FF" } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' },
    };

    headerRow.eachCell((cell) => {
      cell.alignment = { horizontal: 'left' };
    });

    applyBorderToRow(headerRow);

    // ---- Data Rows (with borders)
    table.data.forEach((rowData: any[]) => {
      const dataRow = worksheet.addRow(rowData);
      dataRow.eachCell((cell) => {
        cell.alignment = { horizontal: 'left' };
      });

      applyBorderToRow(dataRow);
    });

    worksheet.addRow([]);
  }

  worksheet.columns.forEach((col) => {
    col.width = 20;
  });

  const FileSaver = await import('file-saver');
  const saveAs = FileSaver.default || FileSaver;

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), options.filename || "Report.xlsx");
}
}