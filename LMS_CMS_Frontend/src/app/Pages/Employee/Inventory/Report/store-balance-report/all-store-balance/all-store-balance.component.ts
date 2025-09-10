// all-store-balance.component.ts
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
import * as XLSX from 'xlsx-js-style';

type ReportType = 'QuantityOnly' | 'PurchasePrice' | 'SalesPrice' | 'Cost';

@Component({
  selector: 'app-all-stores-balance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './all-store-balance.component.html',
  styleUrls: ['./all-store-balance.component.css'],
})
export class AllStoresBalanceReportComponent implements OnInit {
  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  
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
  showPDF = false;
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
    private realTimeService: RealTimeNotificationServiceService
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
    this.realTimeService.stopConnection(); 
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  } 

  private setPageTitle() {
    const titles: Record<ReportType, string> = {
      'QuantityOnly': 'All Stores Quantity Report',
      'PurchasePrice': 'All Stores Purchase Price Report',
      'SalesPrice': 'All Stores Sales Price Report',
      'Cost': 'All Stores Cost Report'
    };
    this.pageTitle = titles[this.reportType];
    this.school.reportHeaderOneEn = this.pageTitle;
    this.school.reportHeaderOneAr = this.pageTitle;
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
          this.showTable = true;
          this.isLoading = false;
          this.prepareExportData();
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

  getStoreTotalQuantity(storeName: string): number {
    if (!this.reportData?.data) return 0;
    
    return this.reportData.data.reduce((total, item) => {
      const storeData = this.getStoreData(item, storeName);
      return total + (storeData.quantity ?? 0);
    }, 0);
  }

  getStoreTotalValue(storeName: string): number {
    if (!this.reportData?.data) return 0;
    
    return this.reportData.data.reduce((total, item) => {
      const storeData = this.getStoreData(item, storeName);
      return total + (storeData.value ?? 0);
    }, 0);
  }

  getStoreData(item: StoreBalanceItem, storeName: string): {
    quantity: number | null;
    price: number | null;
    value: number | null
  } {
    const store = item.stores?.find(s => s.storeName === storeName);
    if (!store) return { quantity: null, price: null, value: null };

    let price: number | null = null;
    
    switch(this.reportType) {
      case 'PurchasePrice':
        price = store.PurchasePrice ?? null;
        break;
      case 'SalesPrice':
        price = store.SalePrice ?? null;
        break;
      case 'Cost':
        price = store.AverageCost ?? null;
        break;
    }

    return {
      quantity: store.quantity ?? null,
      price: price,
      value: store.value ?? null
    };
  }

  getItemTotal(item: StoreBalanceItem): number {
    switch(this.reportType) {
      case 'PurchasePrice': return item.totalPurchaseValue || 0;
      case 'SalesPrice': return item.totalSalesValue || 0;
      case 'Cost': return item.totalCost || 0;
      default: return item.quantity || 0;
    }
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

  // Export functionality
  prepareExportData(): void {
    if (!this.reportData?.data) return;
    
    const storeColumns = this.getStoreColumns();
    const tableHeaders = ['Item Code', 'Item Name'];
    
    // Add store columns
    storeColumns.forEach(store => {
      tableHeaders.push(`${store} - Qty`);
      if (this.showPriceColumn()) {
        tableHeaders.push(`${store} - ${this.getPriceColumnLabel()}`);
        tableHeaders.push(`${store} - Value`);
      }
    });
    
    // Add total column
    tableHeaders.push('Total');
    
    // Prepare table data
    const tableData = this.reportData.data.map(item => {
      const rowData: any = {
        'Item Code': item.itemCode,
        'Item Name': item.itemName
      };
      
      // Add store data
      storeColumns.forEach(store => {
        const storeData = this.getStoreData(item, store);
        rowData[`${store} - Qty`] = storeData.quantity ?? 0;
        
        if (this.showPriceColumn()) {
          rowData[`${store} - ${this.getPriceColumnLabel()}`] = storeData.price ?? 0;
          rowData[`${store} - Value`] = storeData.value ?? 0;
        }
      });
      
      // Add total
      rowData['Total'] = this.getItemTotal(item);
      
      return rowData;
    });
    
    // Add grand total row
    const grandTotalRow: any = {
      'Item Code': '',
      'Item Name': 'Grand Total'
    };
    
    storeColumns.forEach(store => {
      grandTotalRow[`${store} - Qty`] = this.getStoreTotalQuantity(store);
      
      if (this.showPriceColumn()) {
        grandTotalRow[`${store} - ${this.getPriceColumnLabel()}`] = '';
        grandTotalRow[`${store} - Value`] = this.getStoreTotalValue(store);
      }
    });
    
    grandTotalRow['Total'] = this.reportType === 'QuantityOnly' 
      ? this.reportData.grandTotals?.TotalQuantity 
      : this.reportData.grandTotals?.TotalValue;
    
    tableData.push(grandTotalRow);
    
    this.cachedTableDataForPDF = [{
      header: 'Grand Total',
      data: [
        { key: 'Total Quantity', value: this.reportData.grandTotals?.TotalQuantity || 0, label: 'Total Quantity' },
      ],
      tableHeaders: tableHeaders,
      tableData: tableData
    }];
  }

  getTableDataWithHeader(): any[] {
    return this.cachedTableDataForPDF;
  }

  DownloadAsPDF() {
    if (!this.reportData?.data || this.reportData.data.length === 0) {
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
    if (!this.reportData?.data || this.reportData.data.length === 0) {
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
          @page { size: landscape; margin: 0mm; }
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
    if (!this.reportData?.data || this.reportData.data.length === 0) {
      alert('No data to export!');
      return;
    }

    const storeColumns = this.getStoreColumns();
    const excelData = [];

    // Add report title with styling
    excelData.push([{ 
      v: this.pageTitle.toUpperCase(), 
      s: { font: { bold: true, size: 16 }, alignment: { horizontal: 'center' } } 
    }]);
    excelData.push([]); // empty row

    // Add filter information with styling
    excelData.push([
      { v: 'Date To:', s: { font: { bold: true } } },
      { v: this.dateTo, s: { font: { bold: true } } }
    ]);
    excelData.push([
      { v: 'Category:', s: { font: { bold: true } } },
      { v: this.selectedCategoryId 
          ? this.categories.find(c => c.id === this.selectedCategoryId)?.name || 'All' 
          : 'All', 
        s: { font: { bold: true } } 
      }
    ]);
    excelData.push([
      { v: 'Has Balance:', s: { font: { bold: true } } },
      { v: this.hasBalance ? 'Yes' : 'No', s: { font: { bold: true } } }
    ]);
    excelData.push([
      { v: 'Overdrawn Balance:', s: { font: { bold: true } } },
      { v: this.overdrawnBalance ? 'Yes' : 'No', s: { font: { bold: true } } }
    ]);
    excelData.push([
      { v: 'Zero Balances:', s: { font: { bold: true } } },
      { v: this.zeroBalances ? 'Yes' : 'No', s: { font: { bold: true } } }
    ]);
    excelData.push([]); // empty row

    // Prepare table headers
    const headers = ['Item Code', 'Item Name'];
    
    // Add store columns
    storeColumns.forEach(store => {
      headers.push(`${store} - Qty`);
      if (this.showPriceColumn()) {
        headers.push(`${store} - ${this.getPriceColumnLabel()}`);
        headers.push(`${store} - Value`);
      }
    });
    
    // Add total column
    headers.push('Total');
    
    // Add headers to excel data with styling
    excelData.push(headers.map(header => ({ 
      v: header, 
      s: { 
        font: { bold: true }, 
        fill: { fgColor: { rgb: '4472C4' } }, 
        color: { rgb: 'FFFFFF' },
        border: { 
          top: { style: 'thin' }, 
          bottom: { style: 'thin' }, 
          left: { style: 'thin' }, 
          right: { style: 'thin' } 
        } 
      } 
    })));

    // Add data rows
    this.reportData.data.forEach((item, rowIndex) => {
      const rowData: any[] = [
        { v: item.itemCode, s: { 
          fill: { fgColor: { rgb: rowIndex % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } },
          border: { left: { style: 'thin' }, right: { style: 'thin' } } 
        }},
        { v: item.itemName, s: { 
          fill: { fgColor: { rgb: rowIndex % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } },
          border: { left: { style: 'thin' }, right: { style: 'thin' } } 
        }}
      ];
      
      // Add store data
      storeColumns.forEach(store => {
        const storeData = this.getStoreData(item, store);
        rowData.push({ v: storeData.quantity ?? 0, s: { 
          fill: { fgColor: { rgb: rowIndex % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } },
          border: { left: { style: 'thin' }, right: { style: 'thin' } } 
        }});
        
        if (this.showPriceColumn()) {
          rowData.push({ v: storeData.price ?? 0, s: { 
            fill: { fgColor: { rgb: rowIndex % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } },
            border: { left: { style: 'thin' }, right: { style: 'thin' } } 
          }});
          rowData.push({ v: storeData.value ?? 0, s: { 
            fill: { fgColor: { rgb: rowIndex % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } },
            border: { left: { style: 'thin' }, right: { style: 'thin' } } 
          }});
        }
      });
      
      // Add total
      rowData.push({ v: this.getItemTotal(item), s: { 
        fill: { fgColor: { rgb: rowIndex % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } },
        border: { left: { style: 'thin' }, right: { style: 'thin' } } 
      }});
      
      excelData.push(rowData);
    });

    // Add grand total row
    const grandTotalRow: any[] = [
      { v: '', s: { 
        font: { bold: true },
        fill: { fgColor: { rgb: 'E2EFDA' } },
        border: { left: { style: 'thin' }, right: { style: 'thin' } } 
      }},
      { v: 'Grand Total', s: { 
        font: { bold: true },
        fill: { fgColor: { rgb: 'E2EFDA' } },
        border: { left: { style: 'thin' }, right: { style: 'thin' } } 
      }}
    ];
    
    storeColumns.forEach(store => {
      grandTotalRow.push({ v: this.getStoreTotalQuantity(store), s: { 
        font: { bold: true },
        fill: { fgColor: { rgb: 'E2EFDA' } },
        border: { left: { style: 'thin' }, right: { style: 'thin' } } 
      }});
      
      if (this.showPriceColumn()) {
        grandTotalRow.push({ v: '', s: { 
          font: { bold: true },
          fill: { fgColor: { rgb: 'E2EFDA' } },
          border: { left: { style: 'thin' }, right: { style: 'thin' } } 
        }});
        grandTotalRow.push({ v: this.getStoreTotalValue(store), s: { 
          font: { bold: true },
          fill: { fgColor: { rgb: 'E2EFDA' } },
          border: { left: { style: 'thin' }, right: { style: 'thin' } } 
        }});
      }
    });
    
    grandTotalRow.push({ v: this.reportType === 'QuantityOnly' 
      ? this.reportData.grandTotals?.TotalQuantity 
      : this.reportData.grandTotals?.TotalValue, 
      s: { 
        font: { bold: true },
        fill: { fgColor: { rgb: 'E2EFDA' } },
        border: { left: { style: 'thin' }, right: { style: 'thin' } } 
      } 
    });
    
    excelData.push(grandTotalRow);

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Merge cells for title
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });

    // Apply column widths
    const colWidths = [
      { wch: 15 }, // Item Code
      { wch: 30 }, // Item Name
    ];
    
    // Add store columns widths
    storeColumns.forEach(() => {
      colWidths.push({ wch: 10 }); // Quantity
      if (this.showPriceColumn()) {
        colWidths.push({ wch: 12 }); // Price
        colWidths.push({ wch: 12 }); // Value
      }
    });
    
    colWidths.push({ wch: 12 }); // Total
    
    worksheet['!cols'] = colWidths;

    // Create workbook and save
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Store Balance');
    
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Store_Balance_Report_${dateStr}.xlsx`);
  }
}