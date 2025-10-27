import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../../../Services/api.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { GradeService } from '../../../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../../../Services/Employee/LMS/classroom.service';
import { StudentService } from '../../../../../Services/student.service';
import { MedicalReportService } from '../../../../../Services/Employee/Clinic/medical-report.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { StateService } from '../../../../../Services/Employee/Inventory/state.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { TokenData } from '../../../../../Models/token-data';
import { AccountService } from '../../../../../Services/account.service';
@Component({
  selector: 'app-medical-report',
  templateUrl: './medical-report.component.html',
  styleUrls: ['./medical-report.component.css'],
  imports: [CommonModule, FormsModule, PdfPrintComponent , TranslateModule],
  standalone: true,
})
export class MedicalReportComponent implements OnInit {
  tabs = ['MH By Parent', 'MH By Doctor', 'Hygiene Form', 'Follow Up'];
  selectedTab = this.tabs[0];

  // Filter controls
  selectedSchool: number = 0;
  selectedGrade: number = 0;
  selectedClass: number = 0;
  selectedStudent: number = 0;

  // Data sources
  schools: any[] = [];
  grades: any[] = [];
  classes: any[] = [];
  students: any[] = [];
  isRtl: boolean = false;
  subscription!: Subscription;
  // Table data
  tableData: any[] = [];
  showTable = false;
  isLoading = false;

  // PDF properties
  @ViewChild('pdfComponentRef') pdfComponentRef?: PdfPrintComponent;
  showPDF = false;
  pdfSchoolData: any = {
    reportHeaderOneEn: 'Medical Report',
    reportHeaderTwoEn: 'Detailed Medical Information',
    reportHeaderOneAr: 'التقرير الطبي',
    reportHeaderTwoAr: 'معلومات طبية مفصلة',
  };
  pdfFileName = 'Medical_Report';
  pdfTitle = '';
  pdfInfoRows: any[] = [];
  pdfTableHeaders: string[] = [];
  pdfTableData: any[] = [];
  reportType: string = 'employee';
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  DomainName: string = '';
  UserID: number = 0;
  // Students: Student[] = [];

  constructor(
    private router: Router,
    // private hygieneFormService: HygieneFormService,
    private languageService: LanguageService,
    // private medicalHistoryService: MedicalHistoryService,
    // private followUpService: FollowUpService,
    private apiService: ApiService,
    private medicalReportService: MedicalReportService,
    private schoolService: SchoolService,
    private gradeService: GradeService,
    private classroomService: ClassroomService,
    private studentService: StudentService,
    private stateService: StateService,
    private realTimeService: RealTimeNotificationServiceService,
    public account: AccountService,
    public ApiServ: ApiService,
    private route: ActivatedRoute,
    private reportsService: ReportsService // Add this
  ) {}

  ngOnInit(): void {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.reportType = this.route.snapshot.data['reportType'] || 'employee';
    if(this.reportType == 'parent'){
      this.GetStudentsData()
    }

    this.loadSchools();
      this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });

    this.isRtl = document.documentElement.dir === 'rtl';
        this.restoreState();
    }

  ngOnDestroy(): void {
        this.realTimeService.stopConnection(); 
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
  } 

  GetStudentsData() {
    this.students = []
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

  private saveState() {
    this.stateService.setMedicalReportState({
      selectedTab: this.selectedTab,
      selectedSchool: this.selectedSchool,
      selectedGrade: this.selectedGrade,
      selectedClass: this.selectedClass,
      selectedStudent: this.selectedStudent,
      tableData: this.tableData,
      showTable: this.showTable,
      schools: this.schools,
      grades: this.grades,
      classes: this.classes,
      students: this.students
    });
  }

  private restoreState() {
    const savedState = this.stateService.getMedicalReportState();
    if (savedState) {
      this.selectedTab = savedState.selectedTab;
      this.selectedSchool = savedState.selectedSchool;
      this.selectedGrade = savedState.selectedGrade;
      this.selectedClass = savedState.selectedClass;
      this.selectedStudent = savedState.selectedStudent;
      this.tableData = savedState.tableData;
      this.showTable = savedState.showTable;
      this.schools = savedState.schools || [];
      this.grades = savedState.grades || [];
      this.classes = savedState.classes || [];
      this.students = savedState.students || [];
      
      this.prepareExportData();
      this.stateService.clearMedicalReportState();
    }
  }

    viewDetails(id: number) {
    this.saveState();
    if (this.selectedTab === 'MH By Parent') {
      this.router.navigateByUrl(`Employee/Medical History/parent/${id}`);
    } else if (this.selectedTab === 'MH By Doctor') {
      this.router.navigateByUrl(`Employee/Medical History/doctor/${id}`);
    }
  }

  OrCheck():boolean{
    if(this.reportType === 'employee'){
      return !this.selectedSchool || !this.selectedGrade || !this.selectedClass || !this.selectedStudent
    }
    else{
      return !this.selectedStudent
    }
  }

  AndCheck():boolean{
    if(this.reportType === 'employee'){
     return (!!this.selectedSchool && !!this.selectedGrade && !!this.selectedClass && !!this.selectedStudent )
   }
    else{
     return (!!this.selectedStudent)
    }
  }

  async loadGrades() {
    if (this.selectedSchool) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.gradeService.GetBySchoolId(this.selectedSchool, domainName)
        );
        this.grades = data;
        this.selectedGrade = 0;
        this.classes = [];
        this.selectedClass = 0;
        this.students = [];
        this.selectedStudent = 0;
      } catch (error) {
        console.error('Error loading grades:', error);
      }
    }
  }

  async loadClasses() {
    if (this.selectedGrade) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.classroomService.GetByGradeId(this.selectedGrade, domainName)
        );
        this.classes = data;
        this.selectedClass = 0;
        this.students = [];
        this.selectedStudent = 0;
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    }
  }

  async loadStudents() {
    if (this.selectedClass) {
      try {
        const domainName = this.apiService.GetHeader();
        const data = await firstValueFrom(
          this.studentService.GetByClassID(this.selectedClass, domainName)
        );
        this.students = data.map((student) => ({
          id: student.id,
          name: student.en_name || 'Unknown',
        }));
        this.selectedStudent = 0; // Reset selected student when class changes
      } catch (error) {
        console.error('Error loading students:', error);
      }
    } else {
      this.students = [];
      this.selectedStudent = 0;
    }
  }

onSchoolChange() {
  this.loadGrades();
  this.resetTable();
  this.saveState(); // Add this
}

onGradeChange() {
  this.loadClasses();
  this.resetTable();
  this.saveState(); // Add this
}

onClassChange() {
  this.loadStudents();
  this.resetTable();
  this.saveState(); // Add this
}

selectTab(tab: string) {
  this.selectedTab = tab;
  this.resetTable();
  this.saveState(); // Add this
}

  resetTable() {
    this.showTable = false;
    this.tableData = [];
  }

  async viewReport() {
    // if (
    //  !this.selectedStudent
    // ) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Missing Information',
    //     text: 'Please select School, Grade, Class and Student',
    //     confirmButtonColor: '#3085d6',
    //     confirmButtonText: 'OK',
    //   });
    //   return;
    // }

    this.isLoading = true;
    this.showTable = false;

    try {
      const domainName = this.apiService.GetHeader();
      let data: any[] = [];

      switch (this.selectedTab) {
        case 'MH By Parent':
          if(this.reportType === 'parent'){
            console.log(this.selectedStudent)
            data = await firstValueFrom(
              this.medicalReportService.getAllMHByParentByStudentId(
                domainName,
                this.selectedStudent,
              )
            );
          }
          else{
            data = await firstValueFrom(
              this.medicalReportService.getAllMHByParent(
                domainName,
                this.selectedStudent,
                this.selectedSchool,
                this.selectedGrade,
                this.selectedClass
              )
            );
          }
          this.tableData = data.map((item) => ({
            id: item.id,  // Make sure to include this
            date: new Date(item.insertedAt).toLocaleDateString(),
            details: item.details || 'No details',
            permanentDrug: item.permanentDrug || '-'
          }));
          console.log('MH By Parent data with IDs:', this.tableData);  // Debug log
        break;

        case 'MH By Doctor':
          if(this.reportType === 'parent'){
            data = await firstValueFrom(
              this.medicalReportService.getAllMHByDoctorByStudentId(
                domainName,
                this.selectedStudent,
              )
            );
          }
          else{
            data = await firstValueFrom(
              this.medicalReportService.getAllMHByDoctor(
                domainName,
                this.selectedStudent,
                this.selectedSchool,
                this.selectedGrade,
                this.selectedClass
              )
            );
          }
          this.tableData = data.map((item) => ({
            id: item.id,  // Make sure to include this
            date: new Date(item.insertedAt).toLocaleDateString(),
            details: item.details || 'No details',
            permanentDrug: item.permanentDrug || '-'
          }));
          console.log('MH By Doctor data with IDs:', this.tableData);  // Debug log
        break;

        case 'Hygiene Form':
          if(this.reportType === 'parent'){
            data = await firstValueFrom(
              this.medicalReportService.getAllHygieneFormsByStudentId(
                domainName,
                this.selectedStudent,
              )
            );
          }
          else{
            data = await firstValueFrom(
              this.medicalReportService.getAllHygieneForms(
                domainName,
                this.selectedStudent,
                this.selectedSchool,
                this.selectedGrade,
                this.selectedClass
              )
            );
          }
          this.tableData = data.flatMap((form) =>
            form.studentHygieneTypes.map((studentHygiene: any) => {
              const row: any = {
                date: new Date(form.date).toLocaleDateString(),
                attendance: studentHygiene.attendance ? 'Present' : 'Absent',
                comment: studentHygiene.comment || '-',
                actionTaken: studentHygiene.actionTaken || '-'
              };

              if (studentHygiene.hygieneTypes) {
                studentHygiene.hygieneTypes.forEach((type: any) => {
                  row[type.type] = 'Yes'; // This will show as checkmark
                });
              }

              return row;
            })
          );
        break;

        case 'Follow Up':
            if(this.reportType === 'parent'){
            data = await firstValueFrom(
              this.medicalReportService.getAllFollowUpsByStudentId(
                domainName,
                this.selectedStudent,
              )
            );
          }
          else{
            data = await firstValueFrom(
              this.medicalReportService.getAllFollowUps(
                domainName,
                this.selectedStudent,
                this.selectedSchool,
                this.selectedGrade,
                this.selectedClass
              )
            );
          }
          this.tableData = data.map((item: any) => ({
            date: new Date(item.insertedAt).toLocaleDateString(),
            diagnosis: item.diagnosis || 'No diagnosis',
            drug: item.followUpDrugs?.map((d: any) => d.drug).join(', ') || 'No drug',
            dose: item.followUpDrugs?.map((d: any) => d.dose).join(', ') || 'No dose',
            recommendations: item.recommendation || 'No recommendations',
            complains: item.complains || 'No complains',
            doctor: item.en_name || 'Unknown'
          }));
        break;
  
      }

      this.prepareExportData();
      console.log('Report data loaded:', this.tableData);
      this.showTable = true;
    } catch (error) {
      console.error('Error loading report data:', error);
      this.tableData = [];
      this.showTable = true;
    } finally {
      this.isLoading = false;
    }
  }
  
prepareExportData() {
  this.pdfTableData = this.tableData.map((item) => {
    switch (this.selectedTab) {
      case 'MH By Parent':
      case 'MH By Doctor':
        return {
          Date: item.date,
          Details: item.details,
          'Permanent Drug': item.permanentDrug,
        };
      case 'Hygiene Form':
        const hygieneRow: any = {
          Date: item.date,
          Attendance: item.attendance,
          Comment: item.comment,
          'Action Taken': item.actionTaken
        };
        
        // Add dynamic hygiene types - ensure all types have values
        Object.keys(item).forEach(key => {
          if (key !== 'date' && key !== 'attendance' && 
              key !== 'comment' && key !== 'actionTaken') {
            hygieneRow[key] = item[key] || 'No'; // This ensures 'No' instead of undefined
          }
        });
        
        return hygieneRow;
      case 'Follow Up':
        return {
          Date: item.date,
          Diagnosis: item.diagnosis,
          Drug: item.drug,
          Dose: item.dose,
          Recommendations: item.recommendations,
          Complains: item.complains,
          Doctor: item.doctor
        };
      default:
        return {};
    }
  });

  // Set PDF headers based on selected tab
  switch (this.selectedTab) {
    case 'MH By Parent':
    case 'MH By Doctor':
      this.pdfTableHeaders = ['Date', 'Details', 'Permanent Drug'];
      break;
    case 'Hygiene Form':
      this.pdfTableHeaders = ['Date', 'Attendance'];
      
      // Add dynamic hygiene type headers and ensure all data has these columns
      if (this.tableData.length > 0) {
        const allTypes = new Set<string>();
        
        // Collect all possible hygiene types from all rows
        this.tableData.forEach(row => {
          Object.keys(row).forEach(key => {
            if (key !== 'date' && key !== 'attendance' && 
                key !== 'comment' && key !== 'actionTaken') {
              allTypes.add(key);
            }
          });
        });

        // Add all hygiene types to headers
        allTypes.forEach(type => this.pdfTableHeaders.push(type));
        
        // Ensure all rows have all hygiene type columns with 'No' as default
        this.pdfTableData = this.pdfTableData.map(row => {
          allTypes.forEach(type => {
            if (!row.hasOwnProperty(type)) {
              row[type] = 'No';
            }
          });
          return row;
        });
      }
      
      this.pdfTableHeaders.push('Comment', 'Action Taken');
      break;
      case 'Follow Up':
      this.pdfTableHeaders = [
        'Date',
        'Diagnosis',
        'Drug',
        'Dose',
        'Recommendations',
      ];
      break;
  }

  // Set info rows (your existing code)
  const selectedSchool = this.schools.find(
    (s) => s.id === this.selectedSchool
  );
  const selectedGrade = this.grades.find((g) => g.id === this.selectedGrade);
  const selectedClass = this.classes.find((c) => c.id === this.selectedClass);
  const selectedStudent = this.students.find(
    (s) => s.id === this.selectedStudent
  );

  this.pdfInfoRows = [
    { keyEn: 'Report Type: ' + this.selectedTab },
    { keyEn: 'School: ' + (selectedSchool?.name || '-') },
    { keyEn: 'Grade: ' + (selectedGrade?.name || '-') },
    { keyEn: 'Class: ' + (selectedClass?.name || '-') },
    { keyEn: 'Student: ' + (selectedStudent?.name || '-') },
    { keyEn: 'Report Date: ' + new Date().toLocaleDateString() },
  ];
}

  getCurrentHeaders(): string[] {
    switch (this.selectedTab) {
      case 'MH By Parent':
      case 'MH By Doctor':
        return ['Date', 'Details', 'Permanent Drug'];

case 'Hygiene Form':
  const hygieneHeaders = ['Date', 'Attendance'];
  
  // Find all unique hygiene types in the data
  const allTypes = new Set<string>();
  this.tableData.forEach(row => {
    Object.keys(row).forEach(key => {
      if (key !== 'date' && key !== 'attendance' && key !== 'comment' && key !== 'actionTaken') {
        allTypes.add(key);
      }
    });
  });

  // Add hygiene type headers
  allTypes.forEach(type => hygieneHeaders.push(type));
  
  hygieneHeaders.push('Comment', 'Action Taken');
  return hygieneHeaders;

case 'Follow Up':
  return ['Date', 'Diagnosis', 'Drug', 'Dose', 'Recommendations', 'Complains', 'Doctor'];
  
      default:
        return [];
    }
  }

getCellDisplay(row: any, header: string): string {
  const value = this.getCellValue(row, header);
  
  // Only apply check/X formatting for hygiene type columns in Hygiene Form tab
  if (this.selectedTab === 'Hygiene Form' && 
      header !== 'Date' && 
      header !== 'Attendance' && 
      header !== 'Comment' && 
      header !== 'Action Taken') {
    
    if (value === 'Yes' || value == 'true') {
      return '<span class="text-green-600 font-bold">✓</span>'; // Checkmark
    } else {
      return '<span class="text-red-600 font-bold">✗</span>'; // X mark
    }
  }
  
  // For all other cases, return the original value
  return value;
}

// Update the getCellValue method to handle boolean values
getCellValue(row: any, header: string): string {
  const headerKey = header.toLowerCase().replace(/ /g, '');
  switch (headerKey) {
    case 'date':
      return row.date;
    case 'details':
      return row.details;
    case 'permanentdrug':
      return row.permanentDrug;
    case 'attendance':
      return row.attendance;
    case 'comment':
      return row.comment;
    case 'actiontaken':
      return row.actionTaken;
    case 'diagnosis':
      return row.diagnosis;
    case 'drug':
      return row.drug;
    case 'dose':
      return row.dose;
    case 'recommendations':
      return row.recommendations;

    default:
      // Handle dynamic hygiene type headers
      if (this.tableData.length > 0 && this.selectedTab === 'Hygiene Form') {
        const firstRow = this.tableData[0];
        if (Object.keys(firstRow).includes(header)) {
          return row[header] || 'No';
        }
      }
      return row[headerKey] || '';
  }
}

async exportToExcel() {
  if (this.tableData.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'No Data',
      text: 'No data to export!',
      confirmButtonText: 'OK',
    });
    return;
  }

  try {
    const selectedSchool = this.schools.find(s => s.id === this.selectedSchool);
    const selectedGrade = this.grades.find(g => g.id === this.selectedGrade);
    const selectedClass = this.classes.find(c => c.id === this.selectedClass);
    const selectedStudent = this.students.find(s => s.id === this.selectedStudent);

    // Prepare info rows
    const infoRows = [
      { key: 'Report Type', value: this.selectedTab },
      { key: 'School', value: selectedSchool?.name || '-' },
      { key: 'Grade', value: selectedGrade?.name || '-' },
      { key: 'Class', value: selectedClass?.name || '-' },
      { key: 'Student', value: selectedStudent?.name || '-' },
      { key: 'Report Date', value: new Date().toLocaleDateString() }
    ];

    // Prepare table data
    const tableData = this.pdfTableData.map(row => {
      return this.pdfTableHeaders.map(header => row[header] || '-');
    });

    const excelOptions = {
      mainHeader: {
        en: 'Medical Report',
        ar: 'التقرير الطبي'
      },
      // subHeaders: [
      //   {
      //     en: 'Detailed Medical Information',
      //     ar: 'معلومات طبية مفصلة'
      //   }
      // ],
      infoRows: infoRows,
      tables: [
        {
          headers: this.pdfTableHeaders,
          data: tableData
        }
      ],
      filename: `Medical_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
    };

    await this.reportsService.generateExcelReport(excelOptions);

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    Swal.fire({
      icon: 'error',
      title: 'Export Failed',
      text: 'Failed to export data to Excel. Please try again.',
      confirmButtonText: 'OK',
    });
  }
}

  exportToPDF() {
    if (this.pdfTableData.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'No data to export!',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.pdfTitle = `${this.selectedTab} Report`;
    this.pdfFileName = `${this.selectedTab.replace(/ /g, '_')}_Report.pdf`;
    this.showPDF = true;

    setTimeout(() => {
      if (this.pdfComponentRef) {
        this.pdfComponentRef.downloadPDF();
      }
      this.showPDF = false;
    }, 100);
  }

printTable() {
  if (this.tableData.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'No Data',
      text: 'No data to print!',
      confirmButtonText: 'OK',
    });
    return;
  }

  this.prepareExportData(); // Ensure data is prepared
  
  this.pdfTitle = `${this.selectedTab} Report`;
  this.showPDF = true;

  setTimeout(() => {
    const printContents = document.getElementById('pdfPrintData')?.innerHTML;
    if (!printContents) {
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
  }, 300); // Increased timeout to ensure data is ready
}


}