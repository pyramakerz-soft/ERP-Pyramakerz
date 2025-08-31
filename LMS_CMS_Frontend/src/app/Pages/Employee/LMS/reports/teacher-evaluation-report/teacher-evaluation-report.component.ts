import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Employee } from '../../../../../Models/Employee/employee';
import { Department } from '../../../../../Models/Administrator/department';
import { EmployeeService } from '../../../../../Services/Employee/employee.service';
import { DepartmentService } from '../../../../../Services/Employee/Administration/department.service';
import { EvaluationEmployeeService } from '../../../../../Services/Employee/LMS/evaluation-employee.service';
import { ApiService } from '../../../../../Services/api.service';
import Swal from 'sweetalert2';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-teacher-evaluation-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './teacher-evaluation-report.component.html',
  styleUrl: './teacher-evaluation-report.component.css',
})
export class TeacherEvaluationReportComponent implements OnInit {
  DomainName: string = '';
  hasGeneratedReport: boolean = false;
  filterParams = {
    fromDate: '',
    toDate: '',
    employeeId: null as number | null,
    departmentId: null as number | null
  };

  employees: Employee[] = [];
  departments: Department[] = [];
  evaluationData: any[] = [];
  chart: any;
  isLoading: boolean = false;
  hasData: boolean = false;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private evaluationService: EvaluationEmployeeService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.DomainName = this.apiService.GetHeader();
    this.loadDepartments();
  }

  loadDepartments() {
    this.departmentService.Get(this.DomainName).subscribe(
      (data) => {
        this.departments = data;
      },
      (error) => {
        console.error('Error loading departments:', error);
        Swal.fire('Error', 'Failed to load departments', 'error');
      }
    );
  }

  loadEmployeesByDepartment(departmentId: number) {
    this.employeeService.GetByDepartmentId(departmentId, this.DomainName).subscribe(
      (data) => {
        this.employees = data;
      },
      (error) => {
        console.error('Error loading employees:', error);
        Swal.fire('Error', 'Failed to load employees', 'error');
      }
    );
  }

  generateReport() {
    if (!this.filterParams.fromDate || !this.filterParams.toDate) {
      Swal.fire('Warning', 'Please select both start and end dates', 'warning');
      return;
    }

    if (this.filterParams.fromDate > this.filterParams.toDate) {
      Swal.fire('Invalid Date Range', 'Start date cannot be later than end date', 'warning');
      return;
    }

    this.hasGeneratedReport = true; // Set flag to true when report is generated
    this.isLoading = true;
    this.evaluationData = [];
    this.hasData = false;

    // Destroy any existing chart
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this.evaluationService.getTeacherEvaluationReport(
      this.filterParams.fromDate,
      this.filterParams.toDate,
      this.filterParams.employeeId,
      this.filterParams.departmentId,
      this.DomainName
    ).subscribe(
      (data) => {
        console.log('Fetched Evaluation Data:', data);
        this.evaluationData = data;
        this.hasData = data.length > 0;
        
        if (this.hasData) {
          setTimeout(() => {
            this.createChart();
          }, 100);
        }
        
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching evaluation report:', error);
        Swal.fire('Error', 'Failed to fetch evaluation data', 'error');
        this.isLoading = false;
        this.hasData = false;
      }
    );
  }
  
createChart() {
  if (this.chart) {
    this.chart.destroy();
  }

  try {
    // Group data by employee
    const employeeData: { [key: string]: any } = {};
    let employeeIndex = 0;
    
    this.evaluationData.forEach(item => {
      const employeeKey = `${item.employeeId}-${item.employeeEnglishName}`;
      if (!employeeData[employeeKey]) {
        employeeData[employeeKey] = {
          label: item.employeeEnglishName,
          data: [],
          dates: [],
          borderColor: this.getOrderedColor(employeeIndex), // Use ordered color
          offset: employeeIndex * 6 // Offset each teacher by 6 units
        };
        employeeIndex++;
      }
      
      employeeData[employeeKey].data.push(parseFloat(item.overallAverage));
      employeeData[employeeKey].dates.push(item.date);
    });

    // Get all unique dates for the x-axis and sort them
    const allDates = [...new Set(this.evaluationData.map(item => item.date))].sort();

    // Prepare datasets for chart
    const datasets = Object.values(employeeData).map(employee => ({
      label: employee.label,
      data: allDates.map(date => {
        const index = employee.dates.indexOf(date);
        return index !== -1 ? employee.data[index] + employee.offset : null;
      }),
      borderColor: employee.borderColor,
      backgroundColor: 'transparent',
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      fill: false
    }));

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: allDates,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false,
            text: 'Teacher Evaluation Performance Over Time',
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                const datasetIndex = context.datasetIndex;
                const teacherOffset = Object.values(employeeData)[datasetIndex].offset;
                const actualValue = context.parsed.y - teacherOffset;
                return `${context.dataset.label}: ${actualValue.toFixed(2)}`;
              }
            }
          },
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            max: (Object.keys(employeeData).length * 6) + 5,
            display: false, // Hide y-axis numbers but keep space
            grid: {
              display: false // Hide y-axis grid lines
            }
          },
          x: {
            title: {
              display: false,
              text: 'Evaluation Date'
            },
            grid: {
              color: '#EAEAEA', // Light gray grid lines
              drawOnChartArea: true,
              drawTicks: true
            },
            ticks: {
              color: '#666666', // Dark gray text color
              font: {
                size: 12
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    };

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, config);
    } else {
      console.error('Could not get canvas context');
    }
  } catch (error) {
    console.error('Failed to create chart:', error);
  }
}

getOrderedColor(index: number): string {
  const orderedColors = [
    '#FF6384', // Red
    '#36A2EB', // Blue
    '#FFCE56', // Yellow
    '#4BC0C0', // Teal
    '#9966FF', // Purple
    '#FF9F40', // Orange
    '#C9CBCF', // Gray
    '#FFCD56', // Gold
    '#4BC0C0', // Cyan
    '#9C27B0', // Deep Purple
    '#3F51B5', // Indigo
    '#F44336', // Red
    '#4CAF50', // Green
    '#FF9800', // Amber
    '#607D8B', // Blue Gray
    '#795548'  // Brown
  ];
  return orderedColors[index % orderedColors.length];
}
  
  onFilterChange() {
    // Remove the chart when any filter changes
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.hasGeneratedReport = false; // Reset the flag
    this.hasData = false; // Reset data flag
  }

  onDepartmentChange() {
    this.employees = [];
    this.filterParams.employeeId = null;
    this.onFilterChange(); // Call the filter change method
    
    if (this.filterParams.departmentId) {
      this.loadEmployeesByDepartment(this.filterParams.departmentId);
    }
  }

  clearFilters() {
    this.filterParams = {
      fromDate: '',
      toDate: '',
      employeeId: null,
      departmentId: null
    };
    this.employees = [];
    
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    
    this.evaluationData = [];
    this.hasData = false;
  }
}