import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { TranslateModule } from '@ngx-translate/core';
import { StudentIssueReportItem } from '../../../../../Models/SocialWorker/student-issue';
import { firstValueFrom, Subscription } from 'rxjs';
import { IssueType } from '../../../../../Models/SocialWorker/issue-type';
import { IssueTypeService } from '../../../../../Services/Employee/SocialWorker/issue-type.service';
import { StudentIssueService } from '../../../../../Services/Employee/SocialWorker/student-issue.service';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { GradeService } from '../../../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../../../Services/Employee/LMS/classroom.service';
import { StudentService } from '../../../../../Services/student.service';
import { ApiService } from '../../../../../Services/api.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import Swal from 'sweetalert2';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { TokenData } from '../../../../../Models/token-data';
import { AccountService } from '../../../../../Services/account.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-student-issue-report',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './student-issue-report.component.html',
  styleUrl: './student-issue-report.component.css'
})
export class StudentIssueReportComponent  implements OnInit {
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  
  // Filter properties
  dateFrom: string = '';
  dateTo: string = '';
  selectedSchoolId: number | null = null;
  selectedGradeId: number | null = null;
  selectedClassId: number | null = null;
  selectedStudentId: number | null = null;
  selectedIssueTypeId: number | null = null;

  // Data sources
  schools: any[] = [];
  grades: any[] = [];
  classes: any[] = [];
  students: any[] = [];
  issueTypes: IssueType[] = [];
  DomainName: string = '';

  // Report data
  studentIssueReports: StudentIssueReportItem[] = [];
  showTable: boolean = false;
  isLoading: boolean = false;
  showViewReportBtn: boolean = false;
  isExporting: boolean = false;
  reportsForExcel: any[] = [];
  reportType: string = 'employee';

  // Language and RTL
  isRtl: boolean = false;
  subscription!: Subscription;

  // PDF Export
  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  showPDF = false;
  reportsForExport: any[] = [];
  school = {
    reportHeaderOneEn: 'Student Issue Report',
    reportHeaderTwoEn: 'Student Issues Records',
    reportHeaderOneAr: 'تقرير مشاكل الطلاب',
    reportHeaderTwoAr: 'سجلات مشاكل الطلاب'
  };

  constructor(
    private studentIssueService: StudentIssueService,
    private issueTypeService: IssueTypeService,
    private schoolService: SchoolService,
    private gradeService: GradeService,
    private classroomService: ClassroomService,
    private studentService: StudentService,
    private apiService: ApiService,
    private languageService: LanguageService,
    public account: AccountService,   
    private route: ActivatedRoute, 
    private reportsService: ReportsService
  ) {}

  ngOnInit() {
    this.DomainName = this.apiService.GetHeader();
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.loadSchools();
    this.loadIssueTypes();
    this.reportType = this.route.snapshot.data['reportType'] || 'employee';
    console.log(this.reportType)
    if(this.reportType == 'parent'){
      this.getStudentsByParentId()
    }
    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void { 
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getStudentsByParentId(){
    this.studentService.Get_By_ParentID(this.UserID, this.DomainName).subscribe((d) => {
      this.students = d
      console.log(this.students)
    })
  }

  async loadSchools() {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(this.schoolService.Get(domainName));
      this.schools = data;
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  }

  async loadGrades() {
    if (this.selectedSchoolId) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.gradeService.GetBySchoolId(this.selectedSchoolId, domainName)
        );
        this.grades = data;
        this.selectedGradeId = null;
        this.classes = [];
        this.selectedClassId = null;
        this.students = [];
        this.selectedStudentId = null;
      } catch (error) {
        console.error('Error loading grades:', error);
      }
    } else {
      this.grades = [];
      this.selectedGradeId = null;
      this.classes = [];
      this.selectedClassId = null;
      this.students = [];
      this.selectedStudentId = null;
    }
  }

  async loadClasses() {
    if (this.selectedGradeId) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.classroomService.GetByGradeId(this.selectedGradeId, domainName)
        );
        this.classes = data;
        this.selectedClassId = null;
        this.students = [];
        this.selectedStudentId = null;
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    } else {
      this.classes = [];
      this.selectedClassId = null;
      this.students = [];
      this.selectedStudentId = null;
    }
  }

  async loadStudents() {
    if (this.selectedClassId) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.studentService.GetByClassID(this.selectedClassId, domainName)
        );
        this.students = data.map((student: any) => ({
          id: student.id,
          name: student.en_name || student.ar_name || 'Unknown',
        }));
        this.selectedStudentId = null;
      } catch (error) {
        console.error('Error loading students:', error);
      }
    } else {
      this.students = [];
      this.selectedStudentId = null;
    }
  }

  async loadIssueTypes() {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(
        this.issueTypeService.Get(domainName)
      );
      this.issueTypes = data;
    } catch (error) {
      console.error('Error loading issue types:', error);
      this.issueTypes = [];
    }
  }

  onSchoolChange() {
    this.loadGrades();
    this.onFilterChange();
  }

  onGradeChange() {
    this.loadClasses();
    this.onFilterChange();
  }

  onClassChange() {
    this.loadStudents();
    this.onFilterChange();
  }

  onFilterChange() {
    this.showTable = false;
    if(this.reportType == 'parent'){
      this.showViewReportBtn = this.dateFrom !== '' && this.dateTo !== '' && !!this.selectedStudentId;
    }
    else{
      this.showViewReportBtn = this.dateFrom !== '' && this.dateTo !== '' ;
    }
    this.studentIssueReports = [];
  }

  async viewReport() {
    if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
      Swal.fire({
        title: 'Invalid Date Range',
        text: 'Start date cannot be later than end date.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.isLoading = true;
    this.showTable = false;

    try {
      const domainName = this.apiService.GetHeader();
      const response = await firstValueFrom(
        this.studentIssueService.GetStudentIssueReport(
          domainName,
          this.dateFrom,
          this.dateTo,
          this.selectedSchoolId || undefined,
          this.selectedGradeId || undefined,
          this.selectedClassId || undefined,
          this.selectedStudentId || undefined,
          this.selectedIssueTypeId || undefined
        )
      );

      // console.log(response);
      
      // Handle the response directly as an array
      if (Array.isArray(response)) {
        this.studentIssueReports = response;
        console.log('Student issue reports loaded:', this.studentIssueReports.length);
      } else {
        console.log('Response is not an array:', response);
        this.studentIssueReports = [];
      }

      this.prepareExportData();
      this.showTable = true;
    } catch (error) {
      console.error('Error loading student issue reports:', error);
      this.studentIssueReports = [];
      this.showTable = true;
    } finally {
      this.isLoading = false;
    }
  }

  private prepareExportData(): void {
    // For PDF (object format)
    this.reportsForExport = this.studentIssueReports.map((report) => ({
      'Date': new Date(report.date).toLocaleDateString(),
      'Student Name': report.studentName,
      'Issue Type': report.issuesType?.name || 'N/A',
      'Details': report.details || 'N/A'
    }));

    // For Excel (array format)
    this.reportsForExcel = this.studentIssueReports.map((report) => [
      new Date(report.date).toLocaleDateString(),
      report.studentName,
      report.issuesType?.name || 'N/A',
      report.details || 'N/A'
    ]);
  }

  getSchoolName(): string {
    return this.schools.find(s => s.id === this.selectedSchoolId)?.name || 'All Schools';
  }

  getGradeName(): string {
    return this.grades.find(g => g.id === this.selectedGradeId)?.name || 'All Grades';
  }

  getClassName(): string {
    return this.classes.find(c => c.id === this.selectedClassId)?.name || 'All Classes';
  }

  getStudentName(): string {
   if(this.reportType === 'employee'){
     return this.students.find(s => s.id == this.selectedStudentId)?.name || '';
   }
   else{
    return this.students.find(s => s.id == this.selectedStudentId)?.en_name || '';
   }
  }

  getIssueTypeName(): string {
    const type = this.issueTypes.find(it => it.id === this.selectedIssueTypeId);
    return type ? (type.name) : 'All Types';
  }

  getInfoRows(): any[] {
    if(this.reportType === 'employee'){
      return [
        { keyEn: 'From Date: ' + this.dateFrom },
        { keyEn: 'To Date: ' + this.dateTo },
        { keyEn: 'School: ' + this.getSchoolName() },
        { keyEn: 'Grade: ' + this.getGradeName() },
        { keyEn: 'Class: ' + this.getClassName() },
        { keyEn: 'Student: ' + this.getStudentName() },
        { keyEn: 'Issue Type: ' + this.getIssueTypeName() }
      ];
   }
    else{
      return [
        { keyEn: 'From Date: ' + this.dateFrom },
        { keyEn: 'To Date: ' + this.dateTo },
        { keyEn: 'Student: ' + this.getStudentName() },
      ];
    }
  }

  getInfoRowsExcel(): any[] {
    if(this.reportType === 'employee'){
      return [
          { key: 'From Date', value: this.dateFrom },
          { key: 'To Date', value: this.dateTo },
          { key: 'School', value: this.getSchoolName() },
          { key: 'Grade', value: this.getGradeName() },
          { key: 'Class', value: this.getClassName() },
          { key: 'Student', value: this.getStudentName() },
          { key: 'Issue Type', value: this.getIssueTypeName() }
      ]; 
    }
    else{
      return [
          { key: 'From Date', value: this.dateFrom },
          { key: 'To Date', value: this.dateTo },
          { key: 'Student', value: this.getStudentName() },
      ];
    }
  }


  DownloadAsPDF() {
    if (this.reportsForExport.length === 0) {
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }

    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }

  Print() {
    if (this.reportsForExport.length === 0) {
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
              top: auto !important;
              left: auto !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              box-shadow: none !important;
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

  async exportExcel() {
    if (this.reportsForExcel.length === 0) {
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }

    this.isExporting = true;
    
    try {
      await this.reportsService.generateExcelReport({
        mainHeader: {
          en: 'Student Issue Report',
          ar: 'تقرير مشاكل الطلاب'
        },
        subHeaders: [
          {
            en: 'Student Issues Records',
            ar: 'سجلات مشاكل الطلاب'
          }
        ],
        infoRows:this.getInfoRowsExcel(),
        tables: [
          {
            // title: 'Student Issue Report Data',
            headers: ['Date', 'Student Name', 'Issue Type', 'Details'],
            data: this.reportsForExcel
          }
        ],
        filename: `Student_Issue_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Swal.fire('Error', 'Failed to export to Excel', 'error');
    } finally {
      this.isExporting = false;
    }
  }
}