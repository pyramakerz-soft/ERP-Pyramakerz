import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { PdfPrintComponent } from '../../../../../../Component/pdf-print/pdf-print.component';
import { StoreBalanceReport, StoreBalanceItem, StoreBalanceDetail } from '../../../../../../Models/Inventory/store-balance';
import { InventoryDetailsService } from '../../../../../../Services/Employee/Inventory/inventory-details.service';
import { InventoryCategoryService } from '../../../../../../Services/Employee/Inventory/inventory-category.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../../../Services/shared/real-time-notification-service.service';
import { firstValueFrom, Subscription } from 'rxjs';
import * as XLSX from 'xlsx';
import { ReportsService } from '../../../../../../Services/shared/reports.service';
import { InitLoader } from '../../../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../../../Services/loading.service';

type ReportType = 'QuantityOnly' | 'PurchasePrice' | 'SalesPrice' | 'Cost';

@Component({
  selector: 'app-all-stores-balance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './all-store-balance.component.html',
  styleUrls: ['./all-store-balance.component.css'],
})

@InitLoader()
export class AllStoresBalanceReportComponent implements OnInit {
  @ViewChild(PdfPrintComponent) pdfPrintComponent!: PdfPrintComponent;

  showPDF = false;
reportForExport: any[] = [];
baseHeaders: string[] = [];


  reportType: ReportType = 'QuantityOnly';
  pageTitle = 'All Stores Quantity Report';
  dateTo = '';
  selectedCategoryId: number | null = null;
  selectedTypeId: number | null = null;
  hasBalance = true;
  overdrawnBalance = true;
  zeroBalances = true;
  isRtl: boolean = false;
  subscription!: Subscription;
  categories: any[] = [];
  reportData: StoreBalanceReport | null = null;
  showTable = false;
  isLoading = false;
cachedTableDataForPDF: any[] = [];

  school = {
    reportHeaderOneEn: '',
    reportHeaderTwoEn: '',
    reportHeaderOneAr: '',
    reportHeaderTwoAr: '',
    reportImage: 'assets/images/logo.png',
  };

  constructor(
    private inventoryDetailsService: InventoryDetailsService,
    private categoryService: InventoryCategoryService,
    private route: ActivatedRoute,    
    private languageService: LanguageService, 
    private reportsService: ReportsService,
    private loadingService: LoadingService 
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.reportType = data['reportType'];
      this.setPageTitle();
      this.loadCategories();
    });
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

  hasDecimal(value: number | null): boolean {
  if (value === null || value === undefined) return false;
  return value % 1 !== 0;
}

private setPageTitle() {
  const titles: Record<ReportType, { en: string, ar: string }> = {
    'QuantityOnly': { 
      en: 'All Stores Quantity Report', 
      ar: 'تقرير كمية جميع المخازن' 
    },
    'PurchasePrice': { 
      en: 'All Stores Item Balance with Purchase', 
      ar: 'رصيد الأصناف بجميع المخازن بسعر الشراء' 
    },
    'SalesPrice': { 
      en: 'All Stores Item Balance with Sales', 
      ar: 'رصيد الأصناف بجميع المخازن بسعر البيع' 
    },
    'Cost': { 
      en: 'All Stores Item Balance with Average Cost', 
      ar: 'رصيد الأصناف بجميع المخازن بالتكلفة المتوسطة' 
    }
  };
  
  const title = titles[this.reportType];
  this.pageTitle = title.en;
  this.school.reportHeaderOneEn = title.en;
  this.school.reportHeaderOneAr = title.ar;
  
  // Set sub-header for detailed report
  this.school.reportHeaderTwoEn = 'Detailed Report';
  this.school.reportHeaderTwoAr = 'تقرير مفصل';
}

  private getReportFlagType(): number {
    const flags: Record<ReportType, number> = {
      'QuantityOnly': 1,
      'PurchasePrice': 2,
      'SalesPrice': 3,
      'Cost': 4
    };
    return flags[this.reportType];
  }

  loadCategories() {
    this.isLoading = true;
    this.categoryService.Get(this.categoryService.ApiServ.GetHeader()).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
      },
    });
  }

  onFilterChange() {
    this.showTable = false;
    this.reportData = null;
  }

viewReport() {
  if (!this.dateTo) {
    Swal.fire({
      title: 'Missing Information',
      text: 'Please select Date',
      icon: 'warning',
      confirmButtonText: 'OK',
    });
    return;
  }

  this.isLoading = true;
  this.showTable = false;

  this.inventoryDetailsService
    .getAllStoresBalance(
      this.dateTo,
      this.getReportFlagType(),
      this.selectedCategoryId || 0,
      this.selectedTypeId || 0,
      this.hasBalance,
      this.overdrawnBalance,
      this.zeroBalances,
      this.inventoryDetailsService.ApiServ.GetHeader()
    )
    .subscribe({
      next: (response) => {
        this.reportData = response;
        this.cachedTableDataForPDF = this.preparePdfTableSections(); // Cache the data
        this.showTable = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading report:', error);
        this.reportData = null;
        this.showTable = true;
        this.isLoading = false;
      },
    });
}


  getStoreColumns(): string[] {
    if (!this.reportData?.data?.length) return [];
    
    const stores = new Set<string>();
    this.reportData.data.forEach(item => {
      item.stores?.forEach(store => {
        if (store.storeName) stores.add(store.storeName);
      });
    });
    return Array.from(stores);
  }

getStoreTotalQuantity(storeName: string): { value: number, hasDecimal: boolean } {
  if (!this.reportData?.data) return { value: 0, hasDecimal: false };
  
  const total = this.reportData.data.reduce((total, item) => {
    const storeData = this.getStoreData(item, storeName);
    return total + (storeData.quantity ?? 0);
  }, 0);
  
  return { value: total, hasDecimal: this.hasDecimal(total) };
}

getStoreTotalValue(storeName: string): { value: number, hasDecimal: boolean } {
  if (!this.reportData?.data) return { value: 0, hasDecimal: false };
  
  const total = this.reportData.data.reduce((total, item) => {
    const storeData = this.getStoreData(item, storeName);
    return total + (storeData.value ?? 0);
  }, 0);
  
  return { value: total, hasDecimal: this.hasDecimal(total) };
}

getStoreData(item: StoreBalanceItem, storeName: string): {
  quantity: number | null;
  price: number | null;
  value: number | null;
  hasDecimalQuantity: boolean;
  hasDecimalPrice: boolean;
  hasDecimalValue: boolean;
} {
  const store = item.stores?.find(s => s.storeName === storeName);
  if (!store) return { 
    quantity: null, 
    price: null, 
    value: null,
    hasDecimalQuantity: false,
    hasDecimalPrice: false,
    hasDecimalValue: false
  };

  let price: number | null = null;
  
  switch(this.reportType) {
    case 'PurchasePrice':
      price = store.PurchasePrice ?? null;
      break;
    case 'SalesPrice':
      price = store.SalesPrice ?? null;
      break;
    case 'Cost':
      price = store.AverageCost ?? null;
      break;
  }

  return {
    quantity: store.quantity ?? null,
    price: price,
    value: store.value ?? null,
    hasDecimalQuantity: this.hasDecimal(store.quantity),
    hasDecimalPrice: this.hasDecimal(price), // <-- Already used here
    hasDecimalValue: this.hasDecimal(store.value)
  };
}

getItemTotal(item: StoreBalanceItem): { value: number, hasDecimal: boolean } {
  let totalValue: number;
  
  switch(this.reportType) {
    case 'PurchasePrice': 
      totalValue = item.totalPurchaseValue || 0;
      break;
    case 'SalesPrice': 
      totalValue = item.totalSalesValue || 0;
      break;
    case 'Cost': 
      totalValue = item.totalCost || 0;
      break;
    default: 
      totalValue = item.quantity || 0;
  }
  
  return { value: totalValue, hasDecimal: this.hasDecimal(totalValue) };
}

  showPriceColumn(): boolean {
    return this.reportType !== 'QuantityOnly';
  }

  getPriceColumnLabel(): string {
    switch(this.reportType) {
      case 'PurchasePrice': return 'Purchase Price';
      case 'SalesPrice': return 'Sales Price';
      case 'Cost': return 'Avg Cost';
      default: return '';
    }
  }
//  whateva


// private prepareExportData(): void {
//   if (!this.reportData?.data) {
//     this.reportForExport = [];
//     return;
//   }

//   this.reportForExport = [];
//   const storeColumns = this.getStoreColumns();

//   // First table: Item Code and Item Name only
//   this.reportForExport.push({ 'Table Type': 'ITEM DETAILS' });
//   this.reportForExport.push({ 'Item Code': 'Item Code', 'Item Name': 'Item Name' });
  
//   this.reportData.data.forEach(item => {
//     this.reportForExport.push({
//       'Item Code': item.itemCode,
//       'Item Name': item.itemName
//     });
//   });
  
//   // Add empty row as separator
//   this.reportForExport.push({});

//   // Second table: Store quantities and values
//   this.reportForExport.push({ 'Table Type': 'STORE BALANCES' });
  
//   // Create header row for store data
//   const storeHeaderRow: any = { 'Item Code': 'Item Code' };
//   storeColumns.forEach(store => {
//     storeHeaderRow[`${store} Qty`] = `${store} Qty`;
//     if (this.showPriceColumn()) {
//       const priceLabel = this.getPriceColumnLabel();
//       storeHeaderRow[`${store} ${priceLabel}`] = `${store} ${priceLabel}`;
//       storeHeaderRow[`${store} Value`] = `${store} Value`;
//     }
//   });
//   this.reportForExport.push(storeHeaderRow);

//   // Add store data rows
//   this.reportData.data.forEach(item => {
//     const storeDataRow: any = { 'Item Code': item.itemCode };
    
//     storeColumns.forEach(store => {
//       const storeData = this.getStoreData(item, store);
//       storeDataRow[`${store} Qty`] = storeData.quantity ?? 0;
      
//       if (this.showPriceColumn()) {
//         storeDataRow[`${store} ${this.getPriceColumnLabel()}`] = storeData.price ?? 0;
//         storeDataRow[`${store} Value`] = storeData.value ?? 0;
//       }
//     });
    
//     this.reportForExport.push(storeDataRow);
//   });

//   // Add empty row as separator
//   this.reportForExport.push({});

//   // Third table: Grand Totals only
//   this.reportForExport.push({ 'Table Type': 'GRAND TOTALS' });
  
//   if (this.reportData.grandTotals) {
//     const grandTotalRow: any = {};
//     storeColumns.forEach(store => {
//       grandTotalRow[`${store} Qty`] = this.getStoreTotalQuantity(store);
      
//       if (this.showPriceColumn()) {
//         grandTotalRow[`${store} ${this.getPriceColumnLabel()}`] = '';
//         grandTotalRow[`${store} Value`] = this.getStoreTotalValue(store);
//       }
//     });

//     // Add the overall total
//     grandTotalRow['Total'] = this.reportType === 'QuantityOnly' 
//       ? this.reportData.grandTotals.TotalQuantity 
//       : this.reportData.grandTotals.TotalValue;

//     this.reportForExport.push(grandTotalRow);
//   }
// }


preparePdfTableSections(): any[] {
  if (!this.reportData?.data) return [];
  
  const sections = [];
  const storeColumns = this.getStoreColumns();

  // First section: Item Details
  const itemDetailsSection = {
    header: 'ITEM DETAILS',
    data: [],
    tableHeaders: ['Item Code', 'Item Name'],
    tableData: this.reportData.data.map(item => ({
      'Item Code': item.itemCode,
      'Item Name': item.itemName
    }))
  };
  sections.push(itemDetailsSection);

  // Second section: Store Balances (one section per store)
  storeColumns.forEach(store => {
    const storeHeaders = ['Item Code', 'Qty'];
    if (this.showPriceColumn()) {
      storeHeaders.push(this.getPriceColumnLabel());
      storeHeaders.push('Value');
    }

    const storeSection = {
      header: `${store}`,
      data: [
        // Fix: Extract the value property from the returned object
        { key: 'Total Quantity', value: this.getStoreTotalQuantity(store).value },
        { key: 'Total Value', value: this.showPriceColumn() ? this.getStoreTotalValue(store).value : '-' }
      ],
      tableHeaders: storeHeaders,
      tableData: this.reportData!.data.map(item => {
        const storeData = this.getStoreData(item, store);
        const rowData: any = {
          'Item Code': item.itemCode,
          'Qty': storeData.quantity ?? 0
        };
        
        if (this.showPriceColumn()) {
          rowData[this.getPriceColumnLabel()] = storeData.price ?? 0;
          rowData['Value'] = storeData.value ?? 0;
        }
        
        return rowData;
      })
    };
    sections.push(storeSection);
  });

  // Third section: Grand Totals
  if (this.reportData.grandTotals) {
    const grandTotalSection = {
      header: 'GRAND TOTALS',
      data: [
        // Fix: Use primitive values directly
        { key: 'Total Quantity', value: this.reportData.grandTotals.TotalQuantity },
        { key: 'Total Value', value: this.reportData.grandTotals.TotalValue }
      ],
      tableHeaders: ['Description', 'Value'],
      tableData: [
        { 'Description': 'Total Quantity', 'Value': this.reportData.grandTotals.TotalQuantity },
        { 'Description': 'Total Value', 'Value': this.reportData.grandTotals.TotalValue }
      ]
    };
    sections.push(grandTotalSection);
  }

  return sections;
}

DownloadAsPDF() { 
  if (!this.cachedTableDataForPDF.length) {
    Swal.fire('Warning', 'No data to export!', 'warning');
    return;
  }
  
  this.showPDF = true;
  setTimeout(() => {
    this.pdfPrintComponent.downloadPDF();
    setTimeout(() => (this.showPDF = false), 2000);
  }, 500);
}

Print() {
  if (!this.reportData?.data?.length) {
    Swal.fire('Warning', 'No data to print!', 'warning');
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
        @page { size: landscape; margin: 5mm; }
        body { margin: 0; font-family: Arial, sans-serif; }
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
          .table-section { margin-bottom: 20px; page-break-inside: avoid; }
          .table-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 11px; }
          th { background-color: #f2f2f2; font-weight: bold; }
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

async exportExcel() {
  if (!this.reportData?.data?.length) {
    Swal.fire('Warning', 'No data to export!', 'warning');
    return;
  }

  const storeColumns = this.getStoreColumns();
  
  // Prepare tables for Excel export
  const tables = [];

  // First table: Item Details
  const itemDetailsTable = {
    title: 'ITEM DETAILS',
    headers: ['Item Code', 'Item Name'],
    data: this.reportData.data.map(item => [item.itemCode, item.itemName])
  };
  tables.push(itemDetailsTable);

  // Tables for each store
  storeColumns.forEach(store => {
    const storeHeaders = ['Item Code', 'Qty'];
    if (this.showPriceColumn()) {
      storeHeaders.push(this.getPriceColumnLabel());
      storeHeaders.push('Value');
    }

    const storeData = this.reportData!.data.map(item => {
      const storeData = this.getStoreData(item, store);
      const row = [
        item.itemCode || '-', 
        storeData.quantity ?? '-' 
      ];
      
      if (this.showPriceColumn()) {
        row.push(storeData.price ?? '-'); 
        row.push(storeData.value ?? '-'); 
      }
      
      return row;
    });

    tables.push({
      title: `${store}`,
      headers: storeHeaders,
      data: storeData
    });
  });

  // Grand Totals table
  if (this.reportData.grandTotals) {
    const grandTotalTable = {
      title: 'GRAND TOTALS',
      headers: ['Description', 'Value'],
      data: [
        ['Total Quantity', this.reportData.grandTotals.TotalQuantity || 0],
        ['Total Value', this.reportData.grandTotals.TotalValue || 0]
      ]
    };
    tables.push(grandTotalTable);
  }

  // Prepare info rows
  const infoRows = [
    { key: 'Report Type', value: this.pageTitle },
    { key: 'Date To', value: this.getDateInfo() },
    { key: 'Store', value: this.getStoreName() },
    { key: 'Category', value: this.getCategoryName() },
    { key: 'Filters', value: this.getBalanceFiltersInfo() }
  ];

  // Generate Excel using ReportsService
  await this.reportsService.generateExcelReport({
    mainHeader: { 
      en: this.pageTitle, 
      ar: this.pageTitle 
    },
    // subHeaders: [
    //   { en: 'Detailed Report', ar: 'تقرير مفصل' }
    // ],
    infoRows: infoRows,
    // reportImage: this.school.reportImage,
    tables: tables,
    filename: `${this.pageTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`
  });
}


getStoreName(): string {
  return 'All Stores';
}

getCategoryName(): string {
  if (!this.selectedCategoryId) return 'All Categories';
  const category = this.categories.find(c => c.id === this.selectedCategoryId);
  return category?.name || '-';
}

getDateInfo(): string {
  return this.dateTo ? new Date(this.dateTo).toLocaleDateString() : '-';
}

getBalanceFiltersInfo(): string {
  const filters = [];
  if (this.hasBalance) filters.push('Has Balance');
  if (this.overdrawnBalance) filters.push('Overdrawn');
  if (this.zeroBalances) filters.push('Zero Balances');
  return filters.length > 0 ? filters.join(', ') : 'No Filters';
}}