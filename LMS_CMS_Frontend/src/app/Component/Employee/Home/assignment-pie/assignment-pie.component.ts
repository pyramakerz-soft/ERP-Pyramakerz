import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Chart } from 'chart.js';
import { SubmissionsCount } from '../../../../Models/Dashboard/dashboard.models';

@Component({
  selector: 'app-assignment-pie',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="p-11 bg-white rounded-xl shadow border">
      <h2 class="font-semibold mb-6">{{ 'Assignment Submission' | translate }}</h2>
      <hr>
      <div class="relative flex flex-col md:flex-row justify-center items-center gap-6">
        <div class="flex flex-col items-end gap-4 text-sm w-40">
          <div>
            <span class="text-[#72CA3D] font-bold">{{ answerOnTimePercentage }}%</span>
            <span class="text-gray-700 ml-2">{{ 'Answered On Time' | translate }}</span>
          </div>
          <div>
            <span class="text-yellow-500 font-bold">{{ answerLatePercentage }}%</span>
            <span class="text-gray-700 ml-2">{{ 'Answered Late' | translate }}</span>
          </div>
        </div>

        <div class="relative h-64 w-64">
          <canvas id="assignmentPieChart" class="w-full h-full"></canvas>
        </div>

        <div class="flex flex-col items-start gap-4 text-sm w-40">
          <div>
            <span class="text-[#FF4906] font-bold">{{ notAnsweredPercentage }}%</span>
            <span class="text-gray-700 ml-2">{{ 'Not Answered' | translate }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AssignmentPieComponent implements AfterViewInit, OnChanges {
  @Input() submissionsCount?: SubmissionsCount;
  
  private chart?: Chart;
  answerOnTimePercentage: number = 0;
  answerLatePercentage: number = 0;
  notAnsweredPercentage: number = 0;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['submissionsCount']) {
      this.updateChart();
    }
  }

  private calculatePercentages(): void {
    this.answerOnTimePercentage = 0;
    this.answerLatePercentage = 0;
    this.notAnsweredPercentage = 0;

    if (!this.submissionsCount) return;
    
    const total = this.submissionsCount.answeredOnTime + 
                  this.submissionsCount.answeredLate + 
                  this.submissionsCount.notAnswered;
    
    if (total > 0) {
      this.answerOnTimePercentage = Math.round((this.submissionsCount.answeredOnTime / total) * 100);
      this.answerLatePercentage = Math.round((this.submissionsCount.answeredLate / total) * 100);
      this.notAnsweredPercentage = Math.round((this.submissionsCount.notAnswered / total) * 100);
    }
  }

  private createChart(): void {
    this.calculatePercentages();
    const ctx = document.getElementById('assignmentPieChart') as HTMLCanvasElement;
    
    if (!ctx) return;

    const data = this.submissionsCount ? [
      this.submissionsCount.answeredOnTime,
      this.submissionsCount.answeredLate,
      this.submissionsCount.notAnswered
    ] : [0, 0, 0];

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Answered On Time', 'Answered Late', 'Not Answered'],
        datasets: [{
          data: data,
          backgroundColor: ['#72CA3D', '#EAB308', '#FF4906'],
          borderRadius: 10,
          spacing: 2,
        }]
      },
      options: {
        cutout: '65%',
        plugins: { 
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  }

  private updateChart(): void {
    this.calculatePercentages();
    
    if (this.chart) {
      const data = this.submissionsCount ? [
        this.submissionsCount.answeredOnTime,
        this.submissionsCount.answeredLate,
        this.submissionsCount.notAnswered
      ] : [0, 0, 0];

      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
  }
}