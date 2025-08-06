import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '../../../../../../Models/Inventory/store';
import { InventoryMaster } from '../../../../../../Models/Inventory/InventoryMaster';
import { InventoryMasterService } from '../../../../../../Services/Employee/Inventory/inventory-master.service';
import { StoresService } from '../../../../../../Services/Employee/Inventory/stores.service';
// import * as XLSX from 'xlsx';
import * as XLSX from 'xlsx-js-style';

import { PdfPrintComponent } from '../../../../../../Component/pdf-print/pdf-print.component';
import { InventoryCategoryService } from '../../../../../../Services/Employee/Inventory/inventory-category.service';
import { InventorySubCategoriesService } from '../../../../../../Services/Employee/Inventory/inventory-sub-categories.service';
import { ShopItemService } from '../../../../../../Services/Employee/Inventory/shop-item.service';

interface FlagOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-invoice-report-master-detailed',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent],
  templateUrl: './invoice-report-master-detailed.component.html',
  styleUrls: ['./invoice-report-master-detailed.component.css'],
})
export class InvoiceReportMasterDetailedComponent implements OnInit {
  dateFrom: string = '';
  dateTo: string = '';
  selectedStoreId: number | null = null;
  stores: Store[] = [];
  transactions: InventoryMaster[] = [];
  showTable: boolean = false;
  isLoading: boolean = false;
  reportType: string = '';
  selectedFlagId: number = -1;
  selectedFlagIds: number[] = [];

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalRecords: number = 0;

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  showPDF = false;
  transactionsForExport: any[] = [];

  school = {
    reportHeaderOneEn: 'Inventory Report',
    reportHeaderTwoEn: 'Transaction Details',
    reportHeaderOneAr: 'تقرير المخزون',
    reportHeaderTwoAr: 'تفاصيل المعاملة',
    reportImage: 'assets/images/logo.png',
  };

  availableFlags: { [key: string]: FlagOption[] } = {
    inventory: [
      { id: 1, name: 'Opening Balances' },
      { id: 2, name: 'Addition' },
      { id: 3, name: 'Addition Adjustment' },
      { id: 4, name: 'Disbursement' },
      { id: 5, name: 'Disbursement Adjustment' },
      { id: 6, name: 'Gifts' },
      { id: 7, name: 'Damaged' },
      { id: 8, name: 'Transfer to Warehouse' },
    ],
    sales: [
      { id: 11, name: 'Sales' },
      { id: 12, name: 'Sales Returns' },
    ],
    purchase: [
      { id: 9, name: 'Purchases' },
      { id: 10, name: 'Purchase Returns' },
      { id: 13, name: 'Purchase Order' },
    ],
  };

  currentFlags: FlagOption[] = [];
  selectedCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null;
  selectedItemId: number | null = null;
  categories: any[] = [];
  subCategories: any[] = [];
  items: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private inventoryMasterService: InventoryMasterService,
    private storesService: StoresService,
    private categoryService: InventoryCategoryService,
    private subCategoryService: InventorySubCategoriesService,
    private shopItemService: ShopItemService
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.reportType = data['reportType'];
      this.currentFlags = this.availableFlags[this.reportType];
      this.selectedFlagIds = this.currentFlags.map((flag) => flag.id);
    });
    this.loadStores();

    this.loadCategories();
  }

  loadCategories() {
    this.categoryService
      .Get(this.categoryService.ApiServ.GetHeader())
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        },
      });
  }
  onCategorySelected() {
    this.selectedSubCategoryId = null;
    this.selectedItemId = null;
    this.items = [];

    if (this.selectedCategoryId === null) {
      this.subCategories = [];
      // Explicitly disable the dependent dropdowns
      this.selectedSubCategoryId = null;
      this.selectedItemId = null;
    } else {
      this.subCategoryService
        .GetByCategoryId(
          this.selectedCategoryId,
          this.subCategoryService.ApiServ.GetHeader()
        )
        .subscribe({
          next: (subCategories) => {
            this.subCategories = subCategories;
          },
          error: (error) => {
            console.error('Error loading subcategories:', error);
          },
        });
    }
  }

  onSubCategorySelected() {
    this.selectedItemId = null;

    if (this.selectedSubCategoryId === null) {
      this.items = [];
    } else {
      this.shopItemService
        .GetBySubCategory(
          this.selectedSubCategoryId,
          this.shopItemService.ApiServ.GetHeader()
        )
        .subscribe({
          next: (items) => {
            this.items = items;
          },
          error: (error) => {
            console.error('Error loading items:', error);
          },
        });
    }
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

  onFlagSelected() {
    this.selectedFlagIds = [];
    if (this.selectedFlagId == -1) {
      this.selectedFlagIds = this.getAllFlagsForReportType();
    } else {
      this.selectedFlagIds = [this.selectedFlagId];
    }
  }

  getAllFlagsForReportType(): number[] {
    if (this.reportType === 'inventory') {
      return [1, 2, 3, 4, 5, 6, 7, 8];
    }
    if (this.reportType === 'sales') {
      return [11, 12];
    }
    if (this.reportType === 'purchase') {
      return [9, 10, 13];
    }
    return [];
  }

  viewReport() {
    if (!this.validateFilters()) return;

    this.isLoading = true;
    this.showTable = false;




    this.inventoryMasterService
      .search(
        this.inventoryMasterService.ApiServ.GetHeader(),
        this.selectedStoreId,
        this.dateFrom,
        this.dateTo,
        this.selectedFlagIds,
        this.selectedCategoryId,
        this.selectedSubCategoryId,
        this.selectedItemId,
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response)) {
            this.transactions = response;
            this.totalRecords = response.length;
            this.totalPages = Math.ceil(response.length / this.pageSize);
          } else if (response?.data) {
            this.transactions = response.data;
            this.totalRecords =
              response.pagination?.totalRecords || response.data.length;
            this.totalPages =
              response.pagination?.totalPages ||
              Math.ceil(response.data.length / this.pageSize);
          } else {
            this.transactions = [];
          }

          this.prepareExportData();
          this.showTable = true;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          this.transactions = [];
          this.showTable = true;
          this.isLoading = false;
        },
      });
  }

  private prepareExportData(): void {
    this.transactionsForExport = this.transactions.map((t) => ({
      header: `Invoice #${t.invoiceNumber}`,
      summary: [
        { key: 'Date', value: new Date(t.date).toLocaleDateString() },
        { key: 'Store', value: t.storeName },
        ...(this.reportType === 'sales'
          ? [{ key: 'Student', value: t.studentName || 'N/A' }]
          : []),
        ...(this.reportType === 'purchase'
          ? [{ key: 'Supplier', value: t.supplierName || 'N/A' }]
          : []),
        { key: 'Transaction Type', value: t.flagEnName },
        { key: 'Invoice Number', value: t.invoiceNumber },
        { key: 'Total Price', value: t.total },
        { key: 'Notes', value: t.notes || 'N/A' },
      ],
      table: {
        headers: [
          'ID',
          'Item ID',
          'Name',
          'Quantity',
          'Price',
          'Total Price',
          'Notes',
        ],
        data:
          t.inventoryDetails?.map((d) => ({
            ID: d.id,
            'Item ID': d.shopItemID,
            Name: d.shopItemName || d.name || 'N/A',
            Quantity: d.quantity,
            Price: d.price,
            'Total Price': d.totalPrice,
            Notes: d.notes || 'N/A',
          })) || [],
      },
    }));
  }

  getTableDataWithHeader(): any[] {
    return this.transactionsForExport.map((item) => ({
      header: item.header,
      data: item.summary,
      tableHeaders: item.table.headers,
      tableData: item.table.data,
    }));
  }

  getInfoRows(): any[] {
    const rows = [
      { keyEn: 'From Date: ' + this.dateFrom, valueEn: '' },
      { keyEn: 'To Date: ' + this.dateTo, valueEn: '' },
      { keyEn: 'Store: ' + this.getStoreName(), valueEn: '' },
    ];

    // Add student/supplier info if available
    if (
      this.reportType === 'sales' &&
      this.transactions.some((t) => t.studentName)
    ) {
      rows.push({
        keyEn: 'Student: ' + (this.transactions[0]?.studentName || 'N/A'),
        valueEn: '',
      });
    }
    if (
      this.reportType === 'purchase' &&
      this.transactions.some((t) => t.supplierName)
    ) {
      rows.push({
        keyEn: 'Supplier: ' + (this.transactions[0]?.supplierName || 'N/A'),
        valueEn: '',
      });
    }

    return rows;
  }

  getStoreName(): string {
    return (
      this.stores.find((s) => s.id === this.selectedStoreId)?.name ||
      'All Stores'
    );
  }

  // private formatDateForAPI(dateString: string): string {
  //   if (!dateString) return '';

  //   const date = new Date(dateString);
  //   if (isNaN(date.getTime())) {
  //     console.error('Invalid date:', dateString);
  //     return '';
  //   }

  //   // Format as DD/MM/YYYY (what backend expects)
  //   const day = date.getDate().toString().padStart(2, '0');
  //   const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // }

  private validateFilters(): boolean {
    return !!this.dateFrom && !!this.dateTo && this.selectedFlagIds.length > 0;
  }
  changePage(page: number) {
    this.currentPage = page;
    this.viewReport();
  }

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

  DownloadAsPDF() {
    if (this.transactionsForExport.length === 0) {
      alert('No data to export!');
      return;
    }

    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }

  Print() {
    if (this.transactionsForExport.length == 0) {
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
  if (this.transactions.length === 0) {
    alert('No data to export!');
    return;
  }

  // Prepare data with styling information
  const excelData = [];

  // Add report title with styling
  excelData.push([{ v: `${this.reportType.toUpperCase()} TRANSACTION REPORT DETAILED`, s: { font: { bold: true, size: 16 }, alignment: { horizontal: 'center' } } }]);
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
  excelData.push([
    { v: 'Store:', s: { font: { bold: true } } },
    { v: this.getStoreName(), s: { font: { bold: true } } }
  ]);
  excelData.push([]); // empty row

  // Add transaction data
  this.transactions.forEach(transaction => {
    // Add invoice header with styling
    excelData.push([
      { v: `Invoice #${transaction.invoiceNumber}`, s: { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '4472C4' } }} }
    ]);
    
    // Add invoice details with alternating row colors
    const details = [
      ['Date:', new Date(transaction.date).toLocaleDateString()],
      ['Store:', transaction.storeName],
      ...(this.reportType === 'sales' ? [['Student:', transaction.studentName || 'N/A']] : []),
      ...(this.reportType === 'purchase' ? [['Supplier:', transaction.supplierName || 'N/A']] : []),
      ['Transaction Type:', transaction.flagEnName],
      ['Total Price:', transaction.total],
      ['Notes:', transaction.notes || 'N/A']
    ];

    details.forEach((row, i) => {
      excelData.push([
        { v: row[0], s: { font: { bold: true }, fill: { fgColor: { rgb: i % 2 === 0 ? 'D9E1F2' : 'FFFFFF' } } } },
        { v: row[1], s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'D9E1F2' : 'FFFFFF' } } } }
      ]);
    });

    excelData.push([]); // empty row

    // Add items table header with styling
    excelData.push([
      { v: 'ID', s: { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } }, color: { rgb: 'FFFFFF' }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } },
      { v: 'Item ID', s: { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } }, color: { rgb: 'FFFFFF' }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } },
      { v: 'Name', s: { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } }, color: { rgb: 'FFFFFF' }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } },
      { v: 'Quantity', s: { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } }, color: { rgb: 'FFFFFF' }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } },
      { v: 'Price', s: { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } }, color: { rgb: 'FFFFFF' }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } },
      { v: 'Total Price', s: { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } }, color: { rgb: 'FFFFFF' }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } },
      { v: 'Notes', s: { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } }, color: { rgb: 'FFFFFF' }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } }
    ]);

    // Add items with alternating row colors
    if (transaction.inventoryDetails && transaction.inventoryDetails.length > 0) {
      transaction.inventoryDetails.forEach((item, i) => {
        excelData.push([
          { v: item.id, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } },
          { v: item.shopItemID, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'E9E9E9' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } },
          { v: item.shopItemName || item.name || 'N/A', s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'E9E9E9' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } },
          { v: item.quantity, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'E9E9E9' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } },
          { v: item.price, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'E9E9E9' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } },
          { v: item.totalPrice, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'E9E9E9' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } },
          { v: item.notes || 'N/A', s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'E9E9E9' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } }
        ]);
      });
    } else {
      excelData.push([{ v: 'No items found for this invoice', s: { font: { italic: true }, alignment: { horizontal: 'center' } }, colSpan: 7 }]);
    }

    excelData.push([]); // empty row
    excelData.push([]); // empty row for spacing between invoices
  });

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  // Merge cells for headers and special cells
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push(
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Report title
    ...this.transactions.map((_, i) => {
      const offset = 7 + i * (15 + (this.transactions[i].inventoryDetails?.length || 1));
      return { s: { r: offset, c: 0 }, e: { r: offset, c: 6 } }; // Invoice headers
    })
  );

  // Apply column widths
  worksheet['!cols'] = [
    { wch: 8 },  // ID
    { wch: 10 }, // Item ID
    { wch: 30 }, // Name
    { wch: 10 }, // Quantity
    { wch: 12 }, // Price
    { wch: 12 }, // Total Price
    { wch: 30 }  // Notes
  ];

  // Create workbook and save
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${this.reportType}_Transactions_${dateStr}.xlsx`);
}
}
