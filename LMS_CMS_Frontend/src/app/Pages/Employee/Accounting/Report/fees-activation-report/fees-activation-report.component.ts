import { Component, Inject, ViewChild } from '@angular/core';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { School } from '../../../../../Models/school';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../../Services/account.service';
import { ApiService } from '../../../../../Services/api.service'; 
import { DeleteEditPermissionService } from '../../../../../Services/shared/delete-edit-permission.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../../../../Services/Employee/Accounting/reports.service';
import { ReportsService as SharedReportsService } from '../../../../../Services/shared/reports.service';
import { FeesActivation } from '../../../../../Models/Accounting/fees-activation';
import Swal from 'sweetalert2'; 
import { catchError, map, Observable, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-fees-activation-report',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './fees-activation-report.component.html',
  styleUrl: './fees-activation-report.component.css'
})
export class FeesActivationReportComponent {
  DomainName: string = '';  
  SelectedStartDate: string = '';
  SelectedEndDate: string = '';
  CurrentPage:number = 1
  PageSize:number = 10
  TotalPages:number = 1
  TotalRecords:number = 0
   isRtl: boolean = false;
  subscription!: Subscription;
  showPDF: boolean = false 
  showTable: boolean = false 
  showViewReportBtn: boolean = false 
  DataToPrint: any = null
  
  tableData: FeesActivation[]=[]; 
  direction: string = "";
  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,  
    public reportsService: ReportsService, 
    public sharedReportsService: SharedReportsService ,
      private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService
  ) { }

  ngOnInit() { 
    this.DomainName = this.ApiServ.GetHeader(); 
    this.direction = document.dir || 'ltr';  

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

      const headers = ['ID', 'Amount', 'Discount', 'Net', 'Date', 'Fee Type', 'Fee Discount Type', 'Student Name', 'Academic Year'];

      const dataRows = this.DataToPrint.map((row: any) =>
        headers.map(header => row[header] ?? '')
      );

      this.sharedReportsService.generateExcelReport({
        infoRows: [
          { key: 'Start Date', value: this.SelectedStartDate },
          { key: 'End Date', value: this.SelectedEndDate }
        ],
        filename: "Fees Activation Report.xlsx",
        tables: [
          {
            title: "Fees Activation",
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
    this.reportsService.GetFeesActivationByDate(this.SelectedStartDate, this.SelectedEndDate, this.DomainName, pageNumber, pageSize).subscribe(
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
    .GetFeesActivationByDate(this.SelectedStartDate, this.SelectedEndDate, this.DomainName, 1, this.TotalRecords)
    .pipe(
      map(data => {
        return data.data.map((fee: FeesActivation) => ({
          ID: fee.feeActivationID,
          Amount: fee.amount,
          Discount: fee.discount,
          Net: fee.net,
          Date: fee.date,
          "Fee Type": fee.feeTypeName,
          "Fee Discount Type": fee.feeDiscountTypeName,
          "Student Name": fee.studentName,
          "Academic Year": fee.academicYearName
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
