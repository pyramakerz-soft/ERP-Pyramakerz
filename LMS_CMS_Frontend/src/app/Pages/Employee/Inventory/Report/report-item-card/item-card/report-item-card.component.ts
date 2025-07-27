import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import * as XLSX from 'xlsx-js-style';
import { PdfPrintComponent } from '../../../../../../Component/pdf-print/pdf-print.component';
import { Store } from '../../../../../../Models/Inventory/store';
import { InventoryDetailsService } from '../../../../../../Services/Employee/Inventory/inventory-details.service';
import { StoresService } from '../../../../../../Services/Employee/Inventory/stores.service';
import { ShopItemService } from '../../../../../../Services/Employee/Inventory/shop-item.service';
import {
  CombinedReportData,
  InventoryNetSummary,
  InventoryNetTransaction,
} from '../../../../../../Models/Inventory/report-card';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-report-item-card',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent],
  templateUrl: './report-item-card.component.html',
})
export class ReportItemCardComponent implements OnInit {
  dateFrom: string = '';
  dateTo: string = '';
  selectedStoreId: number | null = null;
  selectedItemId: number | null = null;
  stores: Store[] = [];
  items: any[] = [];
  combinedData: any[] = [];
  showTable: boolean = false;
  isLoading: boolean = false;
  showAverageColumn: boolean = false;

  @ViewChild(PdfPrintComponent) pdfPrintComponent!: PdfPrintComponent;
  showPDF = false;
  transactionsForExport: any[] = [];

  school = {
    reportHeaderOneEn: 'Item Card Report',
    reportHeaderTwoEn: 'Item Transactions',
    reportHeaderOneAr: 'تقرير بطاقة الصنف',
    reportHeaderTwoAr: 'معاملات الصنف',
    reportImage: 'assets/images/logo.png',
  };

  constructor(
    private inventoryDetailsService: InventoryDetailsService,
    private storesService: StoresService,
    private shopItemService: ShopItemService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.showAverageColumn = this.route.snapshot.data['showAverage'] || false;
    this.loadStores();
    this.loadItems();
  }

  loadStores() {
    this.isLoading = true;
    this.storesService.Get(this.storesService.ApiServ.GetHeader()).subscribe({
      next: (stores) => {
        this.stores = stores;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stores:', error);
        this.isLoading = false;
      },
    });
  }

  loadItems() {
    this.isLoading = true;
    this.shopItemService
      .Get(this.shopItemService.ApiServ.GetHeader())
      .subscribe({
        next: (items) => {
          this.items = items;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading items:', error);
          this.isLoading = false;
        },
      });
  }

  onFilterChange() {
    this.showTable = false;
    this.combinedData = [];
    this.transactionsForExport = [];
  }

  async viewReport() {
    if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
      Swal.fire({
        title: 'Invalid Date Range',
        text: 'Start date cannot be later than end date.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (!this.selectedStoreId || !this.selectedItemId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select both Store and Item',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.isLoading = true;
    this.showTable = false;
    this.combinedData = [];

    try {
      // Get summary data
      const summaryResponse = await this.inventoryDetailsService
        .getInventoryNetSummary(
          this.selectedStoreId!,
          this.selectedItemId!,
          this.dateFrom,
          this.inventoryDetailsService.ApiServ.GetHeader()
        )
        .toPromise();

      console.log('Summary Response:', summaryResponse); // <-- log summary

      if (!summaryResponse) {
        throw new Error('No summary data received');
      }

      // Get transaction data
      const transactionsResponse = await this.inventoryDetailsService
        .getInventoryNetTransactions(
          this.selectedStoreId!,
          this.selectedItemId!,
          this.dateFrom,
          this.dateTo,
          this.inventoryDetailsService.ApiServ.GetHeader()
        )
        .toPromise();

      console.log('Transactions Response:', transactionsResponse); // <-- log transactions

      // Process and combine data
      this.processReportData(summaryResponse, transactionsResponse || []);

      this.showTable = true;
    } catch (error) {
      console.error('Error loading report:', error);
      this.combinedData = [];
      this.showTable = true;
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load report data',
        confirmButtonText: 'OK',
      });
    } finally {
      this.isLoading = false;
    }
  }

  private processReportData(
    summary: InventoryNetSummary,
    transactions: InventoryNetTransaction[]
  ) {
    const summaryRow: any = {
      isSummary: true,
      date: summary.toDate,
      transactionType: 'Initial Balance',
      invoiceNumber: '0',
      authority: '-',
      income: summary.inQuantity ?? '-',
      outcome: summary.outQuantity ?? '-',
      balance: summary.quantitybalance ?? '-',
      averageCost: summary.costBalance ?? '-',
    };

    if (this.showAverageColumn) {
      summaryRow.price = '-';
      summaryRow.totalPrice = '-';
      // summaryRow.averageCost = '-';
    }
    // int x =0;

    // Process transactions
    const transactionRows = transactions.map((t) => {
      // x += (t.quantity *(t.itemInOut ===1 ? 1 : -1));
      const row: any = {
        isSummary: false,
        date: t.date || '-',
        transactionType: t.flagName || '-',
        invoiceNumber: t.invoiceNumber || '-',
        authority: t.supplierName || t.studentName || t.storeToName || '-',
        income: t.inQuantity || '-',
        outcome: t.outQuantity || '-',
        // income: t.itemInOut === 1 ? t.quantity ?? '-' : '-',
        // outcome: t.itemInOut === -1 ? t.quantity ?? '-' : '-',
        balance: t.balance ?? '-',
      };

      if (this.showAverageColumn) {
        row.price = t.price ?? '-';
        row.totalPrice = t.totalPrice ?? '-';
        row.averageCost = t.averageCost ?? '-';
      }

      return row;
    });

    // Combine data
    this.combinedData = [summaryRow, ...transactionRows];
    this.prepareExportData();
  }

  // private formatDateForAPI(dateString: string): string {
  //   if (!dateString) return '';
  //   const date = new Date(dateString);
  //   if (isNaN(date.getTime())) {
  //     console.error('Invalid date:', dateString);
  //     return '';
  //   }
  //   const year = date.getFullYear();
  //   const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //   const day = date.getDate().toString().padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // }

  private formatDisplayDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return dateString;
    }
  }

  private prepareExportData(): void {
    this.transactionsForExport = this.combinedData.map((t) => {
      const costBalance = t.isSummary
        ? typeof t.costBalance === 'number'
          ? t.costBalance.toFixed(2)
          : '-'
        : '-';

      return {
        Date: t.isSummary
          ? t.date
          : t.date
          ? new Date(t.date).toLocaleDateString()
          : '-',
        'Transaction Type': t.transactionType || '-',
        'Invoice #': t.invoiceNumber || '-',
        Authority: t.authority || '-',
        Income: t.income || '-',
        Outcome: t.outcome || '-',
        Balance: t.balance || '-',
        ...(this.showAverageColumn && {
          // 'Cost Balance': costBalance,
          Price: t.price || '-',
          'Total Price': t.totalPrice || '-',
          'Average Cost': t.averageCost || '-',
        }),
      };
    });
  }

  DownloadAsPDF() {
    if (this.transactionsForExport.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'No data to export!',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.showPDF = true;
    setTimeout(() => {
      this.pdfPrintComponent.downloadPDF();
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }

  Print() {
    if (this.transactionsForExport.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'No data to print!',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.showPDF = true;
    setTimeout(() => {
      const printContents = document.getElementById('Data')?.innerHTML;
      if (!printContents) {
        console.error('Element not found!');
        return;
      }

      const printStyle = `
        <style>
          @page {
            size: landscape; /* Force landscape mode */
            margin: 5mm; /* Reduce margins */
          }
          body {
            margin: 0;
            font-family: Arial, sans-serif;
          }
          #print-container {
            width: 100%;
            overflow: hidden; /* Prevent overflow */
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed; /* Prevent column resizing */
          }
          th, td {
            padding: 6px;
            border: 1px solid #ddd;
            white-space: nowrap; /* Prevent line breaks */
            font-size: 12px; /* Reduce font size if needed */
          }
          @media print {
            body > *:not(#print-container) {
              display: none !important;
            }
            #print-container {
              display: block !important;
              width: 100% !important;
              transform: scale(0.9); /* Slightly scale down if needed */
              transform-origin: 0 0;
            }
          }
        </style>
      `;

      const printContainer = document.createElement('div');
      printContainer.id = 'print-container';
      printContainer.innerHTML = printStyle + printContents;

      document.body.appendChild(printContainer);
      window.print();

      setTimeout(() => {
        document.body.removeChild(printContainer);
        this.showPDF = false;
      }, 100);
    }, 500);
  }

  exportExcel() {
    if (this.combinedData.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'No data to export!',
        confirmButtonText: 'OK',
      });
      return;
    }

    const excelData: any[] = [];

    // Add report title
    excelData.push([
      {
        v: `${this.school.reportHeaderOneEn} - ${this.school.reportHeaderTwoEn}`,
        s: {
          font: { bold: true, sz: 16 },
          alignment: { horizontal: 'center' },
        },
      },
    ]);
    excelData.push([]); // empty row

    // Add filter information
    excelData.push([
      { v: 'From Date:', s: { font: { bold: true } } },
      { v: this.dateFrom, s: { font: { bold: true } } },
    ]);
    excelData.push([
      { v: 'To Date:', s: { font: { bold: true } } },
      { v: this.dateTo, s: { font: { bold: true } } },
    ]);
    const selectedStore = this.stores.find(
      (s) => s.id === this.selectedStoreId
    );
    excelData.push([
      { v: 'Store:', s: { font: { bold: true } } },
      { v: selectedStore?.name || 'N/A', s: { font: { bold: true } } },
    ]);
    const selectedItem = this.items.find((i) => i.id === this.selectedItemId);
    excelData.push([
      { v: 'Item:', s: { font: { bold: true } } },
      { v: selectedItem?.enName || 'N/A', s: { font: { bold: true } } },
    ]);
    excelData.push([]); // empty row

    // Table headers
    const headers = [
      'Date',
      'Transaction Type',
      'Invoice #',
      'Authority',
      'Income',
      'Outcome',
      'Balance',
    ];
    if (this.showAverageColumn) {
      headers.push(
        // 'Cost Balance',
        'Price',
        'Total Price',
        'Average Cost'
      );
    }
    excelData.push(
      headers.map((h) => ({
        v: h,
        s: {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '4472C4' } },
          alignment: { horizontal: 'center' },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          },
        },
      }))
    );

    // Table rows
    this.combinedData.forEach((row, idx) => {
      const isEven = idx % 2 === 0;
      const fillColor = isEven ? 'E9E9E9' : 'FFFFFF';
      const getVal = (val: any) =>
        val === null || val === undefined || val === '' ? '-' : val;

      const rowData = [
        {
          v: row.date ? new Date(row.date).toLocaleString() : '-',
          s: { fill: { fgColor: { rgb: fillColor } } },
        },
        {
          v: getVal(row.transactionType),
          s: { fill: { fgColor: { rgb: fillColor } } },
        },
        {
          v: getVal(row.invoiceNumber),
          s: { fill: { fgColor: { rgb: fillColor } } },
        },
        {
          v: getVal(row.authority),
          s: { fill: { fgColor: { rgb: fillColor } } },
        },
        { v: getVal(row.income), s: { fill: { fgColor: { rgb: fillColor } } } },
        {
          v: getVal(row.outcome),
          s: { fill: { fgColor: { rgb: fillColor } } },
        },
        {
          v: getVal(row.balance),
          s: { fill: { fgColor: { rgb: fillColor } } },
        },
      ];
      if (this.showAverageColumn) {
        rowData.push(
          // {
          //   v: getVal(row.costBalance),
          //   s: { fill: { fgColor: { rgb: fillColor } } },
          // },
          {
            v: getVal(row.price),
            s: { fill: { fgColor: { rgb: fillColor } } },
          },
          {
            v: getVal(row.totalPrice),
            s: { fill: { fgColor: { rgb: fillColor } } },
          },
          {
            v: getVal(row.averageCost),
            s: { fill: { fgColor: { rgb: fillColor } } },
          }
        );
      }
      excelData.push(rowData);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Merge title row
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({
      s: { r: 0, c: 0 },
      e: { r: 0, c: headers.length - 1 },
    });

    // Set column widths
    worksheet['!cols'] = [
      { wch: 22 }, // Date
      { wch: 18 }, // Transaction Type
      { wch: 12 }, // Invoice #
      { wch: 20 }, // Authority
      { wch: 10 }, // Income
      { wch: 10 }, // Outcome
      { wch: 12 }, // Balance
      ...(this.showAverageColumn
        ? [
            { wch: 14 }, // Cost Balance
            { wch: 10 }, // Price
            { wch: 14 }, // Total Price
            { wch: 14 }, // Average Cost
          ]
        : []),
    ];

    // Create workbook and save
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Item Card Report');

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Item_Card_Report_${dateStr}.xlsx`);
  }

  getInfoRows(): any[] {
    const selectedItem = this.items.find(
      (item) => item.id === this.selectedItemId
    );
    const selectedStore = this.stores.find(
      (store) => store.id === this.selectedStoreId
    );

    return [
      { keyEn: 'From Date: ' + this.dateFrom },
      { keyEn: 'To Date: ' + this.dateTo },
      { keyEn: 'Store: ' + (selectedStore?.name || 'N/A') },
      { keyEn: 'Item: ' + (selectedItem?.enName || 'N/A') },
      ...(this.showAverageColumn
        ? [{ keyEn: 'Includes Cost Information' }]
        : []),
    ];
  }

  getPdfTableHeaders(): string[] {
    const headers = [
      'Date',
      'Transaction Type',
      'Invoice #',
      'Authority',
      'Income',
      'Outcome',
      'Balance',
    ];

    if (this.showAverageColumn) {
      headers.push(
        // 'Cost Balance',
        'Price',
        'Total Price',
        'Average Cost'
      );
    }

    return headers;
  }
}
