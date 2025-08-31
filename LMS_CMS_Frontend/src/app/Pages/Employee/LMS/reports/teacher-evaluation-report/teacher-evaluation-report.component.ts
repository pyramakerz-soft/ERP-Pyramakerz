import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  filterParams = {
    fromDate: '',
    toDate: '',
    employeeId: null as number | null,
    departmentId: null as number | null,
  };

  employees: Employee[] = [];
  departments: Department[] = [];
  evaluationData: any[] = [];
  chart: any;
  isLoading: boolean = false;

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
        // Swal.fire('Error', 'Failed to load departments', 'error');
      }
    );
  }

  onDepartmentChange() {
    this.employees = [];
    this.filterParams.employeeId = null;

    if (this.filterParams.departmentId) {
      this.loadEmployeesByDepartment(this.filterParams.departmentId);
    }
  }

  loadEmployeesByDepartment(departmentId: number) {
    this.employeeService
      .GetByDepartmentId(departmentId, this.DomainName)
      .subscribe(
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
      Swal.fire(
        'Invalid Date Range',
        'Start date cannot be later than end date',
        'warning'
      );
      return;
    }

    this.isLoading = true;
    this.evaluationData = [];

    this.evaluationService
      .getTeacherEvaluationReport(
        this.filterParams.fromDate,
        this.filterParams.toDate,
        this.filterParams.employeeId,
        this.filterParams.departmentId,
        this.DomainName
      )
      .subscribe(
        (data) => {
          this.evaluationData = data;
          this.createChart();
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching evaluation report:', error);
          Swal.fire('Error', 'Failed to fetch evaluation data', 'error');
          this.isLoading = false;
        }
      );
  }

  createChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    // Group data by employee
    const employeeData: { [key: string]: any } = {};

    this.evaluationData.forEach((item) => {
      const employeeKey = `${item.employeeId}-${item.employeeEnglishName}`;
      if (!employeeData[employeeKey]) {
        employeeData[employeeKey] = {
          label: item.employeeEnglishName,
          data: [],
          dates: [],
          borderColor: this.getRandomColor(),
        };
      }

      employeeData[employeeKey].data.push(parseFloat(item.overallAverage));
      employeeData[employeeKey].dates.push(item.date);
    });

    // Get all unique dates for the x-axis
    const allDates = [
      ...new Set(this.evaluationData.map((item) => item.date)),
    ].sort();

    // Prepare datasets for chart
    const datasets = Object.values(employeeData).map((employee) => ({
      label: employee.label,
      data: allDates.map((date) => {
        const index = employee.dates.indexOf(date);
        return index !== -1 ? employee.data[index] : null;
      }),
      borderColor: employee.borderColor,
      backgroundColor: 'transparent',
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
    }));

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: allDates,
        datasets: datasets,
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Teacher Evaluation Performance Over Time',
            font: {
              size: 16,
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
          legend: {
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 0,
            max: 5,
            title: {
              display: true,
              text: 'Rating (1-5)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Evaluation Date',
            },
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
      },
    };

    const ctx = document.getElementById('evaluationChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, config);
  }

  getRandomColor(): string {
    const colors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#FF6384',
      '#C9CBCF',
      '#4BC0C0',
      '#FFCD56',
      '#C9CBCF',
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#FF6384',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  clearFilters() {
    this.filterParams = {
      fromDate: '',
      toDate: '',
      employeeId: null,
      departmentId: null,
    };
    this.employees = [];

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this.evaluationData = [];
  }
}