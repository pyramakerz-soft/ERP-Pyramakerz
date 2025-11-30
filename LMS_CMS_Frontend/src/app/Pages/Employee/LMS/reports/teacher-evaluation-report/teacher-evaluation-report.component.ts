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
// import Swal from 'sweetalert2';
import { Chart, ChartConfiguration } from 'chart.js/auto';
// import html2canvas from 'html2canvas';
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
  ) { }

  ngOnInit() {
    this.DomainName = this.apiService.GetHeader();
    this.loadDepartments();
  }

  loadDepartments() {
    this.departmentService.Get(this.DomainName).subscribe(
      (data) => {
        this.departments = data;
      },
      async (error) => {
        const Swal = await import('sweetalert2').then(m => m.default);
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
      async (error) => {
        const Swal = await import('sweetalert2').then(m => m.default);
        Swal.fire('Error', 'Failed to load employees', 'error');
      }
    );
  }

  async generateReport() {
    if (!this.filterParams.fromDate || !this.filterParams.toDate) {
      const Swal = await import('sweetalert2').then(m => m.default);
      Swal.fire('Warning', 'Please select both start and end dates', 'warning');
      return;
    }

    if (this.filterParams.fromDate > this.filterParams.toDate) {
      const Swal = await import('sweetalert2').then(m => m.default);
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
        // console.log('Fetched Evaluation Data:', data);
        this.evaluationData = data;
        this.hasData = data.length > 0;

        if (this.hasData) {
          setTimeout(() => {
            this.createChart();
          }, 100);
        }

        this.isLoading = false;
      },
      async (error) => {
        const Swal = await import('sweetalert2').then(m => m.default);
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
              // text: 'Teacher Evaluation Performance Over Time',
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
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire('Warning', 'No data available to export', 'warning');
      return;
    }

    this.isExporting = true;
    let reportElement: HTMLElement | null = null;

    try {
      const html2canvas = (await import('html2canvas')).default;

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
      const Swal = await import('sweetalert2').then(m => m.default);
      Swal.fire('Error', 'Failed to generate PDF. Please try again.', 'error');
    } finally {
      this.isExporting = false;
      // Safety cleanup
      if (reportElement && reportElement.parentNode === document.body) {
        document.body.removeChild(reportElement);
      }
    }
  }

  private getUniqueEmployeeCount(): number {
    if (!this.hasData) return 0;
    const uniqueEmployees = new Set(this.evaluationData.map(item => item.employeeId));
    return uniqueEmployees.size;
  }

  // private setupPrintWindowCloseDetection(printWindow: Window) {
  //   // Check if print window is closed
  //   const checkPrintWindowClosed = setInterval(() => {
  //     if (printWindow.closed) {
  //       clearInterval(checkPrintWindowClosed);
  //       // Return focus to the main window
  //       window.focus();
  //     }
  //   }, 500);

  //   // Also detect print completion (for browsers that support it)
  //   if ('matchMedia' in printWindow) {
  //     const mediaQueryList = printWindow.matchMedia('print');
  //     mediaQueryList.addListener((mql) => {
  //       if (!mql.matches) {
  //         // Printing completed or canceled
  //         setTimeout(() => {
  //           // Give user a moment to see the print dialog closed
  //           // before automatically closing the window
  //           if (!printWindow.closed) {
  //             printWindow.close();
  //           }
  //         }, 1000);
  //       }
  //     });
  //   }
  // }

  async printReport() {
    if (!this.hasData) {
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire('Warning', 'No data available to print', 'warning');
      return;
    }

    this.isExporting = true;

    // Store cleanup function reference
    let cleanupCalled = false;

    let cleanup = () => {
      if (cleanupCalled) return;
      cleanupCalled = true;

      const printContainer = document.querySelector('.print-overlay');
      if (printContainer && printContainer.parentNode) {
        document.body.removeChild(printContainer);
      }

      // Remove print styles
      const printStyles = document.querySelectorAll('style[data-print-style]');
      printStyles.forEach(style => style.remove());

      this.isExporting = false;
    };

    try {
      // Create a hidden print container
      const printContainer = document.createElement('div');
      printContainer.className = 'print-overlay';
      printContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: white;
      z-index: 9999;
      padding: 20px;
      overflow: auto;
      visibility: hidden;
    `;

      // First, get the chart as image
      this.getChartAsImage().then((chartImage) => {
        // Create print content with the chart image
        const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Teacher Evaluation Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 20px;
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .chart-container { 
              text-align: center; 
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .details { 
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .details-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
              margin-top: 20px;
            }
            .summary-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              page-break-inside: avoid;
            }
            .summary-table th,
            .summary-table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            .summary-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { 
                margin: 0;
                padding: 15px;
              }
              .header {
                margin-bottom: 20px;
              }
              .chart-container {
                margin: 20px 0;
              }
              .page-break {
                page-break-before: always;
              }
            }
            @page {
              size: auto;
              margin: 15mm;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-size: 28px; margin: 0 0 10px 0; color: #333;">Teacher Evaluation Report</h1>
          </div>
          
          <div class="details">
            <div class="details-grid">
              <div><strong>Date Range:</strong> ${this.filterParams.fromDate} to ${this.filterParams.toDate}</div>
              <div><strong>Department:</strong> ${this.getDepartmentName()}</div>
              <div><strong>Employee:</strong> ${this.getEmployeeName()}</div>
              <div><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</div>
              <div><strong>Total Records:</strong> ${this.evaluationData.length}</div>
              <div><strong>Employees Evaluated:</strong> ${this.getUniqueEmployeeCount()}</div>
            </div>
          </div>
          
          <div class="chart-container">
            <img src="${chartImage}" style="max-width: 100%; height: auto; border: 1px solid #ddd;" />
          </div>


        </body>
        </html>
      `;

        printContainer.innerHTML = printContent;
        document.body.appendChild(printContainer);

        // Wait for content to be rendered
        setTimeout(() => {
          // Add print styles with data attribute for easy removal
          const printStyles = document.createElement('style');
          printStyles.setAttribute('data-print-style', 'true');
          printStyles.textContent = `
          @media screen {
            .print-overlay {
              display: none !important;
            }
          }
          @media print {
            body * {
              visibility: hidden;
            }
            .print-overlay,
            .print-overlay * {
              visibility: visible;
            }
            .print-overlay {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }
          }
        `;
          document.head.appendChild(printStyles);

          // Strategy 1: Use beforeprint and afterprint events
          const handleAfterPrint = () => {
            window.removeEventListener('afterprint', handleAfterPrint);
            cleanup();
          };

          const handleBeforePrint = () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.addEventListener('afterprint', handleAfterPrint);
          };

          window.addEventListener('beforeprint', handleBeforePrint);

          // Strategy 2: Fallback timeout for browsers that don't fire afterprint
          const fallbackTimeout = setTimeout(() => {
            if (!cleanupCalled) {
              console.warn('Fallback cleanup triggered');
              cleanup();
            }
          }, 3000); // 3 second fallback

          // Strategy 3: Listen for focus event (when print dialog closes)
          const handleFocus = () => {
            window.removeEventListener('focus', handleFocus);
            if (!cleanupCalled) {
              setTimeout(() => {
                if (!cleanupCalled) {
                  cleanup();
                }
              }, 500);
            }
          };

          window.addEventListener('focus', handleFocus);

          // Update cleanup to clear the timeout
          const originalCleanup = cleanup;
          cleanup = () => {
            clearTimeout(fallbackTimeout);
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
            window.removeEventListener('focus', handleFocus);
            originalCleanup();
          };

          // Trigger print
          window.print();

        }, 500);

      }).catch(async error => {
        const Swal = await import('sweetalert2').then(m => m.default);
        Swal.fire('Error', 'Failed to generate chart for printing', 'error');
        this.isExporting = false;
      });

    } catch (error) {
      const Swal = await import('sweetalert2').then(m => m.default);
      Swal.fire('Error', 'Failed to print report', 'error');
      this.isExporting = false;

      // Cleanup on error
      const printContainer = document.querySelector('.print-overlay');
      if (printContainer && printContainer.parentNode) {
        document.body.removeChild(printContainer);
      }
    }
  }

  private getChartAsImage(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (!this.chartCanvas?.nativeElement) {
        reject('Chart canvas not available');
        return;
      }
      const html2canvas = (await import('html2canvas')).default;

      html2canvas(this.chartCanvas.nativeElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      }).then(chartCanvas => {
        resolve(chartCanvas.toDataURL('image/png'));
      }).catch(error => {
        reject(error);
      });
    });
  }


  // private getSummaryTableHTML(): string {
  //   const summaryData = this.getSummaryData();
  //   if (!summaryData.length) return '';

  //   let tableHTML = `
  //     <div class="page-break">
  //       <h3 style="font-size: 20px; margin-bottom: 15px; color: #333;">Employee Performance Summary</h3>
  //       <table class="summary-table">
  //         <thead>
  //           <tr>
  //             <th>Employee Name</th>
  //             <th>Evaluations</th>
  //             <th>Average Score</th>
  //             <th>Min Score</th>
  //             <th>Max Score</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //   `;

  //   summaryData.forEach(employee => {
  //     tableHTML += `
  //       <tr>
  //         <td>${employee.employeeName}</td>
  //         <td>${employee.evaluations}</td>
  //         <td>${employee.averageScore.toFixed(2)}</td>
  //         <td>${employee.minScore.toFixed(2)}</td>
  //         <td>${employee.maxScore.toFixed(2)}</td>
  //       </tr>
  //     `;
  //   });

  //   tableHTML += `
  //         </tbody>
  //       </table>
  //     </div>
  //   `;

  //   return tableHTML;
  // }

  private getDepartmentName(): string {
    if (!this.filterParams.departmentId) return 'All Departments';
    const department = this.departments.find(d => d.id == this.filterParams.departmentId);
    return department ? department.name : 'All Department';
  }

  private getEmployeeName(): string {
    if (!this.filterParams.employeeId) return 'All Employees';
    const employee = this.employees.find(e => e.id == this.filterParams.employeeId);
    return employee ? employee.en_name : 'All Employee';
  }

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