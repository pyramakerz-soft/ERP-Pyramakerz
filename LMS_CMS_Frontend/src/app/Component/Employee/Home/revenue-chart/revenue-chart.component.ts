import { Component, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './revenue-chart.component.html',
})
export class RevenueChartComponent implements AfterViewInit, OnChanges {
  @Input() inventoryPurchase?: { [key: string]: number };
  
  private chart?: Chart;
  totalAmount: number = 0;

  ngAfterViewInit(): void {
    setTimeout(() => this.createChart(), 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inventoryPurchase'] && !changes['inventoryPurchase'].firstChange) {
      this.updateChart();
    }
  }

  private calculateTotal(): void {
    if (!this.inventoryPurchase) {
      this.totalAmount = 0;
      return;
    }
    
    this.totalAmount = Object.values(this.inventoryPurchase).reduce((sum, val) => sum + val, 0);
  }

  private createChart(): void {
    this.calculateTotal();
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    
    if (!ctx) return;

    const labels = this.inventoryPurchase ? Object.keys(this.inventoryPurchase) : [];
    const data = this.inventoryPurchase ? Object.values(this.inventoryPurchase) : [];

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Purchase',
            data: data,
            backgroundColor: '#3B82F6',
            borderRadius: 6,
            barThickness: 24,
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#A0AEC0',
              font: { size: 10 },
            },
            grid: { display: false },
          },
          x: {
            ticks: {
              color: '#4B5563',
              font: { size: 12 },
            },
            grid: { display: false },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  private updateChart(): void {
    this.calculateTotal();
    
    if (this.chart && this.inventoryPurchase) {
      const labels = Object.keys(this.inventoryPurchase);
      const data = Object.values(this.inventoryPurchase);
      
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
  }
}