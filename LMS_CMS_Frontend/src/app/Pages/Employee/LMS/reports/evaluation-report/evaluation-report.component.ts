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
import { Student } from '../../../../../Models/student';
import { ReportsService } from '../../../../../Services/shared/reports.service';

@Component({
  selector: 'app-evaluation-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PdfPrintComponent],
  templateUrl: './evaluation-report.component.html',
  styleUrl: './evaluation-report.component.css',
})
export class EvaluationReportComponent {
  User_Data_After_Login: TokenData = new TokenData(
    '',
    0,
    0,
    0,
    0,
    '',
    '',
    '',
    '',
    ''
  );
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

  filterParams = {
    templateId: 0,
    fromDate: '',
    toDate: '',
    employeeId: 0,
    schoolId: null as number | null, // Change this line
    classroomId: 0,
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
    private realTimeService: RealTimeNotificationServiceService,
    private reportsService: ReportsService

  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();

    // Initialize schoolId to null (Select All)
    this.filterParams.schoolId = null;
    this.SchoolID = 0; // Also reset SchoolID

    this.getSchoolData();
    this.getEmployeeData();
    this.getTemplateData();

    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
    this.realTimeService.stopConnection();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onFilterChange() {
  this.showTable = false;
  this.reportData = [];
  this.cachedTableDataForPDF = [];
  this.collapsedEmployees.clear();
}

  getClassData() {
    this.Classs = [];
    if (this.SchoolID) {
      this.classroomService
        .GetBySchoolId(this.SchoolID, this.DomainName)
        .subscribe((data) => {
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
    this.SchoolServ.Get(this.DomainName).subscribe((data) => {
      this.Schools = data;
    });
  }

  onSchoolChange(event: Event) {
    this.Classs = [];
    this.filterParams.classroomId = 0;

    const selectedValue = (event.target as HTMLSelectElement).value;

    // Handle Select All option (null value)
    if (selectedValue === 'null') {
      this.SchoolID = 0;
      this.filterParams.schoolId = null;
    } else {
      this.SchoolID = Number(selectedValue);
      this.filterParams.schoolId = this.SchoolID;
    }

    if (this.SchoolID) {
      this.getClassData();
    }
  }

  DateChange() {
    this.showTable = false;
    this.showViewReportBtn =
      !!this.filterParams.fromDate && !!this.filterParams.toDate;
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
    if (this.filterParams.templateId)
      params.templateId = this.filterParams.templateId;
    if (this.filterParams.fromDate)
      params.fromDate = this.filterParams.fromDate;
    if (this.filterParams.toDate) 
      params.toDate = this.filterParams.toDate; 
    if (this.filterParams.employeeId && +this.filterParams.employeeId !== 0)
      params.employeeId = this.filterParams.employeeId;
    if (this.filterParams.schoolId)
      params.schoolId = this.filterParams.schoolId;
    if (this.filterParams.classroomId && +this.filterParams.classroomId !== 0)
      params.classroomId = this.filterParams.classroomId;

    console.log(params)
    this.EvaluationEmployeeServ.GetEvaluationReport(
      params,
      this.DomainName
    ).subscribe(
      (data: any) => {
        this.reportData = Array.isArray(data) ? data : [];
        // Expand all employees by default after filtering
        this.collapsedEmployees.clear();
        this.reportData.forEach((_, index) => this.collapsedEmployees.add(index));

        // Prepare data for export
        this.prepareExportData();

        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching report data:', error);
        // Swal.fire({
        //   title: 'Error',
        //   text: 'Failed to load evaluation report data.',
        //   icon: 'error',
        //   confirmButtonText: 'OK',
        // });
      }
    );
  }


private prepareExportData(): void {
  this.cachedTableDataForPDF = [];

  this.reportData.forEach((employee: any) => {
    employee.reportsByDate.forEach((evaluation: any) => {
      const evaluationDate = evaluation.date;

      // Process question groups
      if (evaluation.evaluationEmployeeQuestionGroups && evaluation.evaluationEmployeeQuestionGroups.length > 0) {
        evaluation.evaluationEmployeeQuestionGroups.forEach((group: any) => {
          const section = {
            header: `Employee: ${employee.employeeEnglishName || employee.employeeArabicName} - Evaluation: ${evaluationDate} - ${group.englishTitle || group.arabicTitle || 'Question Group'}`,
            data: [
              { key: 'Employee', value: employee.employeeEnglishName || employee.employeeArabicName || '-' },
              { key: 'Evaluation Date', value: evaluationDate },
              { key: 'Question Group', value: group.englishTitle || group.arabicTitle || '-' },
            ],
            tableHeaders: ['Question', 'Rating', 'Notes', 'Average'],
            tableData: [] as any[],
          };

          // Add questions
          if (group.evaluationEmployeeQuestions && group.evaluationEmployeeQuestions.length > 0) {
            group.evaluationEmployeeQuestions.forEach((question: any) => {
              section.tableData.push({
                Question: question.questionEnglishTitle || question.questionArabicTitle || '-',
                Rating: question.mark || 0,
                Notes: question.note || '-',
                Average: question.average || '-',
              });
            });
          }

          this.cachedTableDataForPDF.push(section);
        });
      }

      // Process student corrections
      if (evaluation.evaluationEmployeeStudentBookCorrections && evaluation.evaluationEmployeeStudentBookCorrections.length > 0) {
        const section = {
          header: `Employee: ${employee.employeeEnglishName || employee.employeeArabicName} - Evaluation: ${evaluationDate} - Student Corrections`,
          data: [
            { key: 'Employee', value: employee.employeeEnglishName || employee.employeeArabicName || '-' },
            { key: 'Evaluation Date', value: evaluationDate },
          ],
          tableHeaders: ['Student', 'Correction Book', 'Status', 'Notes', 'Average'],
          tableData: [] as any[],
        };

        evaluation.evaluationEmployeeStudentBookCorrections.forEach((correction: any) => {
          section.tableData.push({
            Student: correction.studentEnglishName || correction.studentArabicName || '-',
            'Correction Book': correction.evaluationBookCorrectionEnglishName || correction.evaluationBookCorrectionArabicName || '-',
            Status: correction.state || 0,
            Notes: correction.note || '-',
            Average: correction.averageStudent || '-',
          });
        });

        this.cachedTableDataForPDF.push(section);
      }
    });
  });

  if (this.cachedTableDataForPDF.length === 0) {
    this.cachedTableDataForPDF = [
      {
        header: 'No Evaluation Data Found',
        data: [],
        tableHeaders: [],
        tableData: [],
      },
    ];
  }
}

collapsedEmployees: Set<number> = new Set();
evaluationCollapsedState: Map<number, Set<number>> = new Map();

toggleEmployeeCollapse(index: number) {
  if (this.collapsedEmployees.has(index)) {
    this.collapsedEmployees.delete(index);
  } else {
    this.collapsedEmployees.add(index);
  }
}

toggleEvaluationCollapse(empIndex: number, evalIndex: number) {
  if (!this.evaluationCollapsedState.has(empIndex)) {
    this.evaluationCollapsedState.set(empIndex, new Set());
  }
  
  const evalSet = this.evaluationCollapsedState.get(empIndex);
  if (evalSet?.has(evalIndex)) {
    evalSet.delete(evalIndex);
  } else {
    evalSet?.add(evalIndex);
  }
}

isEvaluationCollapsed(empIndex: number, evalIndex: number): boolean {
  const evalSet = this.evaluationCollapsedState.get(empIndex);
  return !!evalSet && evalSet.has(evalIndex);
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
      schoolId: null,
      classroomId: 0,
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


getTemplateName(): string {
  // if (!this.filterParams.templateId) return 'All Templates';
  const template = this.Templates.find(t => t.id == this.filterParams.templateId);
  return template?.englishTitle || '-';
}

getEmployeeName(): string {
  if (!this.filterParams.employeeId) return 'All Employees';
  const employee = this.Employees.find(e => e.id == this.filterParams.employeeId);
  return employee?.en_name || '-';
}

getSchoolName(): string {
  if (!this.filterParams.schoolId) return 'All Schools';
  const school = this.Schools.find(s => s.id == this.filterParams.schoolId);
  return school?.name || '-';
}

getClassName(): string {
  if (!this.filterParams.classroomId) return 'All Classes';
  const classroom = this.Classs.find(c => c.id == this.filterParams.classroomId);
  return classroom?.name || '-';
}

getDateRange(): string {
  if (!this.filterParams.fromDate || !this.filterParams.toDate) return '-';
  return `${this.filterParams.fromDate} to ${this.filterParams.toDate}`;
}

getGeneratedDate(): string {
  return new Date().toLocaleDateString();
}

  getInfoRows(): any[] {
    const selectedTemplate = this.Templates.find(
      (t) => t.id == this.filterParams.templateId
    );
    const selectedEmployee = this.Employees.find(
      (e) => e.id == this.filterParams.employeeId
    );
    const selectedSchool = this.Schools.find(
      (s) => s.id == this.filterParams.schoolId
    );
    const selectedClass = this.Classs.find(
      (c) => c.id == this.filterParams.classroomId
    );

    return [
      {
        keyEn: 'Template: ' + (selectedTemplate?.englishTitle || 'All'),
        keyAr: 'النموذج: ' + (selectedTemplate?.englishTitle || 'الكل'),
      },
      {
        keyEn: 'Employee: ' + (selectedEmployee?.en_name || 'All'),
        keyAr: 'الموظف: ' + (selectedEmployee?.en_name || 'الكل'),
      },
      {
        keyEn: 'School: ' + (selectedSchool?.name || 'All'),
        keyAr: 'المدرسة: ' + (selectedSchool?.name || 'الكل'),
      },
      {
        keyEn: 'Class: ' + (selectedClass?.name || 'All'),
        keyAr: 'الفصل: ' + (selectedClass?.name || 'الكل'),
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

  async exportExcel() {
    if (this.reportData.length === 0) {
      Swal.fire({
        title: 'Warning',
        text: 'No data to export!',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      const selectedTemplate = this.Templates.find(
        (t) => t.id == this.filterParams.templateId
      );
      const selectedEmployee = this.Employees.find(
        (e) => e.id == this.filterParams.employeeId
      );
      const selectedSchool = this.Schools.find(
        (s) => s.id == this.filterParams.schoolId
      );
      const selectedClass = this.Classs.find(
        (c) => c.id == this.filterParams.classroomId
      );

      // Prepare tables data
      const tables: any[] = [];

      // Process each evaluation
      this.reportData.forEach((evaluation: any) => {
        const evaluationDate = evaluation.date;

        // Process question groups
        if (
          evaluation.evaluationEmployeeQuestionGroups &&
          evaluation.evaluationEmployeeQuestionGroups.length > 0
        ) {
          evaluation.evaluationEmployeeQuestionGroups.forEach((group: any) => {
            const tableData: any[][] = [];
            
            // Add headers
            // tableData.push(['Question', 'Rating', 'Notes']);

            // Add questions
            if (
              group.evaluationEmployeeQuestions &&
              group.evaluationEmployeeQuestions.length > 0
            ) {
              group.evaluationEmployeeQuestions.forEach((question: any) => {
                const stars = '★'.repeat(question.mark || 0) + '☆'.repeat(5 - (question.mark || 0));
                tableData.push([
                  question.questionEnglishTitle || question.questionArabicTitle || '-',
                  stars,
                  question.note || '-'
                ]);
              });
            }

            tables.push({
              title: `Evaluation: ${evaluationDate} - ${group.englishTitle || group.arabicTitle || 'Question Group'}`,
              headers: ['Question', 'Rating', 'Notes'],
              data: tableData
            });
          });
        }

        // Process student corrections
        if (
          evaluation.evaluationEmployeeStudentBookCorrections &&
          evaluation.evaluationEmployeeStudentBookCorrections.length > 0
        ) {
          const tableData: any[][] = [];
          
          // Add headers
          // tableData.push(['Student', 'Correction Book', 'Status', 'Notes']);

          // Add student corrections
          evaluation.evaluationEmployeeStudentBookCorrections.forEach((correction: any) => {
            const statusStars = '★'.repeat(correction.state || 0) + '☆'.repeat(5 - (correction.state || 0));
            tableData.push([
              correction.studentEnglishName || correction.studentArabicName || '-',
              correction.evaluationBookCorrectionEnglishName || correction.evaluationBookCorrectionArabicName || '-',
              statusStars,
              correction.note || '-'
            ]);
          });

          tables.push({
            title: `Evaluation: ${evaluationDate} - Student Corrections`,
            headers: ['Student', 'Correction Book', 'Status', 'Notes'],
            data: tableData
          });
        }
      });

      // Prepare info rows
      const infoRows = [
        { key: 'Template', value: selectedTemplate?.englishTitle || 'All' },
        { key: 'Employee', value: selectedEmployee?.en_name || 'All' },
        { key: 'School', value: selectedSchool?.name || 'All' },
        { key: 'Class', value: selectedClass?.name || 'All' },
        { key: 'Start Date', value: this.filterParams.fromDate },
        { key: 'End Date', value: this.filterParams.toDate },
        { key: 'Generated On', value: new Date().toLocaleDateString() }
      ];

      // Generate Excel using ReportsService
      await this.reportsService.generateExcelReport({
        mainHeader: {
          en: 'EVALUATION REPORT',
          ar: 'تقرير التقييم'
        },
        // subHeaders: [
        //   {
        //     en: 'Employee Performance Evaluation Summary',
        //     ar: 'ملخص تقييم أداء الموظفين'
        //   }
        // ],
        infoRows: infoRows,
        // reportImage: 'assets/images/logo.png',
        tables: tables,
        filename: `Evaluation_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      });

    } catch (error) {
      console.error('Error generating Excel report:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to generate Excel report',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }

}