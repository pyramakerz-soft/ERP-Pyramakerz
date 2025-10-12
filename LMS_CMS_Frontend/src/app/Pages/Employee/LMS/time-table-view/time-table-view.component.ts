import { Component, ViewChild } from '@angular/core';
import { TimeTable } from '../../../../Models/LMS/time-table';
import { TimeTableService } from '../../../../Services/Employee/LMS/time-table.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { TimeTableDayGroupDTO } from '../../../../Models/LMS/time-table-day-group-dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import { Day } from '../../../../Models/day';
import { Grade } from '../../../../Models/LMS/grade';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { Employee } from '../../../../Models/Employee/employee';
import { Classroom } from '../../../../Models/LMS/classroom';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { ReportsService } from '../../../../Services/shared/reports.service';
import { PdfPrintComponent } from '../../../../Component/pdf-print/pdf-print.component';
import { Observable, of } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';

@Component({
  selector: 'app-time-table-view',
  standalone: true,
  imports: [FormsModule, CommonModule, PdfPrintComponent, TranslateModule],
  templateUrl: './time-table-view.component.html',
  styleUrl: './time-table-view.component.css',
})
export class TimeTableViewComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  TimeTableId: number = 0;
  MaxPeriods: number = 0;
  TimeTableName: string = '';
  TimeTable: TimeTableDayGroupDTO[] = [];
  OriginTimeTable: TimeTableDayGroupDTO[] = [];

  SelectedDay: number = 0;
  SelectedGrade: number = 0;
  grades: Grade[] = [];
  days: Day[] = [];
  date: any = '';

  TimeTable2: TimeTableDayGroupDTO[] = []
  TimeTablePrint: any = []
  types = ['All', 'Class', 'Teacher'];
  PrintType = 'All'; // default value
  SelectedClassId: number = 0
  SelectedTeacherId: number = 0
  TeacherName: string = '';
  ClassName: string = '';
  isLoading = false;
  Teachers: Employee[] = [];
  classes: Classroom[] = [];
  SelectedSchoolId: number = 0;
  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  showPDF = false;
  DataToPrint: any = null;

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public BusTypeServ: BusTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public TimeTableServ: TimeTableService,
    public ApiServ: ApiService,
    private languageService: LanguageService,
    public reportsService: ReportsService,
    public timetableServ: TimeTableService,
    private realTimeService: RealTimeNotificationServiceService,
     ) { }
  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });
    this.TimeTableId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.GetTimeTable();
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


  GetTimeTable() {
    this.TimeTable = [];
    this.OriginTimeTable = [];
    this.SelectedDay = 0
    this.SelectedGrade = 0
    this.date = ""
    this.timetableServ
      .GetByID(this.TimeTableId, this.DomainName)
      .subscribe((d) => {
        this.TimeTable = d.data;
        console.log(21, this.TimeTable)
        this.OriginTimeTable = d.data;
        this.TimeTableName = d.timeTableName;
        this.MaxPeriods = d.maxPeriods;
        this.ExtractDaysAndGrades();
      });
  }

  ExtractDaysAndGrades() {
    this.days = [];
    this.grades = [];

    this.TimeTable.forEach((dayEntry) => {
      // Add day info if not already added
      if (!this.days.some((d) => d.id === dayEntry.dayId)) {
        this.days.push({
          id: dayEntry.dayId,
          name: dayEntry.dayName,
        });
      }

      // Loop over grades in this day
      dayEntry.grades.forEach((grade) => {
        // Add grade info if not already added
        if (!this.grades.some((g) => g.id === grade.gradeId)) {
          this.grades.push({
            id: grade.gradeId,
            name: grade.gradeName,
            dateFrom: '',
            dateTo: '',
            insertedByUserId: 0,
            sectionID: 0,
            sectionName: '',
            sat: null,
            sun: null,
            mon: null,
            tus: null,
            wed: null,
            thru: null,
            fri: null,
          });
        }
      });
    });
  }

  FilterTimeTable() {
    this.TimeTable = [...this.OriginTimeTable];

    if (this.SelectedDay != 0 && this.SelectedGrade != 0) {
      // Filter by both day and grade
      this.TimeTable = this.TimeTable.filter(
        (day) => +day.dayId === +this.SelectedDay
      )
        .map((day) => ({
          ...day,
          grades: day.grades.filter(
            (grade) => +grade.gradeId === +this.SelectedGrade
          ),
        }))
        .filter((day) => day.grades.length > 0);
    } else if (this.SelectedDay != 0 && this.SelectedGrade == 0) {
      // Filter by day only
      this.TimeTable = this.TimeTable.filter(
        (day) => +day.dayId === +this.SelectedDay
      );
    } else if (this.SelectedDay == 0 && this.SelectedGrade != 0) {
      // Filter by grade only
      this.TimeTable = this.TimeTable.map((day) => ({
        ...day,
        grades: day.grades.filter(
          (grade) => +grade.gradeId === +this.SelectedGrade
        ),
      })).filter((day) => day.grades.length > 0);
    }

  }

  moveToTimeTable() {
    this.router.navigateByUrl(`Employee/Time Table`);
  }

  Replace() {
    this.router.navigateByUrl(
      `Employee/Time Table Replace/` + this.TimeTableId
    );
  }

  GetDutyByDate() {
    this.TimeTable = [];
    this.OriginTimeTable = [];
    this.SelectedDay = 0
    this.SelectedGrade = 0
    this.timetableServ.GetDutyByDate(this.TimeTableId, this.date, this.DomainName).subscribe((d) => {
      this.TimeTable = d.data;
      this.OriginTimeTable = d.data;
      this.TimeTableName = d.timeTableName;
      this.MaxPeriods = d.maxPeriods;
      this.ExtractDaysAndGrades();
    });
  }

  async DownloadAsExcel() {
    const tables: any[] = [];

    this.TimeTable.forEach(day => {
      const data: any[] = [];

      day.grades.forEach(grade => {
        grade.classrooms.forEach(classroom => {
          const row: any[] = [];

          row.push(grade.gradeName);         // Column 1: Grade
          row.push(classroom.classroomName); // Column 2: Class

          for (let i = 0; i < this.MaxPeriods; i++) {
            const session = classroom.sessions[i];

            let sessionText = '';

            if (session?.subjects?.length) {
              sessionText += session.subjects.map(sub => `${sub.subjectName} (${sub.teacherName})`).join('\n');
            }

            if (session?.dutyTeacherName) {
              sessionText += `\nDuty: ${session.dutyTeacherName}`;
            }

            row.push(sessionText || '--');
          }

          data.push(row);
        });
      });

      tables.push({
        title: day.dayName,
        headers: ["Grade", "Class", ...Array.from({ length: this.MaxPeriods }, (_, i) => `Session ${i + 1}`)],
        data: data
      });
    });

    await this.reportsService.generateExcelReport({
      infoRows: [
        { key: 'Name', value: this.TimeTableName },
      ],
      filename: "TimeTable.xlsx",
      tables: tables
    });
  }

  DownloadAsPDF() {
    this.DataToPrint = [];

    this.GetDataForPrint().subscribe((result) => {
      if (!result || result.length === 0) {
        alert('No data available to print.');
        return;
      }

      this.DataToPrint = result;

      this.showPDF = true;

      setTimeout(() => {
        this.pdfComponentRef?.downloadPDF();
        setTimeout(() => (this.showPDF = false), 2000);
      }, 500);
    });
  }

GetDataForPrint(): Observable<any[]> {
  const groupedByDay: any[] = [];

  this.TimeTable.forEach(day => {
    const tableHeaders = ['Grade', 'Class'];
    
    // Add session headers with better formatting for many sessions
    for (let i = 0; i < this.MaxPeriods; i++) {
      tableHeaders.push(`S${i + 1}`);
    }

    const tableData: any[] = [];

    day.grades.forEach(grade => {
      grade.classrooms.forEach(classroom => {
        const row: any = {};
        row['Grade'] = grade.gradeName;
        row['Class'] = classroom.classroomName;

        for (let i = 0; i < this.MaxPeriods; i++) {
          const session = classroom.sessions[i];
          let sessionText = '';

          if (session?.subjects?.length) {
            // Use abbreviations for better fit
            const subjectAbbr = session.subjects[0].subjectName.substring(0, 3);
            const teacherAbbr = session.subjects[0].teacherName?.split(' ').map(n => n[0]).join('') || '';
            sessionText = `${subjectAbbr}(${teacherAbbr})`;
          }

          if (session?.dutyTeacherName) {
            sessionText += sessionText ? '/D' : 'Duty';
          }

          row[`S${i + 1}`] = sessionText || '';
        }

        tableData.push(row);
      });
    });

    groupedByDay.push({
      header: day.dayName,
      tableHeaders,
      tableData,
      // Add page break for days with many sessions
      pageBreak: this.MaxPeriods > 12 ? 'always' : 'auto'
    });
  });

  return of(groupedByDay);
}

triggerPrint() {
  setTimeout(() => {
    let printContents: string | undefined;
    if (this.PrintType == "Teacher") {
      printContents = document.getElementById("DataTeacher")?.innerHTML;
    } else if (this.PrintType == "Class") {
      printContents = document.getElementById("Data")?.innerHTML;
    } else {
      printContents = document.getElementById("All")?.innerHTML;
    }
    
    if (!printContents) {
      console.error("Element not found!");
      return;
    }

    // Enhanced print-specific stylesheet
    const printStyle = `
      <style>
        @page {
          size: landscape; /* Use landscape for wider tables */
          margin: 10mm;
        }
        
        body { 
          margin: 0;
          font-family: Arial, sans-serif;
          font-size: 10px; /* Smaller font for more content */
        }
        
        .print-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed; /* Better control over column widths */
        }
        
        .print-table th,
        .print-table td {
          border: 1px solid #ddd;
          padding: 4px;
          word-wrap: break-word;
          vertical-align: top;
        }
        
        .print-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        /* Session columns - auto width adjustment */
        .session-cell {
          min-width: 60px;
          max-width: 80px;
        }
        
        /* Ensure content breaks properly */
        .break-words {
          word-break: break-word;
          overflow-wrap: break-word;
        }
        
        /* Page breaks for long content */
        .day-section {
          page-break-inside: avoid;
        }
        
        @media print {
          body > *:not(#print-container) {
            display: none !important;
          }
          
          #print-container {
            display: block !important;
            position: static !important;
            width: 100% !important;
            background: white !important;
          }
          
          /* Force horizontal scroll for very wide tables */
          .print-table-container {
            width: 100%;
            overflow-x: visible !important;
          }
        }
      </style>
    `;

    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.innerHTML = printStyle + printContents;
    
    // Add print-specific class to tables
    const tables = printContainer.getElementsByTagName('table');
    Array.from(tables).forEach((table) => {
      table.classList.add('print-table');
      
      // Add specific class to session cells
      const headers = table.getElementsByTagName('th');
      const cells = table.getElementsByTagName('td');
      
      // Skip first two columns (Grade, Class) and target session columns
      for (let i = 2; i < headers.length; i++) {
        if (headers[i]) headers[i].classList.add('session-cell');
      }
      
      for (let i = 2; i < cells.length; i++) {
        if (cells[i]) cells[i].classList.add('session-cell', 'break-words');
      }
    });

    document.body.appendChild(printContainer);
    window.print();

    setTimeout(() => {
      document.body.removeChild(printContainer);
      this.closePrintModal();
      this.isLoading = false;
    }, 100);
  }, 500);
}

  closePrintModal() {
    document.getElementById('Print_Modal')?.classList.remove('flex');
    document.getElementById('Print_Modal')?.classList.add('hidden');
  }

  openPrintModal() {
    document.getElementById('Print_Modal')?.classList.remove('hidden');
    document.getElementById('Print_Modal')?.classList.add('flex');
    this.PrintType = 'All'
  }

  GetTypes() {
    this.SelectedClassId=0
    this.SelectedTeacherId=0
    if (this.PrintType == "Class") {
      this.classes = []
      this.TimeTableServ.GetAllClassesinThisTimetable(this.TimeTableId, this.DomainName).subscribe((d) => {
        this.classes = d
      })
    } else if (this.PrintType == "Teacher") {
      this.Teachers = []
      this.TimeTableServ.GetAllTeachersinThisTimetable(this.TimeTableId, this.DomainName).subscribe((d) => {
        this.Teachers = d
      })
    }
  }

  Print() {
    this.isLoading = true;
    if (this.PrintType === "Class") {
      this.TimeTableServ.GetByIdForClassAsync(this.TimeTableId, this.SelectedClassId, this.DomainName).subscribe((d) => {
        this.TimeTablePrint = d.data;
        this.TimeTableName = d.timeTableName;
        this.MaxPeriods = d.maxPeriods;
        this.ClassName = d.className
        this.triggerPrint();
      });
    } else if (this.PrintType === "Teacher") {
      this.TimeTableServ.GetByIdForTeacherAsync(this.TimeTableId, this.SelectedTeacherId, this.DomainName).subscribe((d) => {
        this.TimeTablePrint = d.data;
        this.TimeTableName = d.timeTableName;
        this.MaxPeriods = d.maxPeriods;
        this.TeacherName = d.teacherName
        this.triggerPrint();
      });
    } else if (this.PrintType === "All") {
      this.TimeTableServ.GetByID(this.TimeTableId, this.DomainName).subscribe((d) => {
        this.TimeTable2 = d.data;
        this.TimeTableName = d.timeTableName;
        this.MaxPeriods = d.maxPeriods;
        this.triggerPrint();
      });
    }
  }

}
