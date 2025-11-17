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
import { LoadingService } from '../../../../../Services/loading.service';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-teacher-evaluation-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './teacher-evaluation-report.component.html',
  styleUrl: './teacher-evaluation-report.component.css',
})

@InitLoader()
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
  reportGenerated: boolean = false;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  @ViewChild('reportContent') reportContent!: ElementRef;

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private evaluationService: EvaluationEmployeeService,
    private apiService: ApiService, 
    private loadingService: LoadingService 
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
    this.reportGenerated = true;

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

    clearFilters() {
    this.filterParams = {
      fromDate: '',
      toDate: '',
      employeeId: null,
      departmentId: null
    };
    this.employees = [];
    this.reportGenerated = false; // Reset flag when clearing filters
    
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    
    this.evaluationData = [];
    this.hasData = false;
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
              display: true,
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


  // ========== EXPORT METHODS ==========

async downloadAsPDF() {
  if (!this.hasData) {
    Swal.fire('Warning', 'No data available to export', 'warning');
    return;
  }

  this.isExporting = true;
  let reportElement: HTMLElement | null = null;

  try {
    // Wait for the chart to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create a temporary container for the report (same as assignment report)
    reportElement = document.createElement('div');
    reportElement.style.width = '900px';
    reportElement.style.padding = '32px';
    reportElement.style.backgroundColor = '#fff';
    reportElement.style.fontFamily = 'Arial, sans-serif';
    reportElement.style.position = 'fixed';
    reportElement.style.left = '-9999px';
    reportElement.style.top = '0';
    reportElement.style.color = '#333';
    reportElement.style.boxSizing = 'border-box';

    // Header
    const headerDiv = document.createElement('div');
    headerDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 2rem; font-weight: bold; color: #333; margin: 0;">
          Teacher Evaluation Report
        </h1>
        <h2 style="font-size: 1.25rem; color: #666; margin: 8px 0 0 0;">
          Performance Analysis Over Time
        </h2>
      </div>
    `;
    reportElement.appendChild(headerDiv);

    // Chart image
    if (this.chartCanvas && this.chartCanvas.nativeElement) {
      const chartCanvas = await html2canvas(this.chartCanvas.nativeElement, {
        scale: 2,
        backgroundColor: '#fff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        width: this.chartCanvas.nativeElement.scrollWidth,
        height: this.chartCanvas.nativeElement.scrollHeight
      });
      const chartImg = document.createElement('img');
      chartImg.src = chartCanvas.toDataURL('image/png');
      chartImg.style.display = 'block';
      chartImg.style.margin = '0 auto 32px auto';
      chartImg.style.maxWidth = '100%';
      chartImg.style.height = 'auto';
      reportElement.appendChild(chartImg);
    }

    // Details
    const detailsDiv = document.createElement('div');
    detailsDiv.innerHTML = `
      <div style="margin: 24px 0;">
        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 10px; color: #333;">
          Report Details
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; font-size: 14px;">
          <div><strong>Date Range:</strong> ${this.filterParams.fromDate} to ${this.filterParams.toDate}</div>
          <div><strong>Department:</strong> ${this.getDepartmentName()}</div>
          <div><strong>Employee:</strong> ${this.getEmployeeName()}</div>
          <div><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</div>
          <div><strong>Total Records:</strong> ${this.evaluationData.length}</div>
          <div><strong>Employees Evaluated:</strong> ${this.getUniqueEmployeeCount()}</div>
        </div>
      </div>
    `;
    reportElement.appendChild(detailsDiv);

    

    // Append to document body
    document.body.appendChild(reportElement);

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 300));

    // Convert to image
    const reportImage = await html2canvas(reportElement, {
      scale: 2,
      backgroundColor: '#fff',
      logging: false,
      useCORS: true,
      allowTaint: false,
      width: reportElement.scrollWidth,
      height: reportElement.scrollHeight
    });

    // Clean up
    if (reportElement.parentNode) {
      document.body.removeChild(reportElement);
    }

    const imgData = reportImage.toDataURL('image/png');

    // Create PDF in portrait mode (like a standard document)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate image dimensions to fit the page
    const imgWidth = pdfWidth - 20; // 10mm margins on each side
    const imgHeight = (reportImage.height * imgWidth) / reportImage.width;

    // Add image to PDF with centered margins
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

    // Save PDF
    pdf.save(`Teacher_Evaluation_Report_${new Date().toISOString().slice(0, 10)}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    Swal.fire('Error', 'Failed to generate PDF. Please try again.', 'error');
  } finally {
    this.isExporting = false;
    // Safety cleanup
    if (reportElement && reportElement.parentNode === document.body) {
      document.body.removeChild(reportElement);
    }
  }
}

// Add this helper method to get unique employee count
private getUniqueEmployeeCount(): number {
  if (!this.hasData) return 0;
  const uniqueEmployees = new Set(this.evaluationData.map(item => item.employeeId));
  return uniqueEmployees.size;
}

  private setupPrintWindowCloseDetection(printWindow: Window) {
    // Check if print window is closed
    const checkPrintWindowClosed = setInterval(() => {
      if (printWindow.closed) {
        clearInterval(checkPrintWindowClosed);
        // Return focus to the main window
        window.focus();
      }
    }, 500);

    // Also detect print completion (for browsers that support it)
    if ('matchMedia' in printWindow) {
      const mediaQueryList = printWindow.matchMedia('print');
      mediaQueryList.addListener((mql) => {
        if (!mql.matches) {
          // Printing completed or canceled
          setTimeout(() => {
            // Give user a moment to see the print dialog closed
            // before automatically closing the window
            if (!printWindow.closed) {
              printWindow.close();
            }
          }, 1000);
        }
      });
    }
  }

  async printReport() {
    if (!this.hasData) {
      Swal.fire('Warning', 'No data available to print', 'warning');
      return;
    }

    this.isExporting = true;

    try {
      // Create a print-friendly version
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        Swal.fire('Error', 'Please allow popups for printing', 'error');
        this.isExporting = false;
        return;
      }

      // Set up detection for when the print window is closed
      this.setupPrintWindowCloseDetection(printWindow);

      // Convert chart to image
      const chartCanvas = await html2canvas(this.chartCanvas.nativeElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });

      const chartImage = chartCanvas.toDataURL('image/png');

      // Create print content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Teacher Evaluation Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .chart-container { text-align: center; margin: 20px 0; }
            .details { margin: 20px 0; }
            .details-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 10px; 
              margin-top: 15px;
            }
            .footer { margin-top: 30px; text-align: center; color: #666; }
            @media print {
              body { margin: 0; padding: 15px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Teacher Evaluation Report</h1>
          </div>
          
          <div class="chart-container">
            <img src="${chartImage}" style="max-width: 100%; height: auto;" />
          </div>
          
          <div class="details">
            <h3>Report Details</h3>
            <div class="details-grid">
              <div><strong>Date Range:</strong> ${this.filterParams.fromDate} to ${this.filterParams.toDate}</div>
              <div><strong>Department:</strong> ${this.getDepartmentName()}</div>
              <div><strong>Employee:</strong> ${this.getEmployeeName()}</div>
              <div><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</div>
              <div><strong>Total Records:</strong> ${this.evaluationData.length}</div>
            </div>
          </div>
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Report
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
          
          <script>
            // Auto-print when window loads
            window.onload = function() {
              window.print();
              
              // Listen for afterprint event to close the window
              window.addEventListener('afterprint', function() {
                setTimeout(function() {
                  window.close();
                }, 500); // Small delay to ensure printing has completed
              });
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();

    } catch (error) {
      console.error('Error printing report:', error);
      Swal.fire('Error', 'Failed to print report', 'error');
    } finally {
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