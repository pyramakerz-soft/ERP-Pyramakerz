import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '../../../../../../Models/Inventory/store';
import { InventoryMaster } from '../../../../../../Models/Inventory/InventoryMaster';
import { InventoryMasterService } from '../../../../../../Services/Employee/Inventory/inventory-master.service';
import { StoresService } from '../../../../../../Services/Employee/Inventory/stores.service';
import * as XLSX from 'xlsx';
import { PdfPrintComponent } from '../../../../../../Component/pdf-print/pdf-print.component';
import { InventoryCategoryService } from '../../../../../../Services/Employee/Inventory/inventory-category.service';
import { InventorySubCategoriesService } from '../../../../../../Services/Employee/Inventory/inventory-sub-categories.service';
import { ShopItemService } from '../../../../../../Services/Employee/Inventory/shop-item.service';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { ReportsService } from '../../../../../../Services/shared/reports.service';
import { RealTimeNotificationServiceService } from '../../../../../../Services/shared/real-time-notification-service.service';
interface FlagOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-inventory-transaction-report',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent , TranslateModule],
  templateUrl: './invoice-report-master.component.html',
  styleUrl: './invoice-report-master.component.css',
})

export class InventoryTransactionReportComponent implements OnInit {

  dateFrom: string = '';
  dateTo: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;  
  selectedStoreId: number | null = null;
  stores: Store[] = [];
  transactions: InventoryMaster[] = [];
  showTable: boolean = false;
  showViewReportBtn: boolean = false;
  isLoading: boolean = false;
  reportType: string = '';
  selectedFlagId: number = -1;
  selectedFlagIds: number[] = [];


  

  @ViewChild(PdfPrintComponent) pdfPrintComponent!: PdfPrintComponent;

  showPDF = false;
  transactionsForExport: any[] = [];


school = {
  reportHeaderOneEn: '',
  reportHeaderOneAr: '',
};


  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  getStoreName(): string {
    return (
      this.stores.find((s) => s.id === this.selectedStoreId)?.name ||
      'All Stores'
    );
  }

  getInfoRows(): any[] {
    return [
      { keyEn: 'From Date: ' + this.dateFrom },
      { keyEn: 'To Date: ' + this.dateTo },
      { keyEn: 'Store: ' + this.getStoreName() },
    ];
  }

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

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalRecords: number = 0;
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
    private shopItemService: ShopItemService,
    private languageService: LanguageService,
    private reportsService: ReportsService,
    private realTimeService: RealTimeNotificationServiceService
  ) {}

ngOnInit() {
  this.route.data.subscribe((data) => {
    this.reportType = data['reportType'];
    this.currentFlags = this.availableFlags[this.reportType];
    this.selectedFlagIds = this.getAllFlagsForReportType();
    
    this.setSchoolHeader();
  });
    this.loadStores();
    this.loadCategories();
    this.selectedStoreId = null;
    this.selectedCategoryId = null;
    this.selectedSubCategoryId = null;
    this.selectedItemId = null;

      this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  private setSchoolHeader(): void {
  switch (this.reportType) {
    case 'inventory':
      this.school.reportHeaderOneEn = 'Inventory Transactions Report';
      this.school.reportHeaderOneAr = 'تقرير معاملات المخزون';
      break;
    case 'sales':
      this.school.reportHeaderOneEn = 'Sales Transactions Report';
      this.school.reportHeaderOneAr = 'تقرير معاملات المبيعات';
      break;
    case 'purchase':
      this.school.reportHeaderOneEn = 'Purchase Transactions Report';
      this.school.reportHeaderOneAr = 'تقرير معاملات المشتريات';
      break;
    default:
      this.school.reportHeaderOneEn = 'Transactions Report';
      this.school.reportHeaderOneAr = 'تقرير المعاملات';
  }
}

 ngOnDestroy(): void {
      this.realTimeService.stopConnection(); 
       if (this.subscription) {
        this.subscription.unsubscribe();
      }
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

  if (this.selectedCategoryId) {
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
          this.subCategories = [];
        },
      });
  } else {
    this.subCategories = [];
  }
}

  onSubCategorySelected() {
    this.selectedItemId = null;
    this.items = [];

    if (this.selectedSubCategoryId) {
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
    } else {
      this.items = [];
    }
  }

  onFlagSelected() {
    this.selectedFlagIds = [];
    if (this.selectedFlagId == -1) {
      this.selectedFlagIds = this.getAllFlagsForReportType();
    } else {
      this.selectedFlagIds = [this.selectedFlagId];
    }
    this.onFilterChange();
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

  onFilterChange() {
    this.showTable = false;
    this.showViewReportBtn = this.dateFrom !== '' && this.dateTo !== '';
    this.transactions = [];
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

  viewReport() {
    if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
      Swal.fire({
        title: 'Invalid Date Range',
        text: 'Start date cannot be later than end date.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.isLoading = true;
    this.showTable = false;

    this.inventoryMasterService
      .searchInvoice(
        this.inventoryMasterService.ApiServ.GetHeader(),
        this.selectedStoreId, // Can be null for "Select All"
        this.dateFrom,
        this.dateTo,
        this.selectedFlagIds, // Already contains all flags by default
        this.selectedCategoryId,
        this.selectedSubCategoryId,
        this.selectedItemId,
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (response: any) => {
          if (response?.data) {
            this.transactions = response.data;
            this.totalRecords =
              response.pagination?.totalRecords || response.data.length;
            this.totalPages =
              response.pagination?.totalPages ||
              Math.ceil(response.data.length / this.pageSize);
          } else {
            this.transactions = [];
            this.totalRecords = 0;
            this.totalPages = 1;
          }

          this.prepareExportData();
          this.showTable = true;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          this.transactions = [];
          this.totalRecords = 0;
          this.totalPages = 1;
          this.showTable = true;
          this.isLoading = false;
        },
      });
  }

  
getTableDataWithHeader(): any[] {
  return this.transactions.map((transaction) => {
    const baseData = {
      header: `Invoice #${transaction.invoiceNumber} - ${
        transaction.storeName
      } - ${new Date(transaction.date).toLocaleDateString()}`,
      data: [
        { key: 'Transaction Type', value: transaction.flagEnName },
        { key: 'Total Amount', value: transaction.total },
        {
          key: 'Payment Type',
          value: transaction.isCash
            ? 'Cash'
            : transaction.isVisa
            ? 'Visa'
            : 'Other',
        },
        { key: 'Notes', value: transaction.notes || '-' },
      ],
      details: {
        headers: ['Item ID', 'Quantity', 'Price', 'Total Price', 'Notes'],
        data: transaction.inventoryDetails.map((detail) => ({
          'Item ID': detail.id,
          Quantity: detail.quantity,
          Price: detail.price,
          'Total Price': detail.totalPrice,
          Notes: detail.notes || '-',
        })),
      },
    };
    
    // Add student/supplier based on report type
    if (this.reportType === 'sales' && transaction.studentName) {
      baseData.data.splice(1, 0, { key: 'Student', value: transaction.studentName });
    } else if (this.reportType === 'purchase' && transaction.supplierName) {
      baseData.data.splice(1, 0, { key: 'Supplier', value: transaction.supplierName });
    }
    
    return baseData;
  });
}


private prepareExportData(): void {
  this.transactionsForExport = this.transactions.map((t) => {
    const baseData = {
      'Invoice #': t.invoiceNumber,
      Date: new Date(t.date).toLocaleDateString(),
      Store: t.storeName,
      'Total Amount': t.total,
      'Transaction Type': t.flagEnName,
      Notes: t.notes || '-',
    };
    
    // Add student/supplier based on report type
    if (this.reportType === 'sales') {
      return {...baseData, 'Student': t.studentName || '-'};
    } else if (this.reportType === 'purchase') {
      return {...baseData, 'Supplier': t.supplierName || '-'};
    }
    
    return baseData;
  });
}

  // private formatDateForAPI(dateString: string): string {
  //   if (!dateString) return '';

  //   const date = new Date(dateString);
  //   if (isNaN(date.getTime())) {
  //     console.error('Invalid date:', dateString);
  //     return '';
  //   }

  //   const day = date.getDate().toString().padStart(2, '0');
  //   const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // }

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
    console.log('Downloading PDF with transactions:', this.transactionsForExport);
    // if (this.transactionsForExport.length === 0) {
    //   Swal.fire('Warning', 'No data to export!', 'warning');
    //   return;
    // }

    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF(); // Call manual download
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }

  Print() {
    if (this.transactionsForExport.length === 0) {
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
      // Create a print-specific stylesheet
      const printStyle = `
        <style>
          @page { size: auto; margin: 0mm; }
          body { 
            margin: 0; 
          }
          @media print {
            body > *:not(#print-container) {
              display: none !important;
            }
            #print-container {
              display: block !important;
              position: static !important;
              top: auto !important;
              left: auto !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              box-shadow: none !important;
              margin: 0 !important;
            }
          }
        </style>
      `;
      // Create a container for printing
      const printContainer = document.createElement('div');
      printContainer.id = 'print-container';
      printContainer.innerHTML = printStyle + printContents;
      // Add to body and print
      document.body.appendChild(printContainer);
      window.print();
      // Clean up
      setTimeout(() => {
        document.body.removeChild(printContainer);
        this.showPDF = false;
      }, 100);
    }, 500);
  }

  getSelectedFlagNames(): string {
    if (this.selectedFlagIds.includes(20)) {
      return 'All Types';
    }
    return this.currentFlags
      .filter((flag) => this.selectedFlagIds.includes(flag.id))
      .map((flag) => flag.name)
      .join(', ');
  }

async exportExcel() {
  const tableData = this.transactions.map((t) => {
    const baseData = {
      'Invoice #': t.invoiceNumber,
      Date: new Date(t.date).toLocaleDateString(),
      Store: t.storeName,
      'Transaction Type': t.flagEnName,
      'Total Amount': t.total,
      'Payment Type': t.isCash ? 'Cash' : t.isVisa ? 'Visa' : 'Other',
      Notes: t.notes || '-',
    };
    
    // Add student/supplier based on report type
    if (this.reportType === 'sales') {
      return {...baseData, 'Student': t.studentName || '-'};
    } else if (this.reportType === 'purchase') {
      return {...baseData, 'Supplier': t.supplierName || '-'};
    }
    
    return baseData;
  });

  await this.reportsService.generateExcelReport({
    mainHeader: {
      en: this.school.reportHeaderOneEn,
      ar: this.school.reportHeaderOneAr
    },
    subHeaders: [
      { en: 'Transaction Summary', ar: 'ملخص المعاملات' },
    ],
    infoRows: [
      { key: 'From Date', value: this.dateFrom },
      { key: 'To Date', value: this.dateTo },
      { key: 'Store', value: this.getStoreName() },
      { key: 'Transaction Types', value: this.getSelectedFlagNames() }
    ],
    reportImage: '', // You can add an image URL if needed
    filename: `${this.reportType}_Transactions_Report.xlsx`,
    tables: [{
      title: 'Transactions',
      headers: Object.keys(tableData[0] || {}),
      data: tableData.map(item => Object.values(item))
    }]
  });
}
}