// ✅ ReportItemCardComponent with language switch (Arabic ↔ English)

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-report-item-card',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './report-item-card.component.html',
  styleUrls: ['./report-item-card.component.css']
})
export class ReportItemCardComponent {
  currentLang: 'ar' | 'en' = 'ar';

  storeId: number | null = null;
  shopItemId: number | null = null;
  fromDate: string = '';
  toDate: string = '';

  stores: any[] = [];
  items: any[] = [];
  transactions: any[] = [];
  filteredTransactions: any[] = [];
  filterBy: 'all' | 'student' | 'supplier' | 'store' = 'all';

  summary = { totalIn: 0, totalOut: 0, balance: 0 };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getStores();
    this.getItems();
  }

  getStores() {
    this.stores = [
      { id: 1, name: this.lang('Main Store', 'المخزن الرئيسي') },
      { id: 2, name: this.lang('Branch Store', 'فرع المخزن') }
    ];
  }

  getItems() {
    this.items = [
      { id: 1, name: this.lang('Coffee', 'قهوة') },
      { id: 2, name: this.lang('Sugar', 'سكر') }
    ];
  }

  lang(en: string, ar: string): string {
    return this.currentLang === 'ar' ? ar : en;
  }

  toggleLang() {
    this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
    this.getStores();
    this.getItems();
  }

  loadReport(): void {
    if (!this.storeId || !this.shopItemId || !this.fromDate || !this.toDate) {
      alert(this.lang('Please fill all fields', 'يرجى ملء جميع الحقول'));
      return;
    }

    const params = new HttpParams()
      .set('storeId', this.storeId.toString())
      .set('shopItemId', this.shopItemId.toString())
      .set('fromDate', this.fromDate)
      .set('toDate', this.toDate);

    this.http.get<any[]>('https://localhost:7205/api/inventory-net-transactions', { params })
      .subscribe(data => {
        this.transactions = data;
        this.applyFilter();
      });
  }

  getSourceName(t: any): string {
    return t.studentName || t.supplierName || t.storeToName || '---';
  }

  applyFilter() {
    switch (this.filterBy) {
      case 'student':
        this.filteredTransactions = this.transactions.filter(t => t.studentName);
        break;
      case 'supplier':
        this.filteredTransactions = this.transactions.filter(t => t.supplierName);
        break;
      case 'store':
        this.filteredTransactions = this.transactions.filter(t => t.storeToName);
        break;
      default:
        this.filteredTransactions = this.transactions;
    }

    this.summary.totalIn = this.filteredTransactions.reduce((sum, t) => sum + t.totalIn, 0);
    this.summary.totalOut = this.filteredTransactions.reduce((sum, t) => sum + t.totalOut, 0);
    this.summary.balance = this.filteredTransactions.reduce((sum, t) => sum + t.balance, 0);
  }

  exportToPDF() {
    const doc = new jsPDF();
    doc.text(this.lang('Inventory Report', 'تقرير حركة المخزون'), 14, 10);
    autoTable(doc, {
      head: [[
        this.lang('Date', 'التاريخ'),
        this.lang('Flag Name', 'نوع الحركة'),
        this.lang('Invoice #', 'رقم الفاتورة'),
        this.lang('Source', 'الجهة'),
        this.lang('Out', 'صادر'),
        this.lang('In', 'وارد'),
        this.lang('Balance', 'الرصيد')
      ]],
      body: this.filteredTransactions.map(t => [
        t.dayDate?.substring(0, 10),
        t.flagName,
        t.invoiceNumber,
        this.getSourceName(t),
        t.totalOut,
        t.totalIn,
        t.balance
      ]),
      startY: 20,
    });
    doc.save('inventory-report.pdf');
  }

  printPage() {
    window.print();
  }

  exportToExcel() {
    const rows = this.filteredTransactions.map(t => ({
      Date: t.dayDate?.substring(0, 10),
      FlagName: t.flagName,
      InvoiceNumber: t.invoiceNumber,
      Source: this.getSourceName(t),
      Out: t.totalOut,
      In: t.totalIn,
      Balance: t.balance
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Report');
    XLSX.writeFile(workbook, 'inventory-report.xlsx');
  }
}
