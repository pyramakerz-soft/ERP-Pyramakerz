import { Component, AfterViewInit } from '@angular/core';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);

@Component({
  selector: 'app-sales-analytics',
  standalone: true,
  templateUrl: './sales-analytics.component.html',
})
export class SalesAnalyticsComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    const canvas = document.getElementById('salesChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    const gradient = ctx!.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    new Chart(ctx!, {
      type: 'line',
      data: {
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        datasets: [
          {
            label: 'Current Period',
            data: [10, 12, 14, 18, 22, 30, 28, 26, 29, 31, 33, 36],
            fill: true,
            backgroundColor: gradient,
            borderColor: '#3B82F6',
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: 'Previous Period',
            data: [5, 6, 7, 9, 11, 14, 13, 13, 14, 15, 15, 16],
            fill: false,
            borderColor: '#9CA3AF',
            borderDash: [4, 4],
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 6,
              color: '#374151',
            },
          },
          tooltip: {
            intersect: false,
            mode: 'index',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 10,
              color: '#A0AEC0',
              font: { size: 10 },
            },
            grid: {
              // drawBorder: false,
              color: '#F1F5F9',
            },
          },
          x: {
            ticks: {
              color: '#4B5563',
              font: { size: 12 },
            },
            grid: {
              display: false,
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
}
