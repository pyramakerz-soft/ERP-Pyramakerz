import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { PdfPrintComponent } from '../../../../../../Component/pdf-print/pdf-print.component';
import {
  StoreBalanceItem,
  StoreBalanceReport,
} from '../../../../../../Models/Inventory/store-balance';
import { InventoryDetailsService } from '../../../../../../Services/Employee/Inventory/inventory-details.service';
import { InventoryCategoryService } from '../../../../../../Services/Employee/Inventory/inventory-category.service';

@Component({
  selector: 'app-all-stores-balance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent],
  templateUrl: './all-store-balance.component.html',
  styleUrl: './all-store-balance.component.css',
})
export class AllStoresBalanceReportComponent implements OnInit {
  reportType: 'QuantityOnly' | 'PurchasePrice' | 'SalesPrice' | 'Cost' =
    'QuantityOnly';
  pageTitle: string = 'All Stores Quantity Report';
  dateTo: string = '';
  selectedCategoryId: number | null = null;
  selectedTypeId: number | null = null;
  hasBalance: boolean = true;
  overdrawnBalance: boolean = true;
  zeroBalances: boolean = true;

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
    private categoryService: InventoryCategoryService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.reportType = data['reportType'];
      this.setPageTitle();
      this.loadCategories();
    });
  }

  private setPageTitle() {
    switch (this.reportType) {
      case 'QuantityOnly':
        this.pageTitle = 'All Stores Quantity Report';
        break;
      case 'PurchasePrice':
        this.pageTitle = 'All Stores Purchase Price Report';
        break;
      case 'SalesPrice':
        this.pageTitle = 'All Stores Sales Price Report';
        break;
      case 'Cost':
        this.pageTitle = 'All Stores Cost Report';
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
      default:
        return 1;
    }
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
          this.prepareExportData();
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
          default:
            return baseData;
        }
      }
    );
  }

  getInfoRows(): any[] {
    return [
      { keyEn: 'Report Type: ' + this.pageTitle },
      { keyEn: 'To Date: ' + this.dateTo },
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
      default:
        return baseHeaders;
    }
  }
}
