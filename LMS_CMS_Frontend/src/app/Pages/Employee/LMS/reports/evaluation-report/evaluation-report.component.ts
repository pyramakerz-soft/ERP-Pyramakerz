import { Component, ViewChild } from '@angular/core';
import { TokenData } from '../../../../../Models/token-data';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import { Template } from '../../../../../Models/LMS/template';
import { Employee } from '../../../../../Models/Employee/employee';
import { Classroom } from '../../../../../Models/LMS/classroom';
import { School } from '../../../../../Models/school';
import { Router } from '@angular/router';
import { AccountService } from '../../../../../Services/account.service';
import { DomainService } from '../../../../../Services/Employee/domain.service';
import { EvaluationEmployeeService } from '../../../../../Services/Employee/LMS/evaluation-employee.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { ApiService } from '../../../../../Services/api.service';
import { ClassroomService } from '../../../../../Services/Employee/LMS/classroom.service';
import { EmployeeService } from '../../../../../Services/Employee/employee.service';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { EvaluationTemplateService } from '../../../../../Services/Employee/LMS/evaluation-template.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx-js-style';

@Component({
  selector: 'app-evaluation-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
    templateUrl: './evaluation-report.component.html',
  styleUrl: './evaluation-report.component.css'
})
export class EvaluationReportComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  UserID: number = 0;

  // Filter properties
  Templates: Template[] = [];
  Employees: Employee[] = [];
  Classs: Classroom[] = [];
  Schools: School[] = [];
  SchoolID: number = 0;
  
  // Report data
  reportData: any[] = [];
  isLoading = false;
  
  // PDF/Print functionality
  showPDF: boolean = false;
  showTable: boolean = false;
  showViewReportBtn: boolean = false;
  DataToPrint: any = null;

  // School info for PDF
  school = {
    reportHeaderOneEn: 'Evaluation Report',
    reportHeaderTwoEn: 'Employee Performance Evaluation Summary',
    reportHeaderOneAr: 'تقرير التقييم',
    reportHeaderTwoAr: 'ملخص تقييم أداء الموظفين',
    reportImage: 'assets/images/logo.png',
  };

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;

  // Collapsible sections
  collapsedItems: Set<number> = new Set();

  // Filter parameters
  filterParams = {
    templateId: 0,
    fromDate: '',
    toDate: '',
    employeeId: 0,
    schoolId: 0,
    classroomId: 0
  };

  constructor(
    private router: Router,
    public account: AccountService,
    public DomainServ: DomainService,
    public ApiServ: ApiService,
    public EvaluationEmployeeServ: EvaluationEmployeeService,
    private languageService: LanguageService,
    public classroomService: ClassroomService,
    public employeeService: EmployeeService,
    public SchoolServ: SchoolService,
    public templateServ: EvaluationTemplateService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();

    this.getSchoolData();
    this.getEmployeeData();
    this.getTemplateData();

    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  getClassData() {
    this.Classs = [];
    if (this.SchoolID) {
      this.classroomService.GetBySchoolId(this.SchoolID, this.DomainName).subscribe((data) => {
        this.Classs = data;
      });
    }
  }

  getEmployeeData() {
    this.Employees = [];
    this.employeeService.GetWithTypeId(4, this.DomainName).subscribe((data) => {
      this.Employees = data;
    });
  }

  getTemplateData() {
    this.Templates = [];
    this.templateServ.Get(this.DomainName).subscribe((data) => {
      this.Templates = data;
    });
  }

  getSchoolData() {
    this.Schools = [];
    this.SchoolServ.Get(this.DomainName).subscribe(
      data => {
        this.Schools = data;
      }
    );
  }

  onSchoolChange(event: Event) {
    this.Classs = [];
    this.filterParams.classroomId = 0;
    
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.SchoolID = Number(selectedValue);
    this.filterParams.schoolId = this.SchoolID;
    
    if (this.SchoolID) {
      this.getClassData();
    }
  }

  DateChange() {
    this.showTable = false;
    this.showViewReportBtn = !!this.filterParams.fromDate && !!this.filterParams.toDate;
  }

  generateReport() {
    if (this.filterParams.fromDate > this.filterParams.toDate) {
      Swal.fire({
        title: 'Invalid Date Range',
        text: 'Start date cannot be later than end date.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.isLoading = true;
    this.showTable = true;
    this.GetData();
  }

  GetData() {
    this.reportData = [];
    
    // Prepare parameters
    const params: any = {};
    if (this.filterParams.templateId) params.templateId = this.filterParams.templateId;
    if (this.filterParams.fromDate) params.fromDate = this.filterParams.fromDate;
    if (this.filterParams.toDate) params.toDate = this.filterParams.toDate;
    if (this.filterParams.employeeId) params.employeeId = this.filterParams.employeeId;
    if (this.filterParams.schoolId) params.schoolId = this.filterParams.schoolId;
    if (this.filterParams.classroomId) params.classroomId = this.filterParams.classroomId;

    this.EvaluationEmployeeServ.GetEvaluationReport(params, this.DomainName).subscribe(
      (data: any) => {
        // Handle array response (no pagination)
        this.reportData = Array.isArray(data) ? data : [];
        
        // Initialize collapsed items
        this.collapsedItems.clear();
        this.reportData.forEach((_, index) => this.collapsedItems.add(index));
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching report data:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load evaluation report data.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }

  toggleCollapse(index: number) {
    if (this.collapsedItems.has(index)) {
      this.collapsedItems.delete(index);
    } else {
      this.collapsedItems.add(index);
    }
  }

  clearFilters() {
    this.filterParams = {
      templateId: 0,
      fromDate: '',
      toDate: '',
      employeeId: 0,
      schoolId: 0,
      classroomId: 0
    };
    this.SchoolID = 0;
    this.Classs = [];
    this.reportData = [];
    this.showTable = false;
    this.showViewReportBtn = false;
  }

  // Export methods
  get fileName(): string {
    return 'Evaluation Report';
  }

  getInfoRows(): any[] {
    return [
      {
        keyEn: 'Report Type: Evaluation Report',
        keyAr: 'نوع التقرير: تقرير التقييم',
      },
      {
        keyEn: 'Start Date: ' + this.filterParams.fromDate,
        keyAr: 'تاريخ البدء: ' + this.filterParams.fromDate,
      },
      {
        keyEn: 'End Date: ' + this.filterParams.toDate,
        keyAr: 'تاريخ الانتهاء: ' + this.filterParams.toDate,
      },
      {
        keyEn: 'Generated On: ' + new Date().toLocaleDateString(),
        keyAr: 'تم الإنشاء في: ' + new Date().toLocaleDateString(),
      },
    ];
  }

  getTableDataWithHeader(): any[] {
    return this.DataToPrint;
  }

  Print() {
    this.DataToPrint = [];
    this.GetDataForPrint().subscribe((result) => {
      this.DataToPrint = result;
      this.showPDF = true;
      setTimeout(() => {
        const printContents = document.getElementById('Data')?.innerHTML;
        if (!printContents) {
          console.error('Element not found!');
          return;
        }

        const printStyle = `
          <style>
            @page { size: auto; margin: 0mm; }
            body { margin: 0; }
            @media print {
              body > *:not(#print-container) { display: none !important; }
              #print-container {
                display: block !important;
                position: static !important;
                width: 100% !important;
                height: auto !important;
                background: white !important;
                margin: 0 !important;
              }
            }
          </style>
        `;

        const printContainer = document.createElement('div');
        printContainer.id = 'print-container';
        printContainer.innerHTML = printStyle + printContents;

        document.body.appendChild(printContainer);
        window.print();

        setTimeout(() => {
          document.body.removeChild(printContainer);
          this.showPDF = false;
        }, 100);
      }, 500);
    });
  }

  DownloadAsPDF() {
    this.DataToPrint = [];
    this.GetDataForPrint().subscribe((result) => {
      this.DataToPrint = result;
      this.showPDF = true;
      setTimeout(() => {
        this.pdfComponentRef.downloadPDF();
        setTimeout(() => (this.showPDF = false), 2000);
      }, 500);
    });
  }

  GetDataForPrint(): Observable<any[]> {
    // Get all data for printing
    const params: any = {};
    if (this.filterParams.templateId) params.templateId = this.filterParams.templateId;
    if (this.filterParams.fromDate) params.fromDate = this.filterParams.fromDate;
    if (this.filterParams.toDate) params.toDate = this.filterParams.toDate;
    if (this.filterParams.employeeId) params.employeeId = this.filterParams.employeeId;
    if (this.filterParams.schoolId) params.schoolId = this.filterParams.schoolId;
    if (this.filterParams.classroomId) params.classroomId = this.filterParams.classroomId;

    return this.EvaluationEmployeeServ.GetEvaluationReport(params, this.DomainName).pipe(
      map((data: any) => {
        const reportData = Array.isArray(data) ? data : [];
        
        // Create a flattened structure for PDF display
        const flattenedData: any[] = [];
        
        reportData.forEach((evaluation: any) => {
          // Add questions section
          evaluation.evaluationEmployeeQuestionGroups?.forEach((group: any) => {
            group.evaluationEmployeeQuestions?.forEach((question: any) => {
              flattenedData.push({
                header: `Evaluation: ${evaluation.date} - ${group.englishTitle}`,
                summary: [
                  { key: 'Evaluation Date', value: evaluation.date },
                  { key: 'Question Group', value: group.englishTitle },
                  { key: 'Question', value: question.questionEnglishTitle }
                ],
                table: {
                  headers: ['Rating', 'Notes', 'Average'],
                  data: [{
                    'Rating': question.mark,
                    'Notes': question.note || 'N/A',
                    'Average': question.average || 'N/A'
                  }]
                }
              });
            });
          });

          // Add student corrections section
          evaluation.evaluationEmployeeStudentBookCorrections?.forEach((correction: any) => {
            flattenedData.push({
              header: `Evaluation: ${evaluation.date} - Student Correction`,
              summary: [
                { key: 'Evaluation Date', value: evaluation.date },
                { key: 'Student', value: correction.studentEnglishName },
                { key: 'Correction Book', value: correction.evaluationBookCorrectionEnglishName }
              ],
              table: {
                headers: ['Status', 'Notes', 'Average'],
                data: [{
                  'Status': correction.state,
                  'Notes': correction.note || 'N/A',
                  'Average': correction.averageStudent || 'N/A'
                }]
              }
            });
          });
        });

        return flattenedData;
      }),
      catchError((error) => {
        console.error('Error in GetDataForPrint:', error);
        return of([]);
      })
    );
  }

  // DownloadAsExcel() {
  //   this.GetDataForPrint().subscribe((result) => {
  //     if (!result || result.length === 0) {
  //       Swal.fire({
  //         title: 'No Data',
  //         text: 'No data available for export.',
  //         icon: 'info',
  //         confirmButtonText: 'OK',
  //       });
  //       return;
  //     }

  //     const excelData: any[] = [];

  //     // Add report title
  //     excelData.push([{ 
  //       v: 'EVALUATION REPORT DETAILED', 
  //       s: { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' } } 
  //     }]);
  //     excelData.push([]);

  //     // Add filter information
  //     excelData.push([{ v: 'Start Date:', s: { font: { bold: true } } }, { v: this.filterParams.fromDate }]);
  //     excelData.push([{ v: 'End Date:', s: { font: { bold: true } } }, { v: this.filterParams.toDate }]);
  //     excelData.push([]);

  //     // Add evaluation data
  //     result.forEach((section: any, sectionIdx: number) => {
  //       excelData.push([{ 
  //         v: section.header, 
  //         s: { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '4472C4' } } } 
  //       }]);

  //       // Section summary
  //       section.summary.forEach((row: any, i: number) => {
  //         excelData.push([
  //           { v: row.key, s: { font: { bold: true }, fill: { fgColor: { rgb: i % 2 === 0 ? 'D9E1F2' : 'FFFFFF' } } } },
  //           { v: row.value, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'D9E1F2' : 'FFFFFF' } } } }
  //         ]);
  //       });

  //       excelData.push([]);

  //       // Table headers
  //       excelData.push(section.table.headers.map((header: string) => ({
  //         v: header,
  //         s: { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } }, color: { rgb: 'FFFFFF' } }
  //       })));

  //       // Table data
  //       if (section.table.data && section.table.data.length > 0) {
  //         section.table.data.forEach((row: any, i: number) => {
  //           excelData.push(section.table.headers.map((header: string) => ({
  //             v: row[header],
  //             s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } } }
  //           })));
  //         });
  //       }

  //       excelData.push([]);
  //     });

  //     // Create and download Excel
  //     const worksheet = XLSX.utils.aoa_to_sheet(excelData);
  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Evaluation Report');
      
  //     const dateStr = new Date().toISOString().slice(0, 10);
  //     XLSX.writeFile(workbook, `Evaluation_Report_${dateStr}.xlsx`);
  //   });
  // }
}