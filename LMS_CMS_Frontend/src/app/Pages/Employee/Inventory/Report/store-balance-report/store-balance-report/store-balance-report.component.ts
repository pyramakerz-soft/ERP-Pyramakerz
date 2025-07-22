import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { PdfPrintComponent } from '../../../../../../Component/pdf-print/pdf-print.component';
import { StoreBalanceItem, StoreBalanceReport } from '../../../../../../Models/Inventory/store-balance';
import { InventoryDetailsService } from '../../../../../../Services/Employee/Inventory/inventory-details.service';
import { StoresService } from '../../../../../../Services/Employee/Inventory/stores.service';
import { InventoryCategoryService } from '../../../../../../Services/Employee/Inventory/inventory-category.service';

@Component({
  selector: 'app-store-balance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent],
  templateUrl: './store-balance-report.component.html',
  styleUrls: ['./store-balance-report.component.css'],
})
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

  stores: any[] = [];
  categories: any[] = [];
  reportData: StoreBalanceReport | null = null;
  showTable: boolean = false;
  isLoading: boolean = false;

  @ViewChild(PdfPrintComponent) pdfPrintComponent!: PdfPrintComponent;
  showPDF = false;
  reportForExport: any[] = [];

  school = {
    reportHeaderOneEn: '',
    reportHeaderTwoEn: '',
    reportHeaderOneAr: '',
    reportHeaderTwoAr: '',
    reportImage: 'assets/images/logo.png',
  };

  constructor(
    private inventoryDetailsService: InventoryDetailsService,
    private storesService: StoresService,
    private categoryService: InventoryCategoryService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.reportType = data['reportType'];
      this.setPageTitle();
      this.loadStores();
      this.loadCategories();
    });
  }

  private setPageTitle() {
    switch (this.reportType) {
      case 'QuantityOnly':
        this.pageTitle = 'Quantity Only Report';
        break;
      case 'PurchasePrice':
        this.pageTitle = 'Purchase Price Report';
        break;
      case 'SalesPrice':
        this.pageTitle = 'Sales Price Report';
        break;
      case 'Cost':
        this.pageTitle = 'Cost Report';
        break;
      case 'ItemsUnderLimit':
        this.pageTitle = 'Items Under Limit Report';
        break;
    }
    this.school.reportHeaderOneEn = this.pageTitle;
    this.school.reportHeaderOneAr = this.pageTitle;
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
    this.isLoading = true;
    this.categoryService
      .Get(this.categoryService.ApiServ.GetHeader())
      .subscribe({
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
    if (!this.dateTo || !this.selectedStoreId) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please select both Store and Date',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

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
        this.inventoryDetailsService.ApiServ.GetHeader()
      )
      .subscribe({
        next: (response) => {
          this.reportData = response;
          this.prepareExportData();
          this.showTable = true;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading report:', error);
          this.reportData = null;
          this.showTable = true;
          this.isLoading = false;
          // Swal.fire({
          //   icon: 'error',
          //   title: 'Error',
          //   text: 'Failed to load report data',
          //   confirmButtonText: 'OK',
          // });
        },
      });
  }

  private prepareExportData(): void {
    if (!this.reportData) return;

    this.reportForExport = this.reportData.data.map(
      (item: StoreBalanceItem) => {
        const baseData = {
          'Item Code': item.itemCode,
          'Item Name': item.itemName,
          Quantity: item.quantity,
        };

        switch (this.reportType) {
          case 'PurchasePrice':
            return {
              ...baseData,
              'Purchase Price': item.purchasePrice,
              'Total Purchase': item.totalPurchase,
            };
          case 'SalesPrice':
            return {
              ...baseData,
              'Sales Price': item.salesPrice,
              'Total Sales': item.totalSales,
            };
          case 'Cost':
            return {
              ...baseData,
              'Average Cost': item.averageCost,
              'Total Cost': item.totalCost,
            };
          case 'ItemsUnderLimit':
            return {
              ...baseData,
              Limit: item.limit,
            };
          default:
            return baseData;
        }
      }
    );
  }

  // ... (keep the existing DownloadAsPDF, Print, exportExcel methods)

  getInfoRows(): any[] {
    const selectedStore = this.stores.find(
      (s) => s.id === this.selectedStoreId
    );
    return [
      { keyEn: 'Report Type: ' + this.pageTitle },
      { keyEn: 'To Date: ' + this.dateTo },
      { keyEn: 'Store: ' + (selectedStore?.name || 'N/A') },
      {
        keyEn:
          'Category: ' +
          (this.selectedCategoryId
            ? this.categories.find((c) => c.id === this.selectedCategoryId)
                ?.name
            : 'All'),
      },
      { keyEn: 'Has Balance: ' + (this.hasBalance ? 'Yes' : 'No') },
      { keyEn: 'Overdrawn Balance: ' + (this.overdrawnBalance ? 'Yes' : 'No') },
      { keyEn: 'Zero Balances: ' + (this.zeroBalances ? 'Yes' : 'No') },
    ];
  }

  getPdfTableHeaders(): string[] {
    const baseHeaders = ['Item Code', 'Item Name', 'Quantity'];

    switch (this.reportType) {
      case 'PurchasePrice':
        return [...baseHeaders, 'Purchase Price', 'Total Purchase'];
      case 'SalesPrice':
        return [...baseHeaders, 'Sales Price', 'Total Sales'];
      case 'Cost':
        return [...baseHeaders, 'Average Cost', 'Total Cost'];
      case 'ItemsUnderLimit':
        return [...baseHeaders, 'Limit'];
      default:
        return baseHeaders;
    }
  }

  showExtraColumns(): boolean {
    return this.reportType !== 'QuantityOnly';
  }
}
