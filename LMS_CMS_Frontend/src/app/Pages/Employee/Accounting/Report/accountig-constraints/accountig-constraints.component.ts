import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../../Services/account.service';
import { ReportsService } from '../../../../../Services/Employee/Accounting/reports.service';
import { ReportsService as SharedReportsService } from '../../../../../Services/shared/reports.service';
import { ApiService } from '../../../../../Services/api.service';
import Swal from 'sweetalert2';
import { AccountingConstraintsReport } from '../../../../../Models/Accounting/accounting-constraints-report';
import { catchError, map, Observable, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-accountig-constraints',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './accountig-constraints.component.html',
  styleUrl: './accountig-constraints.component.css'
})
export class AccountigConstraintsComponent {
  DomainName: string = '';  
  SelectedStartDate: string = '';
   isRtl: boolean = false;
  subscription!: Subscription;
  SelectedEndDate: string = '';
  CurrentPage:number = 1
  PageSize:number = 10
  TotalPages:number = 1
  TotalRecords:number = 0
  
  showPDF: boolean = false 
  showTable: boolean = false 
  showViewReportBtn: boolean = false 
  DataToPrint: any = null
  
  tableData: AccountingConstraintsReport[]=[]; 
  direction: string = "";
  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,  
    public reportsService: ReportsService, 
    public sharedReportsService: SharedReportsService ,
        private languageService: LanguageService
  ) { }

  ngOnInit() { 
    this.DomainName = this.ApiServ.GetHeader(); 
    this.direction = document.dir || 'ltr'; 
    
    
     this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
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

  Print() {
    this.DataToPrint = []
    this.GetDataForPrint().subscribe((result) => {
      this.DataToPrint = result;
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
    }); 
  }

  DownloadAsPDF() {
    this.DataToPrint = []
    this.GetDataForPrint().subscribe((result) => {
      this.DataToPrint = result;

      this.showPDF = true;

      setTimeout(() => {
        this.pdfComponentRef.downloadPDF();  
        setTimeout(() => this.showPDF = false, 2000);
      }, 500);
    });
  }

  DownloadAsExcel() {
    this.GetDataForPrint().subscribe((result) => {
      this.DataToPrint = result;

      const headers = ['Master ID', 'Details ID', 'Account', 'Serial', 'Invoice Number', 'Main Account ID' , 'Main Account' , 'Sub Account ID' , 'Sub Account' , 'Credit' , 'Debit' , 'Date']; 

      const dataRows = this.DataToPrint.map((row: any) =>
        headers.map(header => row[header] ?? '')
      );

      this.sharedReportsService.generateExcelReport({
        infoRows: [
          { key: 'Start Date', value: this.SelectedStartDate },
          { key: 'End Date', value: this.SelectedEndDate }
        ],
        filename: "Accounting Constraints Report.xlsx",
        tables: [
          {
            title: "Accounting Constraints Report",
            headers,
            data: dataRows
          }
        ]
      });
    });
  }
    
  GetData(pageNumber:number, pageSize:number){
    this.tableData = []  
    this.CurrentPage = 1 
    this.TotalPages = 1
    this.TotalRecords = 0
    this.reportsService.GetAccountingEntriesReportByDate(this.SelectedStartDate, this.SelectedEndDate, this.DomainName, pageNumber, pageSize).subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage
        this.PageSize = data.pagination.pageSize
        this.TotalPages = data.pagination.totalPages
        this.TotalRecords = data.pagination.totalRecords 
        this.tableData = data.data 
      }, 
      (error) => { 
        if(error.status == 404){
          if(this.TotalRecords != 0){
            let lastPage = this.TotalRecords / this.PageSize 
            if(lastPage >= 1){ 
              this.CurrentPage = Math.ceil(lastPage) 
              this.GetData(this.CurrentPage, this.PageSize)
            }
          } 
        }
      }
    )
  }
  
  GetDataForPrint(): Observable<any[]> {
  return this.reportsService
    .GetAccountingEntriesReportByDate(this.SelectedStartDate, this.SelectedEndDate, this.DomainName, 1, this.TotalRecords)
    .pipe(
      map(data => {
        return data.data.map((acc: AccountingConstraintsReport) => ({
          'Master ID': acc.masterID,
          'Details ID': acc.detailsID,
          Account: acc.account,
          Serial: acc.serial,
          'Invoice Number': acc.invoiceNumber,
          'Main Account ID': acc.mainAccountNo,
          "Main Account": acc.mainAccount,
          "Sub Account ID": acc.subAccountNo,
          "Sub Account": acc.subAccount,
          "Credit": acc.credit,
          "Debit": acc.debit, 
          "Date": acc.date
        }));
      }), 
      catchError(error => {
        if (error.status === 404) {
          return of([]);
        }
        throw error;
      })
    );
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
}
