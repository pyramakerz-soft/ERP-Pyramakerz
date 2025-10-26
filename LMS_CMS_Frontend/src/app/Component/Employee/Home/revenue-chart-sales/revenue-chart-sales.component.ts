import { Component, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-revenue-chart-sales',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './revenue-chart-sales.component.html',
  styleUrl: './revenue-chart-sales.component.css'
})
export class RevenueChartSalesComponent implements AfterViewInit, OnChanges {
  @Input() inventorySales?: { [key: string]: number };
  
  private chart?: Chart;
  totalAmount: number = 0;

  ngAfterViewInit(): void {
    setTimeout(() => this.createChart(), 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inventorySales'] && !changes['inventorySales'].firstChange) {
      this.updateChart();
    }
  }

  private calculateTotal(): void {
    if (!this.inventorySales) {
      this.totalAmount = 0;
      return;
    }
    
    this.totalAmount = Object.values(this.inventorySales).reduce((sum, val) => sum + val, 0);
  }

  private createChart(): void {
    this.calculateTotal();
    const ctx = document.getElementById('revenueChartSales') as HTMLCanvasElement;
    
    if (!ctx) return;

    const labels = this.inventorySales ? Object.keys(this.inventorySales) : [];
    const data = this.inventorySales ? Object.values(this.inventorySales) : [];

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Sales',
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
    
    if (this.chart && this.inventorySales) {
      const labels = Object.keys(this.inventorySales);
      const data = Object.values(this.inventorySales);
      
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
  }
}