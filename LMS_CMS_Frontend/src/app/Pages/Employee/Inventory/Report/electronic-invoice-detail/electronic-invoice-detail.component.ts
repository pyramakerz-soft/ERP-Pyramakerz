// electronic-invoice-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { InventoryDetailsService } from '../../../../../Services/Employee/Inventory/inventory-details.service';
import { ApiService } from '../../../../../Services/api.service';
import { FormsModule } from '@angular/forms';
import { ElectronicInvoice } from '../../../../../Models/zatca/electronic-invoice';
import { InventoryMasterService } from '../../../../../Services/Employee/Inventory/inventory-master.service';

@Component({
  selector: 'app-electronic-invoice-detail',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './electronic-invoice-detail.component.html',
  styleUrls: ['./electronic-invoice-detail.component.css'],
  providers: [DatePipe]
})
export class ElectronicInvoiceDetailComponent implements OnInit {
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
    schoolPCId: 0
  };
  isLoading = false;
  DomainName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryDetailsService: InventoryDetailsService,
    private inventoryMasterService: InventoryMasterService,
    public ApiServ: ApiService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.invoiceId = +this.route.snapshot.params['id'];
    this.DomainName = this.ApiServ.GetHeader();
    this.loadInvoice();
  }

  loadInvoice() {
    this.isLoading = true;
    
    // First get the master invoice data
    this.inventoryMasterService.GetById(this.invoiceId, this.DomainName).subscribe({
      next: (masterData) => {
        console.log(masterData)
        // Map the master data to our invoice object
        this.invoice = {
          ...this.invoice,
          id: masterData.id,
          invoiceNumber: masterData.invoiceNumber.toString(),
          date: masterData.date,
          total: masterData.total,
          vatAmount: masterData.vatAmount,
          totalWithVat: masterData.totalWithVat,
          flagEnName: masterData.flagEnName,
          student: masterData.studentName,
          storeName: masterData.storeName,
          isValid: true // Default to true or determine from response
        };

        // Then get the inventory details
        this.inventoryDetailsService.GetBySalesId(this.invoiceId, this.DomainName).subscribe({
          next: (details) => {
            console.log(details)
            this.invoice.inventoryDetails = details.map(item => ({
              ...item,
              itemName: item.shopItemName,
              tax: 0 // Default tax value
            }));
            this.isLoading = false;
          },
          error: (detailsError) => {
            console.error('Error loading invoice details:', detailsError);
            this.isLoading = false;
          }
        });
      },
      error: (masterError) => {
        console.error('Error loading invoice master data:', masterError);
        this.isLoading = false;
        this.router.navigate(['/Employee/Electronic-Invoice']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/Employee/Electronic-Invoice']);
  }

  sendInvoice() {
    // Implement send functionality
    alert(`Invoice ${this.invoice.invoiceNumber} sent successfully`);
  }

  printInvoice() {
    window.print();
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd MMMM yyyy') || '';
  }

  calculateSubtotal(): number {
    return this.invoice.inventoryDetails?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  }

  calculateTax(): number {
    return this.invoice.inventoryDetails?.reduce((sum, item) => sum + (item.tax || 0), 0) || 0;
  }
}