import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../../Services/account.service';
import { ReportsService } from '../../../../../Services/Employee/Accounting/reports.service';
import { ReportsService as SharedReportsService } from '../../../../../Services/shared/reports.service';
import { ApiService } from '../../../../../Services/api.service';
import Swal from 'sweetalert2';
import { catchError, map, Observable, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { AccountingConstraintsResponse } from '../../../../../Models/Accounting/accounting-constraints-report';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';

@Component({
  selector: 'app-accountig-constraints',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './accountig-constraints.component.html',
  styleUrls: ['./accountig-constraints.component.css'],
})
export class AccountigConstraintsComponent implements OnDestroy {
  DomainName: string = '';
  SelectedStartDate: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  SelectedEndDate: string = '';
  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;

  showPDF: boolean = false;
  showTable: boolean = false;
  showViewReportBtn: boolean = false;
  DataToPrint: any = null;

  responseData: AccountingConstraintsResponse | null = null;
  collapsedDates: Set<string> = new Set();
  direction: string = '';

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    public reportsService: ReportsService,
    public sharedReportsService: SharedReportsService,
    private languageService: LanguageService, 
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
  }
 
  ngOnDestroy(): void { 
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
    } else {
      await this.GetData(this.CurrentPage, this.PageSize);
      this.showTable = true;
    }
  }

  DateChange() {
    this.showTable = false;
    this.showViewReportBtn =
      this.SelectedEndDate !== '' && this.SelectedStartDate !== '';
  }

  toggleDateCollapse(date: string) {
    if (this.collapsedDates.has(date)) {
      this.collapsedDates.delete(date);
    } else {
      this.collapsedDates.add(date);
    }
  }

  // In the GetData method, replace the collapsedDates handling:
  GetData(pageNumber: number, pageSize: number) {
    this.responseData = null;
    this.CurrentPage = 1;
    this.TotalPages = 1;
    this.TotalRecords = 0;

    this.reportsService
      .GetAccountingEntriesReportByDate(
        this.SelectedStartDate,
        this.SelectedEndDate,
        this.DomainName,
        pageNumber,
        pageSize
      )
      .subscribe({
        next: (data) => {
          this.responseData = data;
          this.CurrentPage = data.pagination.currentPage;
          this.PageSize = data.pagination.pageSize;
          this.TotalPages = data.pagination.totalPages;
          this.TotalRecords = data.pagination.totalRecords;

          // Clear collapsed dates and expand all by default
          this.collapsedDates.clear();
        },
        error: (error) => {
          if (error.status == 404 && this.TotalRecords != 0) {
            let lastPage = Math.ceil(this.TotalRecords / this.PageSize);
            if (lastPage >= 1) {
              this.CurrentPage = lastPage;
              this.GetData(this.CurrentPage, this.PageSize);
            }
          } else {
            // Swal.fire({
            //   title: 'Error',
            //   text: 'Failed to load data. Please try again.',
            //   icon: 'error',
            //   confirmButtonText: 'OK',
            // });
          }
        },
      });
  }

  Print() {
    this.DataToPrint = [];
    this.GetDataForPrint().subscribe((result) => {
      this.DataToPrint = result;
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
    });
  }

  DownloadAsPDF() {
    this.DataToPrint = [];
    this.GetDataForPrint().subscribe((result) => {
      this.DataToPrint = result;
      this.showPDF = true;
      setTimeout(() => {
        this.pdfComponentRef.downloadPDF();
        setTimeout(() => (this.showPDF = false), 2000);
      }, 500);
    });
  }

  DownloadAsExcel() {
    this.GetDataForPrint().subscribe((result) => {
      this.DataToPrint = result;
      const headers = [
        'Master ID',
        'Details ID',
        'Account',
        'Serial',
        'Invoice Number',
        'Main Account ID',
        'Main Account',
        'Sub Account ID',
        'Sub Account',
        'Credit',
        'Debit',
        'Date',
      ];

      const dataRows = this.DataToPrint.map((row: any) =>
        headers.map((header) => row[header] ?? '-')
      );

      this.sharedReportsService.generateExcelReport({
        infoRows: [
          { key: 'Start Date', value: this.SelectedStartDate },
          { key: 'End Date', value: this.SelectedEndDate },
        ],
        filename: 'Accounting Constraints Report.xlsx',
        tables: [
          {
            // title: 'Accounting Constraints Report',
            headers,
            data: dataRows,
          },
        ],
      });
    });
  }

  GetDataForPrint(): Observable<any[]> {
    return this.reportsService
      .GetAccountingEntriesReportByDate(
        this.SelectedStartDate,
        this.SelectedEndDate,
        this.DomainName,
        1,
        this.TotalRecords
      )
      .pipe(
        map((data) => {
          const sections: any[] = [];

          data.data.forEach((dateGroup) => {
            sections.push({
              header: `Accounting Constraints for ${dateGroup.date}`,
              summary: [
                { key: 'Total Debit', value: dateGroup.totals.debit },
                { key: 'Total Credit', value: dateGroup.totals.credit },
                {
                  key: 'Difference',
                  value: dateGroup.totals.difference,
                  isNegative: dateGroup.totals.difference < 0,
                },
              ],
              table: {
                headers: [
                  'Account',
                  'Invoice Number',
                  'Main Account',
                  'Sub Account',
                  'Credit',
                  'Debit',
                ],
                data: dateGroup.entries.map((entry: any) => ({
                  Account: entry.account || '-',
                  'Invoice Number': entry.invoiceNumber || '-',
                  'Main Account': entry.mainAccount || '-',
                  'Sub Account': entry.subAccount || '-',
                  Credit: entry.credit,
                  Debit: entry.debit,
                })),
              },
            });
          });

          // Add full totals section
          if (data.fullTotals) {
            sections.push({
              header: 'Full Accounting Constraints Summary',
              summary: [
                { key: 'Full Total Debit', value: data.fullTotals.debit },
                { key: 'Full Total Credit', value: data.fullTotals.credit },
                {
                  key: 'Full Difference',
                  value: data.fullTotals.difference,
                  isNegative: data.fullTotals.difference < 0,
                },
              ],
              table: {
                headers: [],
                data: [],
              },
            });
          }

          return sections;
        }),
        catchError((error) => {
          if (error.status === 404) {
            return of([]);
          }
          throw error;
        })
      );
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
