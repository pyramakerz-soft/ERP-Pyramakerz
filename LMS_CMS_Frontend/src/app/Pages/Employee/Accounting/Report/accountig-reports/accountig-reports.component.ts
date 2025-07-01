import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { ReportsService } from '../../../../../Services/Employee/Accounting/reports.service';
import { ReportsService as SharedReportsService } from '../../../../../Services/shared/reports.service';
import { Payable } from '../../../../../Models/Accounting/payable';
import { DeleteEditPermissionService } from '../../../../../Services/shared/delete-edit-permission.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../../Services/account.service';
import { ApiService } from '../../../../../Services/api.service';
import Swal from 'sweetalert2';
import { catchError, map, Observable, of } from 'rxjs';
import { BankService } from '../../../../../Services/Employee/Accounting/bank.service';
import { SaveService } from '../../../../../Services/Employee/Accounting/save.service';

@Component({
  selector: 'app-accountig-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent],
  templateUrl: './accountig-reports.component.html',
  styleUrl: './accountig-reports.component.css'
})
export class AccountigReportsComponent {
  type: string = '';

  DomainName: string = '';  
  SelectedStartDate: string = '';
  SelectedEndDate: string = '';
  CurrentPage:number = 1
  PageSize:number = 1
  TotalPages:number = 1
  TotalRecords:number = 0
  
  showPDF: boolean = false 
  showTable: boolean = false 
  showViewReportBtn: boolean = false 
  DataToPrint: any = null
  
  tableData: any[]=[]; 
  direction: string = "";
  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  collapsedItems: Set<number> = new Set();

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService, 
    public EditDeleteServ: DeleteEditPermissionService,  
    public reportsService: ReportsService, 
    public sharedReportsService: SharedReportsService, 
    private router: Router,
    public bankService: BankService, public saveService: SaveService
  ) { }

  ngOnInit() { 
    const currentUrl = this.router.url;
    if (currentUrl.includes('Receivable')) {
      this.type = 'Receivable';
    } else if (currentUrl.includes('Payable')) {
      this.type = 'Payable';
    } else if (currentUrl.includes('Installment')) {
      this.type = 'Installment Deduction';
    } else if (currentUrl.includes('Accounting')) {
      this.type = 'Accounting Entries';
    }

    this.DomainName = this.ApiServ.GetHeader(); 
    this.direction = document.dir || 'ltr';  
  }
  
  async ViewReport() {
    if (this.SelectedStartDate > this.SelectedEndDate) {
      Swal.fire({
        title: 'Invalid Date Range',
        text: 'Start date cannot be later than end date.',
        icon: 'warning',
        confirmButtonText: 'OK',
      }); 
    } else{
      await this.GetData(this.CurrentPage, this.PageSize) 
      this.showTable = true
    }
  }

  DateChange(){
    this.showTable = false

    if(this.SelectedEndDate != '' && this.SelectedStartDate != ''){
      this.showViewReportBtn = true
    } else{
      this.showViewReportBtn = false
    }
  }

  GetData(pageNumber: number, pageSize: number) {
    this.tableData = [];
    this.CurrentPage = 1;
    this.TotalPages = 1;
    this.TotalRecords = 0;

    let dataObservable;

    switch (this.type) {
      case 'Payable':
        dataObservable = this.reportsService.GetPayablesByDate(
          this.SelectedStartDate, this.SelectedEndDate, this.DomainName, pageNumber, pageSize
        );
        break;

      case 'Receivable':
        dataObservable = this.reportsService.GetReceivablesByDate(
          this.SelectedStartDate, this.SelectedEndDate, this.DomainName, pageNumber, pageSize
        );
        break;

      case 'Installment Deduction':
        dataObservable = this.reportsService.GetInstallmentDeductionsByDate(
          this.SelectedStartDate, this.SelectedEndDate, this.DomainName, pageNumber, pageSize
        );
        break;

      case 'Accounting Entries':
        dataObservable = this.reportsService.GetAccountingEntriesByDate(
          this.SelectedStartDate, this.SelectedEndDate, this.DomainName, pageNumber, pageSize
        );
        break;

      default:
        console.error('Unknown report type:', this.type);
        return;
    }

    dataObservable.subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage;
        this.PageSize = data.pagination.pageSize;
        this.TotalPages = data.pagination.totalPages;
        this.TotalRecords = data.pagination.totalRecords;
        this.tableData = data.data; 
        console.log(this.tableData)
      },
      (error) => {
        if (error.status == 404 && this.TotalRecords != 0) {
          let lastPage = Math.ceil(this.TotalRecords / this.PageSize);
          if (lastPage >= 1) {
            this.CurrentPage = lastPage;
            this.GetData(this.CurrentPage, this.PageSize);
          }
        }
      }
    );
  }
 
  toggleCollapse(index: number) {
    if (this.collapsedItems.has(index)) {
      this.collapsedItems.delete(index);
    } else {
      this.collapsedItems.add(index);
    }
  }

  getDetails(data: any): any[] {
    if (this.type === 'Payable') {
      return data.payableDetails || [];
    } else if (this.type === 'Receivable') {
      return data.receivableDetails || [];
    } else if (this.type === 'Installment Deduction') {
      return data.installmentDeductionDetails || [];
    } else if (this.type === 'Accounting Entries') {
      return data.accountingEntriesDetails || [];
    }
    return [];
  }

  changeCurrentPage(currentPage:number){
    this.CurrentPage = currentPage
    this.GetData(this.CurrentPage, this.PageSize)
  }

  validatePageSize(event: any) { 
    const value = event.target.value;
    if (isNaN(value) || value === '') {
        event.target.value = '';
    }
  }

  validateNumberForPagination(event: any): void {
    const value = event.target.value;
    this.PageSize = 0
  } 

  Print() {
    this.showPDF = true;
    setTimeout(() => {
      const printContents = document.getElementById("Data")?.innerHTML;
      if (!printContents) {
        console.error("Element not found!");
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

  DownloadAsPDF() {
    // this.GetDataForPrint().subscribe((result) => {
    //   this.DataToPrint = result;

    //   this.showPDF = true;

    //   setTimeout(() => {
    //     this.pdfComponentRef.downloadPDF();  
    //     setTimeout(() => this.showPDF = false, 2000);
    //   }, 500);
    // });
  }

  // DownloadAsExcel() {
  //   this.GetDataForPrint().subscribe((result) => {
  //     this.DataToPrint = result;

  //     const headers = ['ID', 'Amount', 'Discount', 'Net', 'Date', 'Fee Type', 'Fee Discount Type', 'Student Name', 'Academic Year'];

  //     const dataRows = this.DataToPrint.map((row: any) =>
  //       headers.map(header => row[header] ?? '')
  //     );

  //     this.sharedReportsService.generateExcelReport({
  //       infoRows: [
  //         { key: 'Start Date', value: this.SelectedStartDate },
  //         { key: 'End Date', value: this.SelectedEndDate }
  //       ],
  //       filename: "Fees Activation Report.xlsx",
  //       tables: [
  //         {
  //           title: "Fees Activation",
  //           headers,
  //           data: dataRows
  //         }
  //       ]
  //     });
  //   });
  // }
}
