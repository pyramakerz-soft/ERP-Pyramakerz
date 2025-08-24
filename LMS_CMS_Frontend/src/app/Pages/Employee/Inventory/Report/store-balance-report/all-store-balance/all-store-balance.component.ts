// all-store-balance.component.ts
import { Component, OnInit } from '@angular/core';
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
type ReportType = 'QuantityOnly' | 'PurchasePrice' | 'SalesPrice' | 'Cost';

@Component({
  selector: 'app-all-stores-balance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './all-store-balance.component.html',
  styleUrls: ['./all-store-balance.component.css'],
})
export class AllStoresBalanceReportComponent implements OnInit {
getColumnCount(): number {
    const storesCount = this.getStoreColumns().length;
    return 2 + // Fixed columns (Item Code, Item Name)
           (storesCount * (this.showPriceColumn() ? 3 : 1)) + // Store columns
           1; // Total column
}
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
        },
        error: (error) => {
          console.error('Error loading report:', error);
          this.reportData = null;
          this.showTable = true;
          this.isLoading = false;
          // Swal.fire({
          //   title: 'Error',
          //   text: 'Failed to load report data',
          //   icon: 'error',
          //   confirmButtonText: 'OK',
          // });
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
}