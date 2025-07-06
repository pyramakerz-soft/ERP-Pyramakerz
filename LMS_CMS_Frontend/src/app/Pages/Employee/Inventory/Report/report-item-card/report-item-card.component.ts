// report-item-card.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { Store } from '../../../../../Models/Inventory/store';
import { InventoryDetailsService } from '../../../../../Services/Employee/Inventory/inventory-details.service';
import { StoresService } from '../../../../../Services/Employee/Inventory/stores.service';
import { ShopItemService } from '../../../../../Services/Employee/Inventory/shop-item.service';
import { CombinedReportData, InventoryNetSummary, InventoryNetTransaction } from '../../../../../Models/Inventory/report-card';

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
    private shopItemService: ShopItemService
  ) {}

  ngOnInit() {
    this.loadStores();
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

  onStoreSelected() {
    if (this.selectedStoreId) {
      this.loadItems();
    } else {
      this.items = [];
      this.selectedItemId = null;
    }
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

  async viewReport() {
    if (!this.validateFilters()) {
      console.error('Validation failed - missing required filters');
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
        toDate: formattedDateFrom,
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
      this.processReportData(summaryResponse, transactionsResponse || []);

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

  private processReportData(
    summary: InventoryNetSummary,
    transactions: InventoryNetTransaction[]
  ) {
    const formattedToDate = this.formatDisplayDate(summary.toDate);

    const summaryRow: CombinedReportData = {
      isSummary: true,
      date: formattedToDate,
      transactionType: '',
      invoiceNumber: '0',
      authority: '',
      income: summary.inQuantity,
      outcome: summary.outQuantity,
      balance: summary.balance,
    };

    // Process transactions
    const transactionRows = transactions.map((t) => ({
      isSummary: false,
      date: t.dayDate,
      transactionType: t.flagName,
      invoiceNumber: t.invoiceNumber,
      authority: t.supplierName || t.studentName || t.storeToName || 'N/A',
      income: t.totalIn > 0 ? t.totalIn : '',
      outcome: t.totalOut > 0 ? t.totalOut : '',
      balance: t.balance,
    }));

    // Combine data
    this.combinedData = [summaryRow, ...transactionRows];
    this.prepareExportData();
  }

  private formatDisplayDate(dateString: string): string {
    try {
      // First convert to Date object
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

  // private processReportData(summary: any, transactions: any[]) {
  //   // Create summary row
  //   const summaryRow: CombinedReportData = {
  //     isSummary: true,
  //     date: 'Summary',
  //     transactionType: 'Opening Balance',
  //     invoiceNumber: '',
  //     authority: '',
  //     income: '',
  //     outcome: '',
  //     balance: summary?.openingBalance || 0,
  //   };

  //   // Process transactions
  //   const transactionRows = transactions.map((t) => ({
  //     isSummary: false,
  //     date: t.date,
  //     transactionType: t.transactionType,
  //     invoiceNumber: t.invoiceNumber || 'N/A',
  //     authority: t.authority || 'N/A',
  //     income: t.quantity > 0 ? t.quantity : '',
  //     outcome: t.quantity < 0 ? Math.abs(t.quantity) : '',
  //     balance: t.balance,
  //   }));

  //   // Calculate running balance if needed
  //   let runningBalance = summary?.openingBalance || 0;
  //   transactionRows.forEach((t) => {
  //     runningBalance +=
  //       (typeof t.income === 'number' ? t.income : 0) -
  //       (typeof t.outcome === 'number' ? t.outcome : 0);
  //     t.balance = runningBalance;
  //   });

  //   // Combine data
  //   this.combinedData = [summaryRow, ...transactionRows];
  //   this.prepareExportData();

  //   console.log('Combined report data:', this.combinedData);
  // }

  private prepareExportData(): void {
    this.transactionsForExport = this.combinedData.map((t) => ({
      Date: t.isSummary ? t.date : new Date(t.date).toLocaleDateString(),
      'Transaction Type': t.transactionType,
      'Invoice Number': t.invoiceNumber,
      Authority: t.authority,
      Income: t.income,
      Outcome: t.outcome,
      Balance: t.balance,
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

  private validateFilters(): boolean {
    return (
      !!this.dateFrom &&
      !!this.dateTo &&
      this.selectedStoreId !== null &&
      this.selectedItemId !== null
    );
  }

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
    ];
  }

  getTableDataWithHeader(): any[] {
    return [
      {
        header: `Item Card Report - ${
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
        ],
        details: {
          headers: [
            'Date',
            'Transaction Type',
            'Invoice Number',
            'Authority',
            'Income',
            'Outcome',
            'Balance',
          ],
          data: this.combinedData.map((t) => ({
            Date: t.isSummary
              ? 'Summary'
              : new Date(t.date).toLocaleDateString(),
            'Transaction Type': t.transactionType,
            'Invoice Number': t.invoiceNumber,
            Authority: t.authority,
            Income: t.income,
            Outcome: t.outcome,
            Balance: t.balance,
          })),
        },
      },
    ];
  }
}
