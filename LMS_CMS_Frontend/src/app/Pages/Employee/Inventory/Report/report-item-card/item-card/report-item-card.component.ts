import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
// import * as XLSX from 'xlsx-js-style';
import { PdfPrintComponent } from '../../../../../../Component/pdf-print/pdf-print.component';
import { Store } from '../../../../../../Models/Inventory/store';
import { InventoryDetailsService } from '../../../../../../Services/Employee/Inventory/inventory-details.service';
import { StoresService } from '../../../../../../Services/Employee/Inventory/stores.service';
import { ShopItemService } from '../../../../../../Services/Employee/Inventory/shop-item.service';
import {
  InventoryNetCombinedResponse,
  InventoryNetCombinedTransaction,
} from '../../../../../../Models/Inventory/report-card';
// import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../../../Services/loading.service';

@Component({
  selector: 'app-report-item-card',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './report-item-card.component.html',
})

@InitLoader()
export class ReportItemCardComponent implements OnInit {
  dateFrom: string = '';
  dateTo: string = '';
  selectedStoreId: number | null = null;
  selectedItemId: number | null = null;
  stores: Store[] = [];
  items: any[] = [];
  isRtl: boolean = false;
  subscription!: Subscription;
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
    // reportImage: 'assets/images/logo.png',
  };

  constructor(
    private inventoryDetailsService: InventoryDetailsService,
    private storesService: StoresService,
    private shopItemService: ShopItemService,
    private route: ActivatedRoute,
    private languageService: LanguageService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.showAverageColumn = this.route.snapshot.data['showAverage'] || false;
    this.loadStores();
    this.loadItems();
    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadStores() {
    this.isLoading = true;
    this.storesService.Get(this.storesService.ApiServ.GetHeader()).subscribe({
      next: (stores) => {
        this.stores = stores;
        this.isLoading = false;
      },
      error: () => {
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
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onFilterChange() {
    this.showTable = false;
    this.combinedData = [];
    this.transactionsForExport = [];
  }

  // async viewReport() {
  //   if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
  //     Swal.fire({
  //       title: 'Invalid Date Range',
  //       text: 'Start date cannot be later than end date.',
  //       icon: 'warning',
  //       confirmButtonText: 'OK',
  //     });
  //     return;
  //   }

  //   // if (!this.selectedStoreId || !this.selectedItemId) {
  //   //   Swal.fire({
  //   //     icon: 'warning',
  //   //     title: 'Missing Information',
  //   //     text: 'Please select both Store and Item',
  //   //     confirmButtonColor: '#3085d6',
  //   //     confirmButtonText: 'OK',
  //   //   });
  //   //   return;
  //   // }

  //   this.isLoading = true;
  //   this.showTable = false;
  //   this.combinedData = [];

  //   try {
  //     const response = await this.inventoryDetailsService
  //       .getInventoryNetCombined(
  //         this.selectedStoreId!,
  //         this.selectedItemId!,
  //         this.dateFrom,
  //         this.dateTo,
  //         this.inventoryDetailsService.ApiServ.GetHeader()
  //       )
  //       .toPromise();

  //     if (!response) {
  //       throw new Error('No data received');
  //     }

  //     this.processReportData(response.summary, response.transactions || []);
  //     this.showTable = true;
  //   } catch (error) {
  //     this.combinedData = [];
  //     this.showTable = true;
  //   } finally {
  //     this.isLoading = false;
  //   }
  // }

  // updated viewReport method

  async viewReport() {
    if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        title: 'Invalid Date Range',
        text: 'Start date cannot be later than end date.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.isLoading = true;
    this.showTable = false;
    this.combinedData = [];

    try {
      const response = await this.inventoryDetailsService
        .getInventoryNetCombined(
          this.selectedStoreId!,
          this.selectedItemId!,
          this.dateFrom,
          this.dateTo,
          this.inventoryDetailsService.ApiServ.GetHeader(),
          this.currentPage,
          this.pageSize
        )
        .toPromise();

      if (!response) {
        throw new Error('No data received');
      }

      if (response.pagination) {
        this.currentPage = response.pagination.currentPage || this.currentPage;
        this.pageSize = response.pagination.pageSize || this.pageSize;
        this.totalPages = response.pagination.totalPages || 1;
        this.totalRecords = response.pagination.totalRecord || 0;
      } else {

        this.totalRecords = response.transactions?.length || 0;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
      }

      this.processReportData(response.summary, response.transactions || []);
      this.showTable = true;
    } catch (error) {
      this.combinedData = [];
      this.showTable = true;
      this.totalPages = 1;
      this.totalRecords = 0;
    } finally {
      this.isLoading = false;
    }
  }

  private processReportData(
    summary: InventoryNetCombinedResponse['summary'],
    transactions: InventoryNetCombinedTransaction[]
  ) {
    const summaryRow: any = {
      isSummary: true,
      date: summary.toDate || '-',
      transactionType: 'Initial Balance',
      invoiceNumber: '0',
      authority: '-',
      income: summary.inQuantity || '-',
      outcome: summary.outQuantity || '-',
      balance: summary.quantitybalance || '-',
      averageCost: summary.costBalance ?? '-',
    };

    if (this.showAverageColumn) {
      summaryRow.price = '-';
      summaryRow.totalPrice = '-';
    }

    const transactionRows = transactions.map((t) => {
      const row: any = {
        isSummary: false,
        date: t.date || '-',
        transactionType: t.flagName || '-',
        invoiceNumber: t.invoiceNumber || '-',
        authority: t.supplierName || t.studentName || t.storeToName || '-',
        income: t.inQuantity || '-',
        outcome: t.outQuantity || '-',
        balance: t.balance ?? '-',
      };

      if (this.showAverageColumn) {
        row.price = t.price ?? '-';
        row.totalPrice = t.totalPrice ?? '-';
        row.averageCost = t.averageCost ?? '-';
      }

      return row;
    });

    this.combinedData = [summaryRow, ...transactionRows];
    this.prepareExportData();
  }

  private prepareExportData(): void {
    this.transactionsForExport = this.combinedData.map((t) => {
      const formatDate = (date: any) => {
        if (!date) return '-';
        if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}/)) {
          return date.slice(0, 10);
        }
        try {
          const d = new Date(date);
          return isNaN(d.getTime()) ? '-' : d.toISOString().slice(0, 10);
        } catch (e) {
          return '-';
        }
      };

      return {
        Date: formatDate(t.date),
        Type: t.transactionType || '-',
        '#': t.invoiceNumber || '-',
        Authority: t.authority || '-',
        Income: t.income || '-',
        Outcome: t.outcome || '-',
        Balance: t.balance || '-',
        ...(this.showAverageColumn && {
          Price: t.price || '-',
          'Total Price': t.totalPrice || '-',
          Avg: t.averageCost || '-',
        }),
      };
    });
  }

  async DownloadAsPDF() {
    if (this.transactionsForExport.length == 0) {
      const Swal = await import('sweetalert2').then(m => m.default);

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
      this.pdfPrintComponent.downloadPDF(); // Call manual download
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }

  async Print() {
    if (this.transactionsForExport.length == 0) {
      const Swal = await import('sweetalert2').then(m => m.default);

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

      // Create a print-specific stylesheet
      const printStyle = `
        <style>
          @page { size: auto; margin: 0mm; }
          body { 
            margin: 0; 
          }

          @media print {
            body > *:not(#print-container) {
              display: none !important;
            }
            #print-container {
              display: block !important;
              position: static !important;
              top: auto !important;
              left: auto !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              box-shadow: none !important;
              margin: 0 !important;
            }
          }
        </style>
      `;

      // Create a container for printing
      const printContainer = document.createElement('div');
      printContainer.id = 'print-container';
      printContainer.innerHTML = printStyle + printContents;

      // Add to body and print
      document.body.appendChild(printContainer);
      window.print();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(printContainer);
        this.showPDF = false;
      }, 100);
    }, 500);
  }
  //old exportExcel method
  // exportExcel() {
  //   if (this.combinedData.length == 0) {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'No Data',
  //       text: 'No data to export!',
  //       confirmButtonText: 'OK',
  //     });
  //     return;
  //   }

  //   const excelData: any[] = [];

  //   excelData.push([
  //     {
  //       v: `${this.school.reportHeaderOneEn} - ${this.school.reportHeaderTwoEn}`,
  //       s: {
  //         font: { bold: true, sz: 16 },
  //         alignment: { horizontal: 'center' },
  //       },
  //     },
  //   ]);
  //   excelData.push([]);

  //   excelData.push([
  //     { v: 'From Date:', s: { font: { bold: true } } },
  //     { v: this.dateFrom, s: { font: { bold: true } } },
  //   ]);
  //   excelData.push([
  //     { v: 'To Date:', s: { font: { bold: true } } },
  //     { v: this.dateTo, s: { font: { bold: true } } },
  //   ]);
  //   const selectedStore = this.stores.find(
  //     (s) => s.id === this.selectedStoreId
  //   );
  //   excelData.push([
  //     { v: 'Store:', s: { font: { bold: true } } },
  //     { v: selectedStore?.name || '-', s: { font: { bold: true } } },
  //   ]);
  //   const selectedItem = this.items.find((i) => i.id === this.selectedItemId);
  //   excelData.push([
  //     { v: 'Item:', s: { font: { bold: true } } },
  //     { v: selectedItem?.enName || '-', s: { font: { bold: true } } },
  //   ]);
  //   excelData.push([]);

  //   const headers = [
  //     'Date',
  //     'Transaction Type',
  //     'Invoice #',
  //     'Authority',
  //     'Income',
  //     'Outcome',
  //     'Balance',
  //   ];
  //   if (this.showAverageColumn) {
  //     headers.push('Price', 'Total Price', 'Average Cost');
  //   }
  //   excelData.push(
  //     headers.map((h) => ({
  //       v: h,
  //       s: {
  //         font: { bold: true, color: { rgb: 'FFFFFF' } },
  //         fill: { fgColor: { rgb: '4472C4' } },
  //         alignment: { horizontal: 'center' },
  //         border: {
  //           top: { style: 'thin' },
  //           bottom: { style: 'thin' },
  //           left: { style: 'thin' },
  //           right: { style: 'thin' },
  //         },
  //       },
  //     }))
  //   );

  //   this.combinedData.forEach((row, idx) => {
  //     const isEven = idx % 2 === 0;
  //     const fillColor = isEven ? 'E9E9E9' : 'FFFFFF';
  //     const getVal = (val: any) =>
  //       val === null || val === undefined || val === '' ? '-' : val;

  //     const rowData = [
  //       {
  //         v: row.date ? new Date(row.date).toLocaleString() : '-',
  //         s: { fill: { fgColor: { rgb: fillColor } } },
  //       },
  //       {
  //         v: getVal(row.transactionType),
  //         s: { fill: { fgColor: { rgb: fillColor } } },
  //       },
  //       {
  //         v: getVal(row.invoiceNumber),
  //         s: { fill: { fgColor: { rgb: fillColor } } },
  //       },
  //       {
  //         v: getVal(row.authority),
  //         s: { fill: { fgColor: { rgb: fillColor } } },
  //       },
  //       { v: getVal(row.income), s: { fill: { fgColor: { rgb: fillColor } } } },
  //       {
  //         v: getVal(row.outcome),
  //         s: { fill: { fgColor: { rgb: fillColor } } },
  //       },
  //       {
  //         v: getVal(row.balance),
  //         s: { fill: { fgColor: { rgb: fillColor } } },
  //       },
  //     ];
  //     if (this.showAverageColumn) {
  //       rowData.push(
  //         {
  //           v: getVal(row.price),
  //           s: { fill: { fgColor: { rgb: fillColor } } },
  //         },
  //         {
  //           v: getVal(row.totalPrice),
  //           s: { fill: { fgColor: { rgb: fillColor } } },
  //         },
  //         {
  //           v: getVal(row.averageCost),
  //           s: { fill: { fgColor: { rgb: fillColor } } },
  //         }
  //       );
  //     }
  //     excelData.push(rowData);
  //   });

  //   const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  //   if (!worksheet['!merges']) worksheet['!merges'] = [];
  //   worksheet['!merges'].push({
  //     s: { r: 0, c: 0 },
  //     e: { r: 0, c: headers.length - 1 },
  //   });

  //   worksheet['!cols'] = [
  //     { wch: 12 },
  //     { wch: 18 },
  //     { wch: 12 },
  //     { wch: 20 },
  //     { wch: 10 },
  //     { wch: 10 },
  //     { wch: 12 },
  //     ...(this.showAverageColumn
  //       ? [{ wch: 10 }, { wch: 14 }, { wch: 14 }]
  //       : []),
  //   ];

  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Item Card Report');

  //   const dateStr = new Date().toISOString().slice(0, 10);
  //   XLSX.writeFile(workbook, `Item_Card_Report_${dateStr}.xlsx`);
  // }

  async exportExcel() {
    if (this.combinedData.length == 0) {
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'No data to export!',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Prepare data with styling information
    const excelData: any[] = [];

    // Add report title with styling
    const reportTitle = this.showAverageColumn
      ? 'Item Card Report With Average Information'
      : 'Item Card Report';

    excelData.push([{
      v: reportTitle,
      s: {
        font: { bold: true, size: 16 },
        alignment: { horizontal: 'center' }
      }
    }]);
    excelData.push([]); // empty row

    // Add filter information with styling
    excelData.push([
      { v: 'From Date:', s: { font: { bold: true } } },
      { v: this.dateFrom, s: { font: { bold: true } } }
    ]);
    excelData.push([
      { v: 'To Date:', s: { font: { bold: true } } },
      { v: this.dateTo, s: { font: { bold: true } } }
    ]);

    const selectedStore = this.stores.find(s => s.id === this.selectedStoreId);
    excelData.push([
      { v: 'Store:', s: { font: { bold: true } } },
      { v: selectedStore?.name || '-', s: { font: { bold: true } } }
    ]);

    const selectedItem = this.items.find(i => i.id === this.selectedItemId);
    excelData.push([
      { v: 'Item:', s: { font: { bold: true } } },
      { v: selectedItem?.enName || '-', s: { font: { bold: true } } }
    ]);
    excelData.push([]); // empty row

    // Define headers based on whether average column is shown
    const headers = [
      'Date',
      'Transaction Type',
      'Invoice #',
      'Authority',
      'Income',
      'Outcome',
      'Balance'
    ];

    if (this.showAverageColumn) {
      headers.push('Price', 'Total Price', 'Average Cost');
    }

    // Add table headers with styling
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
            right: { style: 'thin' }
          }
        }
      }))
    );

    // Add data rows with alternating colors
    this.combinedData.forEach((row, idx) => {
      const isEven = idx % 2 === 0;
      const fillColor = isEven ? 'E9E9E9' : 'FFFFFF';

      const getVal = (val: any) => {
        if (val === null || val === undefined || val === '') return '-';
        if (typeof val === 'number') {
          // Format numbers to 2 decimal places if they have decimal values
          return val % 1 === 0 ? val : Number(val.toFixed(2));
        }
        return val;
      };

      const rowData = [
        {
          v: row.date ? new Date(row.date).toLocaleDateString() : '-',
          s: {
            fill: { fgColor: { rgb: fillColor } },
            border: {
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          }
        },
        {
          v: getVal(row.transactionType),
          s: {
            fill: { fgColor: { rgb: fillColor } },
            border: {
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          }
        },
        {
          v: getVal(row.invoiceNumber),
          s: {
            fill: { fgColor: { rgb: fillColor } },
            border: {
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          }
        },
        {
          v: getVal(row.authority),
          s: {
            fill: { fgColor: { rgb: fillColor } },
            border: {
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          }
        },
        {
          v: getVal(row.income),
          s: {
            fill: { fgColor: { rgb: fillColor } },
            border: {
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          }
        },
        {
          v: getVal(row.outcome),
          s: {
            fill: { fgColor: { rgb: fillColor } },
            border: {
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          }
        },
        {
          v: getVal(row.balance),
          s: {
            fill: { fgColor: { rgb: fillColor } },
            border: {
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          }
        }
      ];

      // Add average columns if needed
      if (this.showAverageColumn) {
        rowData.push(
          {
            v: getVal(row.price),
            s: {
              fill: { fgColor: { rgb: fillColor } },
              border: {
                left: { style: 'thin' },
                right: { style: 'thin' }
              }
            }
          },
          {
            v: getVal(row.totalPrice),
            s: {
              fill: { fgColor: { rgb: fillColor } },
              border: {
                left: { style: 'thin' },
                right: { style: 'thin' }
              }
            }
          },
          {
            v: getVal(row.averageCost),
            s: {
              fill: { fgColor: { rgb: fillColor } },
              border: {
                left: { style: 'thin' },
                right: { style: 'thin' }
              }
            }
          }
        );
      }

      excelData.push(rowData);
    });

    const XLSX = await import('xlsx-js-style');
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Merge title row
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({
      s: { r: 0, c: 0 },
      e: { r: 0, c: headers.length - 1 }
    });

    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 },  // Date
      { wch: 20 },  // Transaction Type
      { wch: 12 },  // Invoice #
      { wch: 20 },  // Authority
      { wch: 10 },  // Income
      { wch: 10 },  // Outcome
      { wch: 12 },  // Balance
      ...(this.showAverageColumn ? [
        { wch: 10 },  // Price
        { wch: 12 },  // Total Price
        { wch: 14 }   // Average Cost
      ] : [])
    ];

    // Create workbook and save
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Item Card Report');

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = this.showAverageColumn
      ? `Item_Card_With_Average_Report_${dateStr}.xlsx`
      : `Item_Card_Report_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }


  getPdfTableHeaders(): string[] {
    const headers = [
      'Date',
      'Type',
      '#',
      'Authority',
      'Income',
      'Outcome',
      'Balance',
    ];

    if (this.showAverageColumn) {
      headers.push('Price', 'Total Price', 'Avg');
    }

    return headers;
  }

  getStoreName(): string {
    if (!this.selectedStoreId) return '-';
    const store = this.stores.find(s => s.id === this.selectedStoreId);
    return store?.name || '-';
  }

  getItemName(): string {
    if (!this.selectedItemId) return '-';
    const item = this.items.find(i => i.id === this.selectedItemId);
    return item?.enName || '-';
  }

  hasAverageInfo(): boolean {
    return this.showAverageColumn;
  }
  getInfoRows(): any[] {
    return [
      { keyEn: 'From Date: ' + this.dateFrom },
      { keyEn: 'To Date: ' + this.dateTo },
      { keyEn: 'Store: ' + this.getStoreName() },
      { keyEn: 'Item: ' + this.getItemName() },
      ...(this.hasAverageInfo() ? [{ keyEn: 'Includes Cost Information' }] : [])
    ];
  }

  // ==================== Pagination Functions  Gaber --77 ====================

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalRecords: number = 0;           // New property to hold total records---

  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = current - half;
    let end = current + half;

    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }



  changeCurrentPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.viewReport();
  }


  onPageSizeChange(newSize: any): void {
    const numValue = parseInt(newSize);

    if (isNaN(numValue) || numValue < 1) {
      this.pageSize = 10;
    } else {
      this.pageSize = numValue;
    }

    this.currentPage = 1;
    this.viewReport();

  }

  validateNumber(event: any): void {
    const value = event.target.value;
    const numValue = parseInt(value);

    if (isNaN(numValue) || numValue < 1) {
      event.target.value = this.pageSize;
      return;
    }
  }


}