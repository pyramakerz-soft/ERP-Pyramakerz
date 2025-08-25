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
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { StateService } from '../../../../../Services/Employee/Inventory/state.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
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
  selectedSchool: number | null = null;
  selectedGrade: number | null = null;
  selectedClass: number | null = null;
  selectedStudent: number | null = null;

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
    private realTimeService: RealTimeNotificationServiceService
  ) {}

  ngOnInit(): void {
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
      this.router.navigateByUrl(`Employee/medical-history/parent/${id}`);
    } else if (this.selectedTab === 'MH By Doctor') {
      this.router.navigateByUrl(`Employee/medical-history/doctor/${id}`);
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
        this.selectedGrade = null;
        this.classes = [];
        this.selectedClass = null;
        this.students = [];
        this.selectedStudent = null;
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
        this.selectedClass = null;
        this.students = [];
        this.selectedStudent = null;
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
        this.selectedStudent = null; // Reset selected student when class changes
      } catch (error) {
        console.error('Error loading students:', error);
      }
    } else {
      this.students = [];
      this.selectedStudent = null;
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
    if (
      !this.selectedSchool ||
      !this.selectedGrade ||
      !this.selectedClass ||
      !this.selectedStudent
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select School, Grade, Class and Student',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.isLoading = true;
    this.showTable = false;

    try {
      const domainName = this.apiService.GetHeader();
      let data: any[] = [];

      switch (this.selectedTab) {
        case 'MH By Parent':
  data = await firstValueFrom(
    this.medicalReportService.getAllMHByParent(
      domainName,
      this.selectedStudent,
      this.selectedSchool,
      this.selectedGrade,
      this.selectedClass
    )
  );
  this.tableData = data.map((item) => ({
    id: item.id,  // Make sure to include this
    date: new Date(item.insertedAt).toLocaleDateString(),
    details: item.details || 'No details',
    permanentDrug: item.permanentDrug || 'None'
  }));
  console.log('MH By Parent data with IDs:', this.tableData);  // Debug log
  break;

case 'MH By Doctor':
  data = await firstValueFrom(
    this.medicalReportService.getAllMHByDoctor(
      domainName,
      this.selectedStudent,
      this.selectedSchool,
      this.selectedGrade,
      this.selectedClass
    )
  );
  this.tableData = data.map((item) => ({
    id: item.id,  // Make sure to include this
    date: new Date(item.insertedAt).toLocaleDateString(),
    details: item.details || 'No details',
    permanentDrug: item.permanentDrug || 'None'
  }));
  console.log('MH By Doctor data with IDs:', this.tableData);  // Debug log
  break;


case 'Hygiene Form':
  data = await firstValueFrom(
    this.medicalReportService.getAllHygieneForms(
      domainName,
      this.selectedStudent,
      this.selectedSchool,
      this.selectedGrade,
      this.selectedClass
    )
  );
  
  this.tableData = data.flatMap((form) =>
    form.studentHygieneTypes.map((studentHygiene: any) => {
      const row: any = {
        date: new Date(form.date).toLocaleDateString(),
        attendance: studentHygiene.attendance ? 'Present' : 'Absent',
        comment: studentHygiene.comment || 'None',
        actionTaken: studentHygiene.actionTaken || 'None'
      };

      if (studentHygiene.hygieneTypes) {
        studentHygiene.hygieneTypes.forEach((type: any) => {
          row[type.type] = 'Yes'; 
        });
      }

      return row;
    })
  );
  break;

case 'Follow Up':
  data = await firstValueFrom(
    this.medicalReportService.getAllFollowUps(
      domainName,
      this.selectedStudent,
      this.selectedSchool,
      this.selectedGrade,
      this.selectedClass
    )
  );
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
        
        // Add dynamic hygiene types
        Object.keys(item).forEach(key => {
          if (key !== 'date' && key !== 'attendance' && 
              key !== 'comment' && key !== 'actionTaken') {
            hygieneRow[key] = item[key] || 'No';
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
      
      // Add dynamic hygiene type headers
      if (this.tableData.length > 0) {
        const firstRow = this.tableData[0];
        Object.keys(firstRow).forEach(key => {
          if (key !== 'date' && key !== 'attendance' && 
              key !== 'comment' && key !== 'actionTaken') {
            this.pdfTableHeaders.push(key);
          }
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

  // Set info rows
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
    { keyEn: 'School: ' + (selectedSchool?.name || 'N/A') },
    { keyEn: 'Grade: ' + (selectedGrade?.name || 'N/A') },
    { keyEn: 'Class: ' + (selectedClass?.name || 'N/A') },
    { keyEn: 'Student: ' + (selectedStudent?.name || 'N/A') },
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

  exportToExcel() {
    if (this.tableData.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'No data to export!',
        confirmButtonText: 'OK',
      });
      return;
    }

    const excelData: any[] = [];

    // Add header
    excelData.push([
      {
        v: `${this.pdfSchoolData.reportHeaderOneEn} - ${this.pdfSchoolData.reportHeaderTwoEn}`,
        s: {
          font: { bold: true, sz: 16 },
          alignment: { horizontal: 'center' },
        },
      },
    ]);
    excelData.push([]);

    // Add filter information
    const selectedSchool = this.schools.find(
      (s) => s.id === this.selectedSchool
    );
    const selectedGrade = this.grades.find((g) => g.id === this.selectedGrade);
    const selectedClass = this.classes.find((c) => c.id === this.selectedClass);
    const selectedStudent = this.students.find(
      (s) => s.id === this.selectedStudent
    );

    excelData.push([
      { v: 'Report Type:', s: { font: { bold: true } } },
      { v: this.selectedTab, s: { font: { bold: true } } },
    ]);
    excelData.push([
      { v: 'School:', s: { font: { bold: true } } },
      { v: selectedSchool?.name || 'N/A', s: { font: { bold: true } } },
    ]);
    excelData.push([
      { v: 'Grade:', s: { font: { bold: true } } },
      { v: selectedGrade?.name || 'N/A', s: { font: { bold: true } } },
    ]);
    excelData.push([
      { v: 'Class:', s: { font: { bold: true } } },
      { v: selectedClass?.name || 'N/A', s: { font: { bold: true } } },
    ]);
    excelData.push([
      { v: 'Student:', s: { font: { bold: true } } },
      { v: selectedStudent?.name || 'N/A', s: { font: { bold: true } } },
    ]);
    excelData.push([]);

    // Add table headers
    excelData.push(
      this.pdfTableHeaders.map((h) => ({
        v: h,
        s: {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '4472C4' } },
          alignment: { horizontal: 'center' },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          },
        },
      }))
    );

    // Add table data
    this.pdfTableData.forEach((row, idx) => {
      const isEven = idx % 2 === 0;
      const fillColor = isEven ? 'E9E9E9' : 'FFFFFF';

      const rowData = this.pdfTableHeaders.map((header) => ({
        v: row[header] || '-',
        s: { fill: { fgColor: { rgb: fillColor } } },
      }));
      excelData.push(rowData);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Merge header
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({
      s: { r: 0, c: 0 },
      e: { r: 0, c: this.pdfTableHeaders.length - 1 },
    });

    // Set column widths
    worksheet['!cols'] = this.pdfTableHeaders.map(() => ({ wch: 20 }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Medical Report');

    // Save file
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Medical_Report_${dateStr}.xlsx`);
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