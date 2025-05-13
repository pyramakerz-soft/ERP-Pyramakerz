import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-chart-pie',
  standalone: true,
  templateUrl: './chart-pie.component.html',
})
export class ChartPieComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Platform', 'Liquidity', 'Sale', 'Marketing', 'Team'],
        datasets: [{
          data: [30, 25, 20, 15, 10],
          backgroundColor: ['#FB641B', '#2F80ED', '#1479F3', '#0055DA', '#8BCF25'],
          borderRadius: 10,
          spacing: 5,
        }]
      },
      options: {
        cutout: '65%',
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  }
}
