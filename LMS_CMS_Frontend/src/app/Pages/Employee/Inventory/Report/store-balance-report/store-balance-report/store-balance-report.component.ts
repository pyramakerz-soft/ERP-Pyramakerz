import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'; 
import Swal from 'sweetalert2';
import { PdfPrintComponent } from '../../../../../../Component/pdf-print/pdf-print.component';
import {
  StoreBalanceItem,
  StoreBalanceReport,
} from '../../../../../../Models/Inventory/store-balance';
import { InventoryDetailsService } from '../../../../../../Services/Employee/Inventory/inventory-details.service';
import { StoresService } from '../../../../../../Services/Employee/Inventory/stores.service';
import { InventoryCategoryService } from '../../../../../../Services/Employee/Inventory/inventory-category.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../../Services/shared/language.service'; 
import { firstValueFrom, Subscription } from 'rxjs';
import { ReportsService } from '../../../../../../Services/shared/reports.service';
import { InitLoader } from '../../../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../../../Services/loading.service';

@Component({
  selector: 'app-store-balance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './store-balance-report.component.html',
  styleUrls: ['./store-balance-report.component.css'],
})

@InitLoader()
export class StoreBalanceReportComponent implements OnInit {
  reportType:
    | 'QuantityOnly'
    | 'PurchasePrice'
    | 'SalesPrice'
    | 'Cost'
    | 'ItemsUnderLimit' = 'QuantityOnly';
  pageTitle: string = 'Quantity Only Report';
  dateTo: string = '';
  selectedStoreId: number | null = null;
  selectedCategoryId: number | null = null;
  selectedTypeId: number | null = null;
  hasBalance: boolean = true;
  overdrawnBalance: boolean = true;
  zeroBalances: boolean = true;
  isRtl: boolean = false;
  subscription!: Subscription;
  stores: any[] = [];
  categories: any[] = [];
  reportData: StoreBalanceReport | null = null;
  showTable: boolean = false;
  isLoading: boolean = false;
  pageNumber: number = 1;
  pageSize: number = 10;

currentPage: number = 1;
totalPages: number = 1;
totalRecords: number = 0;


  @ViewChild(PdfPrintComponent) pdfPrintComponent!: PdfPrintComponent;
  showPDF = false;
  reportForExport: any[] = [];

  school = {
    reportHeaderOneEn: '',
    reportHeaderTwoEn: '',
    reportHeaderOneAr: '',
    reportHeaderTwoAr: '',
  };

  baseHeaders = ['Item Code', 'Item Name', 'Quantity'];

  constructor(
    private inventoryDetailsService: InventoryDetailsService,
    private storesService: StoresService,
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
      this.loadStores();
      this.loadCategories();
      this.getPdfTableHeaders();
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

  private setPageTitle() {
    switch (this.reportType) {
      case 'QuantityOnly':
        this.pageTitle = 'Store Items Balance';
        this.school.reportHeaderOneEn = 'Store Items Balance';
        this.school.reportHeaderTwoEn = '';
        this.school.reportHeaderOneAr = 'تقرير أرصدة مخزون المستودع';
        this.school.reportHeaderTwoAr = ''; 
        break;
      case 'PurchasePrice':
        this.pageTitle = 'Store Items Balance with Purchase';
        this.school.reportHeaderOneEn = 'Store Items Balance with Purchase';
        this.school.reportHeaderTwoEn = '';
        this.school.reportHeaderOneAr = 'تقرير أسعار الشراء';
        this.school.reportHeaderTwoAr = '';
        break;
      case 'SalesPrice':
        this.pageTitle = 'Store Items Balance with Sales';
        this.school.reportHeaderOneEn = 'Store Items Balance with Sales';
        this.school.reportHeaderTwoEn = '';
        this.school.reportHeaderOneAr = 'تقرير أسعار البيع';
        this.school.reportHeaderTwoAr = '';
        break;
      case 'Cost':
        this.pageTitle = 'Store Items Balance with Average Cost';
        this.school.reportHeaderOneEn = 'Store Items Balance with Average Cost';
        this.school.reportHeaderTwoEn = '';
        this.school.reportHeaderOneAr = 'تقرير التكاليف';
        this.school.reportHeaderTwoAr = '';
        break;
      case 'ItemsUnderLimit':
        this.pageTitle = 'Store Limited Items';
        this.school.reportHeaderOneEn = 'Store Limited Items';
        this.school.reportHeaderTwoEn = '';
        this.school.reportHeaderOneAr = 'تقرير الأصناف تحت الحد الأدنى';
        this.school.reportHeaderTwoAr = '';
        break;
    }  
  }

  private getReportFlagType(): number {
    switch (this.reportType) {
      case 'QuantityOnly':
        return 1;
      case 'PurchasePrice':
        return 2;
      case 'SalesPrice':
        return 3;
      case 'Cost':
        return 4;
      case 'ItemsUnderLimit':
        return 5;
      default:
        return 1;
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

  loadCategories() {
    if (!this.selectedStoreId) {
      this.categories = [];
      return;
    }

    this.isLoading = true;
    this.categoryService
      .GetByStoreId(
        this.categoryService.ApiServ.GetHeader(),
        this.selectedStoreId,
      )
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.categories = [];
          this.isLoading = false;
        },
      });
  }

  onStoreSelected() {
    this.selectedCategoryId = null;
    this.categories = [];
    
    if (this.selectedStoreId) {
      this.loadCategories();
    } else {
      this.categories = [];
    }
    
    this.onFilterChange();
  }

  onFilterChange() {
    this.showTable = false;
    this.reportData = null;
  }

 viewReport() {
    this.isLoading = true;
    this.showTable = false;

    this.inventoryDetailsService
    .getStoreBalance(
      this.selectedStoreId!,
      this.dateTo,
      this.getReportFlagType(),
      this.selectedCategoryId || 0,
      this.selectedTypeId || 0,
      this.hasBalance,
      this.overdrawnBalance,
      this.zeroBalances,
      this.inventoryDetailsService.ApiServ.GetHeader(),
      this.currentPage,
      this.pageSize
    )
    .subscribe({
      next: (response) => {
        this.reportData = response;
        
        if (response) {
          this.currentPage = response.pageNumber || this.currentPage;
          this.pageSize = response.pageSize || this.pageSize;
          this.totalPages = response.totalPages || 1;
          this.totalRecords = response.totalCount || 0;
        }
        
        this.prepareExportData();
        this.showTable = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.reportData = null;
        this.showTable = true;
        this.isLoading = false;
        this.totalPages = 1;
        this.totalRecords = 0;
      },
    });
  }
 formatNumber(value: any): string | number {
    if (value === null || value === undefined) return '';
    
    const numValue = Number(value);
    if (isNaN(numValue)) return value;
    
    if (Number.isInteger(numValue) || Math.abs(numValue - Math.round(numValue)) < 0.0001) {
      return Math.round(numValue);
    } else {
      return Math.round(numValue * 100) / 100;
    }
  }

  formatNumberForDisplay(value: any): string {
    if (value === null || value === undefined) return '';
    
    const numValue = Number(value);
    if (isNaN(numValue)) return String(value);
    
    // Check if the number is a whole number
    if (Number.isInteger(numValue) || Math.abs(numValue - Math.round(numValue)) < 0.0001) {
      return Math.round(numValue).toString();
    } else {
      return numValue.toFixed(2).replace(/\.?0+$/, '');
    }
  }

  formatNumberForDisplayWithLTR(value: number): string {
    if (value == null) return '';
    return value < 0 ? '\u200E' + this.formatNumberForDisplay(value) : this.formatNumberForDisplay(value);
  }

  private prepareExportData(): void {
    if (!this.reportData) return;

    this.reportForExport = this.reportData.data.map(
      (item: StoreBalanceItem) => {
        const baseData = {
          'Item Code': item.itemCode,
          'Item Name': item.itemName,
          'Quantity': this.formatNumber(item.quantity),
        };

        switch (this.reportType) {
          case 'PurchasePrice':
            return {
              ...baseData,
              'Purchase Price': this.formatNumber(item.purchasePrice),
              'Total Purchase': this.formatNumber(item.totalPurchase),
            };
          case 'SalesPrice':
            return {
              ...baseData,
              'Sales Price': this.formatNumber(item.salesPrice),
              'Total Sales': this.formatNumber(item.totalSales),
            };
          case 'Cost':
            return {
              ...baseData,
              'Average Cost': this.formatNumber(item.averageCost),
              'Total Cost': this.formatNumber(item.totalCost),
            };
          case 'ItemsUnderLimit':
            return {
              ...baseData,
              'Limit': this.formatNumber(item.limit),
            };
          default:
            return baseData;
        }
      }
    );
  }

  getStoreName(): string {
    if (!this.selectedStoreId) return '-';
    const store = this.stores.find(s => s.id === this.selectedStoreId);
    return store?.name || '-';
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
  }

  getPdfTableHeaders() {
    this.baseHeaders = ['Item Code', 'Item Name', 'Quantity'];

    switch (this.reportType) {
      case 'PurchasePrice':
        this.baseHeaders = [...this.baseHeaders, 'Purchase Price', 'Total Purchase'];
        break;
      case 'SalesPrice':
        this.baseHeaders = [...this.baseHeaders, 'Sales Price', 'Total Sales'];
        break;
      case 'Cost':
        this.baseHeaders = [...this.baseHeaders, 'Average Cost', 'Total Cost'];
        break;
      case 'ItemsUnderLimit':
        this.baseHeaders = [...this.baseHeaders, 'Limit'];
        break;
      default:
        this.baseHeaders;
        break;
    }
  }

  showExtraColumns(): boolean {
    return this.reportType !== 'QuantityOnly';
  }

  DownloadAsPDF() { 
    if (!this.reportForExport.length) {
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
    if (!this.reportForExport.length) {
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

  async exportExcel() {
    if (!this.reportForExport.length) {
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }

    await this.reportsService.generateExcelReport({
      mainHeader: {
        en: this.school.reportHeaderOneEn,
        ar: this.school.reportHeaderOneAr
      },
      infoRows: [
        { key: 'Report Type', value: this.pageTitle },
        { key: 'To Date', value: this.dateTo },
        { key: 'Store', value: this.getStoreName() },
        { key: 'Category', value: this.getCategoryName() },
        { key: 'Balance Filters', value: this.getBalanceFiltersInfo() }
      ],
      reportImage: '',
      filename: `${this.pageTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
      tables: [{
        headers: this.getExcelHeaders(),
        data: this.reportForExport.map(item => Object.values(item))
      }]
    });
  }

  // Helper method to get Excel headers based on report type
  private getExcelHeaders(): string[] {
    switch (this.reportType) {
      case 'PurchasePrice':
        return ['Item Code', 'Item Name', 'Quantity', 'Purchase Price', 'Total Purchase'];
      case 'SalesPrice':
        return ['Item Code', 'Item Name', 'Quantity', 'Sales Price', 'Total Sales'];
      case 'Cost':
        return ['Item Code', 'Item Name', 'Quantity', 'Average Cost', 'Total Cost'];
      case 'ItemsUnderLimit':
        return ['Item Code', 'Item Name', 'Quantity', 'Limit'];
      default: // QuantityOnly
        return ['Item Code', 'Item Name', 'Quantity'];
    }
  }

  // ==================== Pagination Functions ====================
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
      this.pageSize = 10; // default value
    } else {
      this.pageSize = numValue;
    }
    
    this.currentPage = 1; // Return to first page
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