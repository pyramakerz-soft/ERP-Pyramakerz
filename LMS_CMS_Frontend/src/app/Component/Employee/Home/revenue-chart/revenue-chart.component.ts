import { Component, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  templateUrl: './revenue-chart.component.html',
})
export class RevenueChartComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
          {
            label: 'Revenue',
            data: [30, 50, 25, 45, 70, 55, 30],
            backgroundColor: [
              '#3B82F6', 
              '#3B82F6',
              '#3B82F6',
              '#3B82F6',
              '#3B82F6',
            ],
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
              stepSize: 20,
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
}
