// electronic-invoice-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ZatcaService } from '../../../../../Services/Employee/Zatca/zatca.service';
import { ElectronicInvoice } from '../../../../../Models/zatca/electronic-invoice';
import { CommonModule, DatePipe } from '@angular/common';
import { InventoryMasterService } from '../../../../../Services/Employee/Inventory/inventory-master.service';
import { ApiService } from '../../../../../Services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-electronic-invoice-detail',
  imports: [ CommonModule, FormsModule],
  standalone:true,
  templateUrl: './electronic-invoice-detail.component.html',
  styleUrls: ['./electronic-invoice-detail.component.css'],
  providers: [DatePipe]
})
export class ElectronicInvoiceDetailComponent implements OnInit {
  invoiceId!: number;
  invoice!: ElectronicInvoice;
  isLoading = false;
  DomainName: string = '';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zatcaService: ZatcaService,
    public ApiServ: ApiService,
    private inventoryMasterService: InventoryMasterService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.invoiceId = +this.route.snapshot.params['id'];
        this.DomainName = this.ApiServ.GetHeader();

    this.loadInvoice();
  }

  loadInvoice() {
    this.isLoading = true;
    const domainName = this.zatcaService.ApiServ.GetHeader();
    
    this.inventoryMasterService.GetById(this.invoiceId, domainName).subscribe({
      next: (invoice) => {
        console.log(invoice)
        // this.invoice = invoice;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading invoice:', error);
        this.isLoading = false;
        this.router.navigate(['/electronic-invoice']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/electronic-invoice']);
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