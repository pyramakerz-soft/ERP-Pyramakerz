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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-teacher-evaluation-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './teacher-evaluation-report.component.html',
  styleUrl: './teacher-evaluation-report.component.css',
})
export class TeacherEvaluationReportComponent implements OnInit {
  DomainName: string = '';
  dateFrom: string = '';
  dateTo: string = '';
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
  isExporting: boolean = false;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  @ViewChild('reportContent') reportContent!: ElementRef;

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

  onDepartmentChange() {
    this.employees = [];
    this.filterParams.employeeId = null;
    
    if (this.filterParams.departmentId) {
      this.loadEmployeesByDepartment(this.filterParams.departmentId);
    }
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

    this.isLoading = true;
    this.evaluationData = [];
    this.hasData = false;

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
    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    try {
      // Group data by employee
      const employeeData: { [key: string]: any } = {};
      
      this.evaluationData.forEach(item => {
        const employeeKey = `${item.employeeId}-${item.employeeEnglishName}`;
        if (!employeeData[employeeKey]) {
          employeeData[employeeKey] = {
            label: item.employeeEnglishName,
            data: [],
            dates: [],
            borderColor: this.getOrderedColor(Object.keys(employeeData).length) // Assign color based on index
          };
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
          return index !== -1 ? employee.data[index] : null;
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
              intersect: false
            },
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMin: 0,
              suggestedMax: 5,
              title: {
                display: true,
                text: 'Rating (1-5)'
              },
              ticks: {
                stepSize: 1
              }
            },
            x: {
              title: {
                display: true,
                text: 'Evaluation Date'
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

  // ========== EXPORT METHODS ==========
async downloadAsPDF() {
  if (!this.hasData) {
    Swal.fire('Warning', 'No data available to export', 'warning');
    return;
  }

  this.isExporting = true;

  try {
    // Wait a brief moment to ensure the chart is fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Convert chart to image
    const chartCanvas = await html2canvas(this.chartCanvas.nativeElement, {
      scale: 3, // Higher resolution for PDF
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });
    
    const imgData = chartCanvas.toDataURL('image/png');
    
    // Create PDF in landscape orientation
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate dimensions to maintain aspect ratio
    const imgWidth = chartCanvas.width;
    const imgHeight = chartCanvas.height;
    const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
    const width = imgWidth * ratio;
    const height = imgHeight * ratio;
    
    // Center the image on the page
    const x = (pdfWidth - width) / 2;
    const y = (pdfHeight - height) / 2;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', x, y, width, height);
    
    // Save PDF
    pdf.save(`Teacher_Evaluation_Chart_${new Date().toISOString().slice(0, 10)}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    Swal.fire('Error', 'Failed to generate PDF', 'error');
  } finally {
    this.isExporting = false;
  }
}

async print() {
  if (!this.hasData) {
    Swal.fire('Warning', 'No data available to print', 'warning');
    return;
  }

  this.isExporting = true;

  try {
    // Wait a brief moment to ensure the chart is fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Convert chart to image
    const chartCanvas = await html2canvas(this.chartCanvas.nativeElement, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });

    const chartImage = chartCanvas.toDataURL('image/png');

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    // Create print content with only the chart
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Teacher Evaluation Report - Chart</title>
        <style>
          @page { 
            size: landscape; 
            margin: 0; 
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: white;
          }
          img {
            max-width: 100%;
            max-height: 100vh;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${chartImage}" />
      </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for the image to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        // Close the window after printing when the print dialog is closed
        const handleAfterPrint = () => {
          printWindow.close();
          this.isExporting = false;
        };
        
        // Add event listener for after print
        if (printWindow.matchMedia) {
          const mediaQueryList = printWindow.matchMedia('print');
          mediaQueryList.addListener((mql) => {
            if (!mql.matches) {
              handleAfterPrint();
            }
          });
        }
        
        // Fallback: close after a timeout
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
            this.isExporting = false;
          }
        }, 5000);
      }, 500);
    };

  } catch (error) {
    console.error('Error printing chart:', error);
    Swal.fire('Error', 'Failed to print chart', 'error');
    this.isExporting = false;
  }
}

  // Helper methods for export
  private getDepartmentName(): string {
    if (!this.filterParams.departmentId) return 'All Departments';
    const department = this.departments.find(d => d.id === this.filterParams.departmentId);
    return department ? department.name : 'Unknown Department';
  }

  private getEmployeeName(): string {
    if (!this.filterParams.employeeId) return 'All Employees';
    const employee = this.employees.find(e => e.id === this.filterParams.employeeId);
    return employee ? employee.en_name : 'Unknown Employee';
  }

  // Summary data for potential table export
  getSummaryData(): any[] {
    if (!this.hasData) return [];

    // Group by employee and calculate averages
    const employeeSummary: { [key: string]: any } = {};

    this.evaluationData.forEach(item => {
      const key = `${item.employeeId}-${item.employeeEnglishName}`;
      if (!employeeSummary[key]) {
        employeeSummary[key] = {
          employeeName: item.employeeEnglishName,
          evaluations: 0,
          totalScore: 0,
          averageScore: 0,
          minScore: 5,
          maxScore: 0
        };
      }

      employeeSummary[key].evaluations++;
      employeeSummary[key].totalScore += parseFloat(item.overallAverage);
      employeeSummary[key].minScore = Math.min(employeeSummary[key].minScore, parseFloat(item.overallAverage));
      employeeSummary[key].maxScore = Math.max(employeeSummary[key].maxScore, parseFloat(item.overallAverage));
    });

    // Calculate averages
    Object.keys(employeeSummary).forEach(key => {
      employeeSummary[key].averageScore = employeeSummary[key].totalScore / employeeSummary[key].evaluations;
    });

    return Object.values(employeeSummary);
  }
}