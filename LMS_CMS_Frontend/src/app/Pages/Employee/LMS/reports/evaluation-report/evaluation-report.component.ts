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
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';

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
  cachedTableDataForPDF: any[] = [];

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
    public templateServ: EvaluationTemplateService,
    private realTimeService: RealTimeNotificationServiceService
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

  ngOnDestroy(): void {
    this.realTimeService.stopConnection(); 
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
        
        // Prepare data for export
        this.prepareExportData();
        
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

private prepareExportData(): void {
  this.cachedTableDataForPDF = [];

  this.reportData.forEach((evaluation: any) => {
    const evaluationDate = evaluation.date;
    
    // Process question groups
    if (evaluation.evaluationEmployeeQuestionGroups && evaluation.evaluationEmployeeQuestionGroups.length > 0) {
      evaluation.evaluationEmployeeQuestionGroups.forEach((group: any) => {
        const section = {
          header: `Evaluation: ${evaluationDate} - ${group.englishTitle || group.arabicTitle || 'Question Group'}`,
          data: [ 
            { key: 'Evaluation Date', value: evaluationDate },
            { key: 'Question Group', value: group.englishTitle || group.arabicTitle || 'N/A' }
          ],
          tableHeaders: ['Question', 'Rating', 'Notes', 'Average'], 
          tableData: [] as {Question: string, Rating: number, Notes: string, Average: string}[]
        };

        // Add questions
        if (group.evaluationEmployeeQuestions && group.evaluationEmployeeQuestions.length > 0) {
          group.evaluationEmployeeQuestions.forEach((question: any) => {
            section.tableData.push({
              'Question': question.questionEnglishTitle || question.questionArabicTitle || 'N/A',
              'Rating': question.mark || 0,
              'Notes': question.note || 'N/A',
              'Average': question.average || 'N/A'
            });
          });
        }

        this.cachedTableDataForPDF.push(section);
      });
    }

    // Process student corrections
    if (evaluation.evaluationEmployeeStudentBookCorrections && evaluation.evaluationEmployeeStudentBookCorrections.length > 0) {
      evaluation.evaluationEmployeeStudentBookCorrections.forEach((correction: any) => {
        const section = {
          header: `Evaluation: ${evaluationDate} - Student Correction`,
          data: [
            { key: 'Evaluation Date', value: evaluationDate },
            { key: 'Student', value: correction.studentEnglishName || correction.studentArabicName || 'N/A' },
            { key: 'Correction Book', value: correction.evaluationBookCorrectionEnglishName || correction.evaluationBookCorrectionArabicName || 'N/A' }
          ],
          tableHeaders: ['Status', 'Notes', 'Average'], 
          tableData: [{ 
            'Status': correction.state || 0,
            'Notes': correction.note || 'N/A',
            'Average': correction.averageStudent || 'N/A'
          }]
        };

        this.cachedTableDataForPDF.push(section);
      });
    }
  });

  if (this.cachedTableDataForPDF.length === 0) {
    this.cachedTableDataForPDF = [{
      header: 'No Evaluation Data Found',
      data: [],
      tableHeaders: [],
      tableData: []
    }];
  }

  console.log('Cached PDF Data:', this.cachedTableDataForPDF);
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
    const selectedTemplate = this.Templates.find(t => t.id == this.filterParams.templateId);
    const selectedEmployee = this.Employees.find(e => e.id == this.filterParams.employeeId);
    const selectedSchool = this.Schools.find(s => s.id == this.filterParams.schoolId);
    const selectedClass = this.Classs.find(c => c.id == this.filterParams.classroomId);

    return [
      {
        keyEn: 'Template: ' + (selectedTemplate?.englishTitle || 'All'),
        keyAr: 'النموذج: ' + (selectedTemplate?.englishTitle || 'الكل')
      },
      {
        keyEn: 'Employee: ' + (selectedEmployee?.en_name || 'All'),
        keyAr: 'الموظف: ' + (selectedEmployee?.en_name || 'الكل')
      },
      {
        keyEn: 'School: ' + (selectedSchool?.name || 'All'),
        keyAr: 'المدرسة: ' + (selectedSchool?.name || 'الكل')
      },
      {
        keyEn: 'Class: ' + (selectedClass?.name || 'All'),
        keyAr: 'الفصل: ' + (selectedClass?.name || 'الكل')
      },
      {
        keyEn: 'Start Date: ' + this.filterParams.fromDate,
        keyAr: 'تاريخ البدء: ' + this.filterParams.fromDate
      },
      {
        keyEn: 'End Date: ' + this.filterParams.toDate,
        keyAr: 'تاريخ الانتهاء: ' + this.filterParams.toDate
      },
      {
        keyEn: 'Generated On: ' + new Date().toLocaleDateString(),
        keyAr: 'تم الإنشاء في: ' + new Date().toLocaleDateString()
      }
    ];
  }

  Print() {
    if (this.cachedTableDataForPDF.length === 0) {
      Swal.fire('Warning', 'No data to print!', 'warning');
      return;
    }

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
  }

  DownloadAsPDF() {
    if (this.cachedTableDataForPDF.length === 0) {
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }

    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }


  exportExcel() {
    if (this.reportData.length === 0) {
      Swal.fire({
        title: 'Warning',
        text: 'No data to export!',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Prepare data with styling information
    const excelData = [];

    // Add report title with styling
    excelData.push([{ 
      v: 'EVALUATION REPORT', 
      s: { 
        font: { bold: true, size: 16 }, 
        alignment: { horizontal: 'center' } 
      } 
    }]);
    excelData.push([]); // empty row

    // Add filter information with styling
    const selectedTemplate = this.Templates.find(t => t.id == this.filterParams.templateId);
    const selectedEmployee = this.Employees.find(e => e.id == this.filterParams.employeeId);
    const selectedSchool = this.Schools.find(s => s.id == this.filterParams.schoolId);
    const selectedClass = this.Classs.find(c => c.id == this.filterParams.classroomId);

    excelData.push([
      { v: 'Template:', s: { font: { bold: true } } },
      { v: selectedTemplate?.englishTitle || 'All', s: { font: { bold: true } } }
    ]);
    excelData.push([
      { v: 'Employee:', s: { font: { bold: true } } },
      { v: selectedEmployee?.en_name || 'All', s: { font: { bold: true } } }
    ]);
    excelData.push([
      { v: 'School:', s: { font: { bold: true } } },
      { v: selectedSchool?.name || 'All', s: { font: { bold: true } } }
    ]);
    excelData.push([
      { v: 'Class:', s: { font: { bold: true } } },
      { v: selectedClass?.name || 'All', s: { font: { bold: true } } }
    ]);
    excelData.push([
      { v: 'From Date:', s: { font: { bold: true } } },
      { v: this.filterParams.fromDate, s: { font: { bold: true } } }
    ]);
    excelData.push([
      { v: 'To Date:', s: { font: { bold: true } } },
      { v: this.filterParams.toDate, s: { font: { bold: true } } }
    ]);
    excelData.push([]); // empty row

    // Add evaluation data
    this.reportData.forEach((evaluation: any) => {
      const evaluationDate = evaluation.date;
      
      // Add evaluation header with styling
      excelData.push([{ 
        v: `Evaluation Date: ${evaluationDate}`, 
        s: { 
          font: { bold: true, color: { rgb: 'FFFFFF' } }, 
          fill: { fgColor: { rgb: '4472C4' } } 
        } 
      }]);
      
      excelData.push([]); // empty row

      // Process question groups
      if (evaluation.evaluationEmployeeQuestionGroups && evaluation.evaluationEmployeeQuestionGroups.length > 0) {
        evaluation.evaluationEmployeeQuestionGroups.forEach((group: any) => {
          // Add group header with styling
          excelData.push([{ 
            v: `Group: ${group.englishTitle || group.arabicTitle || 'N/A'}`, 
            s: { 
              font: { bold: true, color: { rgb: 'FFFFFF' } }, 
              fill: { fgColor: { rgb: '5B9BD5' } } 
            } 
          }]);

          // Add questions table header with styling
          excelData.push([
            { v: 'Question', s: { font: { bold: true }, fill: { fgColor: { rgb: 'D9E1F2' } }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } },
            { v: 'Rating', s: { font: { bold: true }, fill: { fgColor: { rgb: 'D9E1F2' } }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } },
            { v: 'Notes', s: { font: { bold: true }, fill: { fgColor: { rgb: 'D9E1F2' } }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } },
            // { v: 'Average', s: { font: { bold: true }, fill: { fgColor: { rgb: 'D9E1F2' } }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } }
          ]);

          // Add questions with alternating row colors
          if (group.evaluationEmployeeQuestions && group.evaluationEmployeeQuestions.length > 0) {
            group.evaluationEmployeeQuestions.forEach((question: any, i: number) => {
              // Create star rating visualization - use proper star symbols
              const stars = '★'.repeat(question.mark || 0) + '☆'.repeat(5 - (question.mark || 0));
              
              excelData.push([
                { v: question.questionEnglishTitle || question.questionArabicTitle || 'N/A', s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } },
                { v: stars, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } },
                { v: question.note || 'N/A', s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } },
                // { v: question.average || 'N/A', s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'E9E9E9' : 'FFFFFF' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } }
              ]);
            });
          } else {
            excelData.push([{ v: 'No questions found for this group', s: { font: { italic: true }, alignment: { horizontal: 'center' } }, colSpan: 4 }]);
          }

          excelData.push([]); // empty row
        });
      }

      // Process student corrections
      if (evaluation.evaluationEmployeeStudentBookCorrections && evaluation.evaluationEmployeeStudentBookCorrections.length > 0) {
        // Add student corrections header with styling
        excelData.push([{ 
          v: 'Student Corrections', 
          s: { 
            font: { bold: true, color: { rgb: 'FFFFFF' } }, 
            fill: { fgColor: { rgb: 'ED7D31' } } 
          } 
        }]);

        // Add corrections table header with styling
        excelData.push([
          { v: 'Student', s: { font: { bold: true }, fill: { fgColor: { rgb: 'FCE4D6' } }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } },
          { v: 'Correction Book', s: { font: { bold: true }, fill: { fgColor: { rgb: 'FCE4D6' } }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } },
          { v: 'Status', s: { font: { bold: true }, fill: { fgColor: { rgb: 'FCE4D6' } }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } },
          { v: 'Notes', s: { font: { bold: true }, fill: { fgColor: { rgb: 'FCE4D6' } }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } },
          { v: 'Average', s: { font: { bold: true }, fill: { fgColor: { rgb: 'FCE4D6' } }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } }
        ]);

        // Add corrections with alternating row colors
        evaluation.evaluationEmployeeStudentBookCorrections.forEach((correction: any, i: number) => {
          // Create star rating visualization for status
          const statusStars = '★'.repeat(correction.state || 0) + '☆'.repeat(5 - (correction.state || 0));
          
          excelData.push([
            { v: correction.studentEnglishName || correction.studentArabicName || 'N/A', s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'FBE5D6' : 'FFFFFF' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } },
            { v: correction.evaluationBookCorrectionEnglishName || correction.evaluationBookCorrectionArabicName || 'N/A', s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'FBE5D6' : 'FFFFFF' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } },
            { v: statusStars, s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'FBE5D6' : 'FFFFFF' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } },
            { v: correction.note || 'N/A', s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'FBE5D6' : 'FFFFFF' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } },
            { v: correction.averageStudent || 'N/A', s: { fill: { fgColor: { rgb: i % 2 === 0 ? 'FBE5D6' : 'FFFFFF' } }, border: { left: { style: 'thin' }, right: { style: 'thin' } } } }
          ]);
        });

        excelData.push([]); // empty row
      }

      excelData.push([]); // empty row for spacing between evaluations
      excelData.push([]); // extra empty row
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Apply column widths
    worksheet['!cols'] = [
      { wch: 40 },  // Question/Student
      { wch: 15 },  // Rating/Status
      { wch: 30 },  // Notes
      { wch: 12 },  // Average
      { wch: 30 }   // Correction Book (for student corrections)
    ];

    // Create workbook and save
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Evaluation Report');
    
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Evaluation_Report_${dateStr}.xlsx`);
  }

}