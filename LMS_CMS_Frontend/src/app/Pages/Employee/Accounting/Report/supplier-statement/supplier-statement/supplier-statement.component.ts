// supplier-statement.component.ts
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx-js-style';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import { PdfPrintComponent } from '../../../../../../Component/pdf-print/pdf-print.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../../../Services/account.service';
import { ApiService } from '../../../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../../../Services/shared/delete-edit-permission.service';
import { SupplierStatementService } from '../../../../../../Services/Employee/Accounting/supplier-statement.service';
import { LanguageService } from '../../../../../../Services/shared/language.service';
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { SupplierService } from '../../../../../../Services/Employee/Accounting/supplier.service';
import { Supplier } from '../../../../../../Models/Accounting/supplier';

@Component({
  selector: 'app-supplier-statement',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './supplier-statement.component.html',
  styleUrl: './supplier-statement.component.css',
})
export class SupplierStatementComponent {
  type: string = 'Supplier Statement';
  SubAccountNumber: number | null = null;
  DomainName: string = '';
  SelectedStartDate: string = '';
  SelectedEndDate: string = '';
  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;
  firstPeriodBalance: number = 0;
  fullTotals: any = {};

  showPDF: boolean = false;
  showTable: boolean = false;
  showViewReportBtn: boolean = true;
  DataToPrint: any = null;
  isRtl: boolean = false;
  subscription!: Subscription;
  tableData: any[] = [];
  direction: string = '';

  school = {
    reportHeaderOneEn: 'Supplier Statement Report',
    reportHeaderTwoEn: 'Detailed Supplier Transactions',
    reportHeaderOneAr: 'كشف حساب المورد',
    reportHeaderTwoAr: 'تفاصيل معاملات المورد',
    reportImage: 'assets/images/logo.png',
  };

    suppliers: Supplier[] = []; 
  selectedSupplier: number | null = null; 

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    private supplierStatementService: SupplierStatementService,
    private languageService: LanguageService,
    private supplierService: SupplierService
  ) {}

  ngOnInit() {
    this.DomainName = this.ApiServ.GetHeader();
    this.direction = document.dir || 'ltr';

    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
    this.isRtl = document.documentElement.dir === 'rtl';

    // Load suppliers when component initializes
    this.loadSuppliers();
  }

  InputChange() {
    this.showTable = false;
    // this.showViewReportBtn = 
    //   this.SelectedStartDate && 
    //   this.SelectedEndDate && 
    //   this.SubAccountNumber !== null;
  }


ViewReport() {
  if (this.SelectedStartDate > this.SelectedEndDate) {
    Swal.fire({
      title: 'Invalid Date Range',
      text: 'Start date cannot be later than end date.',
      icon: 'warning',
      confirmButtonText: 'OK',
    });
  } else if (this.selectedSupplier === null) {
    Swal.fire({
      title: 'Missing Information',
      text: 'Please select a Supplier.',
      icon: 'warning',
      confirmButtonText: 'OK',
    });
  } else {
    // Use the supplier ID directly as the subAccountNumber
    this.SubAccountNumber = this.selectedSupplier;
    this.GetData(this.CurrentPage, this.PageSize);
    this.showTable = true;
  }
}

  GetData(pageNumber: number, pageSize: number) {
    this.tableData = [];
    this.CurrentPage = 1;
    this.TotalPages = 1;
    this.TotalRecords = 0;
    this.firstPeriodBalance = 0;
    this.fullTotals = {
      totalDebit: 0,
      totalCredit: 0,
      difference: 0
    };

  this.supplierStatementService
    .GetSupplierStatement(
      this.SelectedStartDate,
      this.SelectedEndDate,
      this.SubAccountNumber!,
      this.DomainName,
      pageNumber,
      pageSize
    )
    .subscribe(
        (data) => {
          this.CurrentPage = data.pagination.currentPage;
          this.PageSize = data.pagination.pageSize;
          this.TotalPages = data.pagination.totalPages;
          this.TotalRecords = data.pagination.totalRecords;
          this.tableData = data.data;
          this.firstPeriodBalance = data.firstPeriodBalance;
          this.fullTotals = data.fullTotals;
        },
        (error) => {
          if (error.status == 404) {
            this.tableData = [];
            this.firstPeriodBalance = 0;
            this.fullTotals = {
              totalDebit: 0,
              totalCredit: 0,
              difference: 0
            };
            this.TotalRecords = 0;
            this.TotalPages = 1;
            this.CurrentPage = 1;
            
            if (this.TotalRecords != 0) {
              let lastPage = Math.ceil(this.TotalRecords / this.PageSize);
              if (lastPage >= 1) {
                this.CurrentPage = lastPage;
                this.GetData(this.CurrentPage, this.PageSize);
              }
            }
          }
        }
      );
  }

    loadSuppliers() {
    this.supplierService.Get(this.DomainName).subscribe(
      (suppliers) => {
        this.suppliers = suppliers;
      },
      (error) => {
        console.error('Error loading suppliers:', error);
      }
    );
  }

  
Print() {
  if (this.tableData.length === 0) {
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

DownloadAsPDF() {
  if (this.tableData.length === 0) {
    Swal.fire('Warning', 'No data to export!', 'warning');
    return;
  }

  this.showPDF = true;
  setTimeout(() => {
    this.pdfComponentRef.downloadPDF();
    setTimeout(() => (this.showPDF = false), 2000);
  }, 500);
}

GetDataForPrint(): Observable<any[]> {
  return this.supplierStatementService
    .GetSupplierStatement(
      this.SelectedStartDate,
      this.SelectedEndDate,
      this.SubAccountNumber!,
      this.DomainName,
      1,
      this.TotalRecords
    )
    .pipe(
        map((data) => {
          if (data.data.length === 0) {
            return [];
          }
          
          const openingBalanceRow = {
            masterID: 0,
            detailsID: 0,
            account: 'Opening Balance',
            serial: 0,
            mainAccountNo: 0,
            mainAccount: '',
            subAccountNo: 0,
            subAccount: '',
            debit: 0,
            credit: 0,
            date: this.SelectedStartDate,
            balance: data.firstPeriodBalance,
            linkFileID: 0,
            notes: ''
          };

          const allData = [openingBalanceRow, ...data.data];

          return [{
            header: `Supplier Statement - Sub Account ${this.SubAccountNumber}`,
            summary: [
              { key: 'Sub Account Number', value: this.SubAccountNumber },
              { key: 'Start Date', value: this.SelectedStartDate },
              { key: 'End Date', value: this.SelectedEndDate },
              { key: 'Opening Balance', value: data.firstPeriodBalance },
              { key: 'Total Debit', value: data.fullTotals.totalDebit },
              { key: 'Total Credit', value: data.fullTotals.totalCredit },
              { key: 'Difference', value: data.fullTotals.difference },
            ],
            table: {
              headers: [
                'Serial',
                'Date',
                'Account',
                'Main Account',
                'Sub Account',
                'Debit',
                'Credit',
                'Balance',
                'Notes'
              ],
              data: allData.map((item: any) => ({
                Serial: item.serial,
                Date: item.date,
                Account: item.account,
                'Main Account': item.mainAccount || '-',
                'Sub Account': item.subAccount || '-',
                Debit: item.debit,
                Credit: item.credit,
                Balance: item.balance,
                Notes: item.notes || 'N/A'
              }))
            }
          }];
        }),
        catchError((error) => {
          if (error.status === 404) {
            return of([]);
          }
          throw error;
        })
      );
  }

//  DownloadAsPDF() {
//     this.DataToPrint = [];
//     this.GetDataForPrint().subscribe((result) => {
//       this.DataToPrint = result;
//       this.showPDF = true;
//       setTimeout(() => {
//         this.pdfComponentRef.downloadPDF();
//         setTimeout(() => (this.showPDF = false), 2000);
//       }, 500);
//     });
//   }

getInfoRows(): any[] {
  const selectedSupplier = this.suppliers.find(s => s.id === this.selectedSupplier);
  const supplierName = selectedSupplier ? selectedSupplier.name : 'N/A';
  const supplierId = this.selectedSupplier || 'N/A';

  return [
    {
      keyEn: 'Report Type: ' + this.type,
      keyAr: 'نوع التقرير: ' + this.type,
    },
    {
      keyEn: 'Supplier: ' + supplierName,
      keyAr: 'المورد: ' + supplierName,
    },
    {
      keyEn: 'Supplier ID: ' + supplierId,
      keyAr: 'معرف المورد: ' + supplierId,
    },
    {
      keyEn: 'Start Date: ' + this.SelectedStartDate,
      keyAr: 'تاريخ البدء: ' + this.SelectedStartDate,
    },
    {
      keyEn: 'End Date: ' + this.SelectedEndDate,
      keyAr: 'تاريخ الانتهاء: ' + this.SelectedEndDate,
    },
    {
      keyEn: 'Generated On: ' + new Date().toLocaleDateString(),
      keyAr: 'تم الإنشاء في: ' + new Date().toLocaleDateString(),
    },
  ];
}

getTableDataForExport(): any[] {
  return this.tableData.map((item: any) => ({
    'Serial': item.serial,
    'Date': item.date,
    'Account': item.account,
    'Main Account': item.mainAccount || '-',
    'Sub Account': item.subAccount || '-',
    'Debit': item.debit,
    'Credit': item.credit,
    'Balance': item.balance,
    'Notes': item.notes || 'N/A'
  }));
}

 getTableDataWithHeader(): any[] {
    return this.DataToPrint.map((item: any) => ({
      header: item.header,
      data: item.summary,
      tableHeaders: item.table.headers,
      tableData: item.table.data,
    }));
  }

  changeCurrentPage(currentPage: number) {
    this.CurrentPage = currentPage;
    this.GetData(this.CurrentPage, this.PageSize);
  }

  validatePageSize(event: any) {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
    }
  }

  validateNumberForPagination(event: any): void {
    const value = event.target.value;
    this.PageSize = 0;
  }

  get visiblePages(): number[] {
    const total = this.TotalPages;
    const current = this.CurrentPage;
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
}