import { Component, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import Chart from 'chart.js/auto';
import { RegistrationFormStateCount } from '../../../../Models/Dashboard/dashboard.models';

@Component({
  selector: 'app-chart-pie',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './chart-pie.component.html',
})
export class ChartPieComponent implements AfterViewInit, OnChanges {
  @Input() registrationFormStateCount?: RegistrationFormStateCount;
  
  private chart?: Chart;
  acceptedPercentage: number = 0;
  declinedPercentage: number = 0;
  pendingPercentage: number = 0;
  waitingListPercentage: number = 0;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['registrationFormStateCount'] && !changes['registrationFormStateCount'].firstChange) {
      this.updateChart();
    }
  }

  private calculatePercentages(): void {
    if (!this.registrationFormStateCount) return;
    
    const total = this.registrationFormStateCount.acceptedCount + 
                  this.registrationFormStateCount.declinedCount + 
                  this.registrationFormStateCount.pending +
                  this.registrationFormStateCount.waitingListCount;
    
    if (total > 0) {
      this.acceptedPercentage = Math.round((this.registrationFormStateCount.acceptedCount / total) * 100);
      this.declinedPercentage = Math.round((this.registrationFormStateCount.declinedCount / total) * 100);
      this.pendingPercentage = Math.round((this.registrationFormStateCount.pending / total) * 100);
      this.waitingListPercentage = Math.round((this.registrationFormStateCount.waitingListCount / total) * 100);
    }
  }

  private createChart(): void {
    this.calculatePercentages();
    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
    
    if (!ctx) return;

    const data = this.registrationFormStateCount ? [
      this.registrationFormStateCount.acceptedCount,
      this.registrationFormStateCount.declinedCount,
      this.registrationFormStateCount.pending,
      this.registrationFormStateCount.waitingListCount
    ] : [0, 0, 0, 0];

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Approved Students', 'Rejected Students', 'Pending Students', 'Waiting List'],
        datasets: [{
          data: data,
          backgroundColor: ['#2F80ED', '#1479F3', '#0055DA', '#8BCF25'],
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

  private updateChart(): void {
    this.calculatePercentages();
    
    if (this.chart && this.registrationFormStateCount) {
      this.chart.data.datasets[0].data = [
        this.registrationFormStateCount.acceptedCount,
        this.registrationFormStateCount.declinedCount,
        this.registrationFormStateCount.pending,
        this.registrationFormStateCount.waitingListCount
      ];
      this.chart.update();
    }
  }
}