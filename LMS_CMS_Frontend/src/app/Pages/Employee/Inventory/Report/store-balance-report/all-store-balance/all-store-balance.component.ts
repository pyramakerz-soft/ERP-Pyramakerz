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
    const flag = this.getReportFlagType();

    // if (!this.dateTo) {
    //   Swal.fire({
    //     title: 'Missing Information',
    //     text: 'Please select Date',
    //     icon: 'warning',
    //     confirmButtonText: 'OK',
    //   });
    //   return;
    // }

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
    if (!this.reportData?.data) return;

    this.reportForExport = this.reportData.data.map((item: StoreBalanceItem) => {
        const baseData: any = {
            'Item Code': item.itemCode,
            'Item Name': item.itemName
        };

        // Add store quantities
        (item.stores || []).forEach(store => {
            baseData[store.storeName] = store.quantity;
        });

        return baseData;
    });
}

getPdfTableHeaders(): string[] {
    const baseHeaders = ['Item Code', 'Item Name'];
    
    if (this.reportData?.data?.[0]?.stores) {
        this.reportData.data[0].stores.forEach(store => {
            baseHeaders.push(store.storeName);
        });
    }
    
    return baseHeaders;
}

getInfoRows(): any[] {
    return [
        { keyEn: 'Report Type: ' + this.pageTitle },
        { keyEn: 'To Date: ' + this.dateTo },
        {
            keyEn: 'Category: ' + 
                (this.selectedCategoryId ? 
                    this.categories.find(c => c.id === this.selectedCategoryId)?.name : 
                    'All'
                )
        },
        { keyEn: 'Has Balance: ' + (this.hasBalance ? 'Yes' : 'No') },
        { keyEn: 'Overdrawn Balance: ' + (this.overdrawnBalance ? 'Yes' : 'No') },
        { keyEn: 'Zero Balances: ' + (this.zeroBalances ? 'Yes' : 'No') }
    ];
}

  // getPdfTableHeaders(): string[] {
  //   const baseHeaders = ['Item Code', 'Item Name', 'Quantity'];

  //   switch (this.reportType) {
  //     case 'PurchasePrice':
  //       return [...baseHeaders, 'Purchase Price', 'Total Purchase'];
  //     case 'SalesPrice':
  //       return [...baseHeaders, 'Sales Price', 'Total Sales'];
  //     case 'Cost':
  //       return [...baseHeaders, 'Average Cost', 'Total Cost'];
  //     default:
  //       return baseHeaders;
  //   }
  // }

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

  exportExcel() {
    if (!this.reportForExport.length) {
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(this.reportForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(
      workbook,
      `${this.pageTitle.replace(/\s+/g, '_')}_${dateStr}.xlsx`
    );
  }
}
