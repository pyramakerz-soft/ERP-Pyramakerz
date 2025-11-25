import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfPrintComponent } from '../../../../Component/pdf-print/pdf-print.component';
import { ElectronicInvoice } from '../../../../Models/zatca/electronic-invoice';
import { InventoryDetailsService } from '../../../../Services/Employee/Inventory/inventory-details.service';
import { InventoryMasterService } from '../../../../Services/Employee/Inventory/inventory-master.service';
import { ApiService } from '../../../../Services/api.service';
import { ZatcaService } from '../../../../Services/Employee/Zatca/zatca.service';
import { EtaService } from '../../../../Services/Employee/ETA/eta.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';
@Component({
  selector: 'app-electronic-invoice-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './electronic-invoice-detail.component.html',
  styleUrls: ['./electronic-invoice-detail.component.css'],
  providers: [DatePipe],
})

@InitLoader()
export class ElectronicInvoiceDetailComponent implements OnInit {
  @ViewChild('pdfPrint') pdfPrint!: PdfPrintComponent;

  invoiceId!: number;
  invoice: ElectronicInvoice = {
    id: 0,
    invoiceNumber: '',
    date: '',
    isCash: false,
    isVisa: false,
    cashAmount: 0,
    visaAmount: 0,
    remaining: 0,
    total: 0,
    totalWithVat: null,
    vatAmount: null,
    vatPercent: null,
    invoiceHash: null,
    qrCode: null,
    uuid: null,
    status: null,
    isValid: null,
    qrImage: null,
    notes: null,
    storeID: 0,
    studentID: null,
    saveID: null,
    bankID: null,
    flagId: 0,
    supplierId: null,
    storeToTransformId: null,
    schoolId: 0,
    schoolPCId: 0,
  };
  isLoading = false;
  isSubmitting = false;
  DomainName: string = '';
  currentSystem: 'zatca' | 'eta' = 'zatca';
  showPDF = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  school = {
    reportHeaderOneEn: 'Invoice Report',
    reportHeaderTwoEn: 'Simplified Tax Invoice',
    reportHeaderOneAr: 'تقرير الفاتورة',
    reportHeaderTwoAr: 'فاتورة ضريبة مبسطة',
    reportImage: 'assets/images/logo.png',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private languageService: LanguageService,
    private inventoryDetailsService: InventoryDetailsService,
    private inventoryMasterService: InventoryMasterService,
    public ApiServ: ApiService,
    private datePipe: DatePipe,
    private zatcaService: ZatcaService,
    private etaService: EtaService, 
    private loadingService: LoadingService 
  ) {}

  ngOnInit() {
    this.invoiceId = +this.route.snapshot.params['id'];
    this.DomainName = this.ApiServ.GetHeader();

    // Determine system from route data
    this.currentSystem = this.route.snapshot.data['system'] || 'zatca';

    this.loadInvoice();
        this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void { 
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Update the loadInvoice() method in electronic-invoice-detail.component.ts
  loadInvoice() {
    this.isLoading = true;

    this.inventoryMasterService
      .GetById(this.invoiceId, this.DomainName)
      .subscribe({
        next: (masterData: any) => {
          // Use 'any' temporarily or create a proper type
          this.invoice = {
            ...this.invoice,
            id: masterData.id,
            invoiceNumber: masterData.invoiceNumber?.toString() || '',
            date: masterData.date,
            total: masterData.total,
            vatPercent: masterData.vatPercent,
            vatAmount: masterData.vatAmount,
            totalWithVat: masterData.totalWithVat,
            flagEnName: masterData.flagEnName,
            student: masterData.studentName,
            studentAddress: masterData.studentAddress || null,
            storeName: masterData.storeName,
            isValid: masterData.isValid || null,
            qrCode: masterData.qrCode || null,
            qrImage: masterData.qrImage || null,
            invoiceHash: masterData.invoiceHash || null,
            uuid: masterData.uuid || null,
          };

          this.inventoryDetailsService
            .GetBySalesId(this.invoiceId, this.DomainName)
            .subscribe({
              next: (details: any) => {
                this.invoice.inventoryDetails = details.map((item: any) => ({
                  ...item,
                  itemName: item.shopItemName,
                  tax: item.tax || 0,
                }));
                this.isLoading = false;
              },
              error: (detailsError) => {
                console.error('Error loading invoice details:', detailsError);
                this.isLoading = false;
              },
            });
        },
        error: (masterError) => {
          console.error('Error loading invoice master data:', masterError);
          this.isLoading = false;
          this.goBack();
        },
      });
  }

  goBack() {
    const routePrefix =
      this.currentSystem === 'zatca'
        ? '/Employee/Zatca Electronic-Invoice'
        : '/Employee/ETA Electronic-Invoice';
    this.router.navigate([routePrefix]);
  }

  // Update the sendInvoice method in electronic-invoice-detail.component.ts
  async sendInvoice() {
    this.isSubmitting = true;

    try {
      const serviceCall =
        this.currentSystem === 'zatca'
          ? this.zatcaService.reportInvoice(this.invoiceId, this.DomainName)
          : this.etaService.submitInvoice(
              this.invoiceId,
              0,
              0,
              this.DomainName
            );

      await firstValueFrom(serviceCall);

      Swal.fire(
        'Success',
        `Invoice ${
          this.currentSystem === 'zatca'
            ? 'reported to ZATCA'
            : 'submitted to ETA'
        } successfully`,
        'success'
      );
      this.invoice.isValid = true;
    } catch (error) {
      Swal.fire(
        'Error',
        `Failed to ${
          this.currentSystem === 'zatca' ? 'report' : 'submit'
        } invoice`,
        'error'
      );
      console.error('Error submitting invoice:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  printInvoice() {
    this.showPDF = true;
    setTimeout(() => {
      const printContents = document.getElementById('invoiceData')?.innerHTML;
      if (!printContents) {
        Swal.fire('Error', 'Failed to prepare print content', 'error');
        this.showPDF = false;
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

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd MMMM yyyy') || '';
  }

  getInvoiceTableData(): any[] {
    if (!this.invoice.inventoryDetails) return [];

    return this.invoice.inventoryDetails.map((item) => ({
      Product: item.itemName || '-',
      Quantity: item.quantity || 0,
      Price: item.price || 0,
      Tax: item.tax || 0,
      Total: item.totalPrice || 0,
    }));
  }

  getQRCodeImage(): string {
    if (this.invoice.qrImage) {
      return `data:image/png;base64,${this.invoice.qrImage}`;
    }
    return '';
  }

  getInvoiceSummary(): any[] {
    return [
      { key: 'Subtotal', value: this.invoice.total },
      { key: 'VAT Amount', value: this.invoice.vatAmount },
      { key: 'Total with VAT', value: this.invoice.totalWithVat },
    ];
  }
}
