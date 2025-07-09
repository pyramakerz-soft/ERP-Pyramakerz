import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
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

  // onStoreSelected() {
  //   if (this.selectedStoreId) {
  //     this.loadItems();
  //   } else {
  //     this.items = [];
  //     this.selectedItemId = null;
  //   }
  // }

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
    // Hide the table whenever any filter changes
    this.showTable = false;

    // Also clear the existing data
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
      const formattedDateFrom = this.formatDateForAPI(this.dateFrom);
      const formattedDateTo = this.formatDateForAPI(this.dateTo);

      console.log('Fetching report with parameters:', {
        storeId: this.selectedStoreId,
        itemId: this.selectedItemId,
        fromDate: formattedDateFrom,
        toDate: formattedDateTo,
      });

      // Get summary data
      const summaryResponse = await this.inventoryDetailsService
        .getInventoryNetSummary(
          this.selectedStoreId!,
          this.selectedItemId!,
          formattedDateFrom,
          this.inventoryDetailsService.ApiServ.GetHeader()
        )
        .toPromise();

      console.log('Summary response:', summaryResponse);

      if (!summaryResponse) {
        throw new Error('No summary data received');
      }

      // Get transaction data
      const transactionsResponse = await this.inventoryDetailsService
        .getInventoryNetTransactions(
          this.selectedStoreId!,
          this.selectedItemId!,
          formattedDateFrom,
          formattedDateTo,
          this.inventoryDetailsService.ApiServ.GetHeader()
        )
        .toPromise();

      console.log('Transactions response:', transactionsResponse);

      // Process and combine data
      await this.processReportData(summaryResponse, transactionsResponse || []);

      this.showTable = true;
    } catch (error) {
      console.error('Error loading report:', error);
      this.combinedData = [];
      this.showTable = true;
      alert('Failed to load report data. Please check console for details.');
    } finally {
      this.isLoading = false;
    }
  }

  validateDateRange(): boolean {
    if (this.dateFrom && this.dateTo) {
      const fromDate = new Date(this.dateFrom);
      const toDate = new Date(this.dateTo);

      if (fromDate > toDate) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Date Range',
          text: '"Date From" cannot be after "Date To"',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });
        return false;
      }
    }
    return true;
  }

  private async processReportData(
    summary: InventoryNetSummary,
    transactions: InventoryNetTransaction[]
  ) {
    const formattedToDate = this.formatDisplayDate(summary.toDate);

    const summaryRow: any = {
      isSummary: true,
      date: formattedToDate,
      transactionType: 'Initial Balance',
      invoiceNumber: '0',
      authority: '-',
      income: summary.inQuantity,
      outcome: summary.outQuantity,
      balance: summary.balance,
    };

    if (this.showAverageColumn) {
      summaryRow.average = await this.getAverageCost(summary.shopItemId);
    }

    // Process transactions
    const transactionRows = [];
    for (const t of transactions) {
      const row: any = {
        isSummary: false,
        date: t.dayDate,
        transactionType: t.flagName,
        invoiceNumber: t.invoiceNumber,
        authority: t.supplierName || t.studentName || t.storeToName || 'N/A',
        income: t.totalIn > 0 ? t.totalIn : '',
        outcome: t.totalOut > 0 ? t.totalOut : '',
        balance: t.balance,
      };

      if (this.showAverageColumn) {
        row.average = await this.getAverageCost(summary.shopItemId);
      }

      transactionRows.push(row);
    }

    // Combine data
    this.combinedData = [summaryRow, ...transactionRows];
    this.prepareExportData();
  }

  private async getAverageCost(itemId: number, date?: string): Promise<number> {
    try {
      console.group('getAverageCost Debug Info');
      console.log('Input parameters:', { itemId, date });

      // Format dates as MM/DD/YYYY
      const formatDateForAverageAPI = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.error('Invalid date:', dateString);
          return '';
        }
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };

      const formattedDateFrom = formatDateForAverageAPI(this.dateFrom);
      const formattedDateTo = date
        ? formatDateForAverageAPI(date)
        : formatDateForAverageAPI(this.dateTo);

      console.log('Formatted dates for API:', {
        fromDate: formattedDateFrom,
        toDate: formattedDateTo,
      });

      const response = await this.inventoryDetailsService
        .getMovingAverageCost(
          this.selectedStoreId!,
          this.selectedItemId!,
          formattedDateFrom,
          formattedDateTo,
          this.inventoryDetailsService.ApiServ.GetHeader()
        )
        .toPromise();

      console.log('Full API response:', response);

      console.log('No data found in response');
      console.groupEnd();
      return 0;
    } catch (error) {
      console.error('Error in getAverageCost:', error);
      console.groupEnd();
      return 0;
    }
  }

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
    this.transactionsForExport = this.combinedData.map((t) => ({
      Date: t.isSummary ? t.date : new Date(t.date).toLocaleDateString(),
      Transaction: t.transactionType,
      'Invoice #': t.invoiceNumber,
      Authority: t.authority,
      Income: t.income,
      Outcome: t.outcome,
      Balance: t.balance,
      ...(this.showAverageColumn && { Average: t.average }),
    }));
  }

  private formatDateForAPI(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '';
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // private validateFilters(): boolean {
  //   return (
  //     !!this.dateFrom &&
  //     !!this.dateTo &&
  //     this.selectedStoreId !== null &&
  //     this.selectedItemId !== null
  //   );
  // }

  DownloadAsPDF() {
    if (this.transactionsForExport.length === 0) {
      alert('No data to export!');
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
      alert('No data to print!');
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
        @page { size: auto; margin: 0mm; }
        body { margin: 0; }
        @media print {
          body > *:not(#print-container) { display: none !important; }
          #print-container {
            display: block !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            margin: 0 !important;
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
    const worksheet = XLSX.utils.json_to_sheet(this.transactionsForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Item Transactions');

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
      ...(this.showAverageColumn ? [{ keyEn: 'Includes Average Cost' }] : []),
    ];
  }

  getTableDataWithHeader(): any[] {
    return [
      {
        header: `Item Card Report${
          this.showAverageColumn ? ' With Average' : ''
        } - ${
          this.items.find((i) => i.id === this.selectedItemId)?.enName || ''
        }`,
        data: [
          {
            key: 'Store',
            value:
              this.stores.find((s) => s.id === this.selectedStoreId)?.name ||
              'N/A',
          },
          {
            key: 'Item',
            value:
              this.items.find((i) => i.id === this.selectedItemId)?.enName ||
              'N/A',
          },
          { key: 'Period', value: `${this.dateFrom} to ${this.dateTo}` },
          ...(this.showAverageColumn
            ? [{ key: 'Includes', value: 'Average' }]
            : []),
        ],
        details: {
          headers: [
            'Date',
            'Transaction',
            'Invoice #',
            'Authority',
            'Income',
            'Outcome',
            'Balance',
            ...(this.showAverageColumn ? ['Average'] : []),
          ],
          data: this.combinedData.map((t) => ({
            Date: t.isSummary
              ? 'Summary'
              : new Date(t.date).toLocaleDateString(),
            Transaction: t.transactionType,
            'Invoice #': t.invoiceNumber,
            Authority: t.authority,
            Income: t.income,
            Outcome: t.outcome,
            Balance: t.balance,
            ...(this.showAverageColumn && { Average: t.average }),
          })),
        },
      },
    ];
  }

  getPdfTableHeaders(): string[] {
    const headers = [
      'Date',
      'Transaction',
      'Invoice #',
      'Authority',
      'Income',
      'Outcome',
      'Balance',
    ];

    if (this.showAverageColumn) {
      headers.push('Average');
    }

    return headers;
  }
}
