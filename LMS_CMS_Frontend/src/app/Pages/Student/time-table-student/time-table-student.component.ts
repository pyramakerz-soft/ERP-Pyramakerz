import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, Observable, of } from 'rxjs';
// import Swal from 'sweetalert2';
import { PdfPrintComponent } from '../../../Component/pdf-print/pdf-print.component';
import { Day } from '../../../Models/day';
import { Employee } from '../../../Models/Employee/employee';
import { Classroom } from '../../../Models/LMS/classroom';
import { Grade } from '../../../Models/LMS/grade';
import { TimeTableDayGroupDTO } from '../../../Models/LMS/time-table-day-group-dto';
import { TokenData } from '../../../Models/token-data';
import { AccountService } from '../../../Services/account.service';
import { ApiService } from '../../../Services/api.service';
import { BusTypeService } from '../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../Services/Employee/domain.service';
import { TimeTableService } from '../../../Services/Employee/LMS/time-table.service';
import { DeleteEditPermissionService } from '../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../Services/shared/language.service';
import { MenuService } from '../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../Services/shared/real-time-notification-service.service';
import { ReportsService } from '../../../Services/shared/reports.service';
import { LoadingService } from '../../../Services/loading.service';
import { InitLoader } from '../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-time-table-student',
  standalone: true,
  imports: [FormsModule, CommonModule, PdfPrintComponent, TranslateModule],
  templateUrl: './time-table-student.component.html',
  styleUrl: './time-table-student.component.css'
})

@InitLoader()
export class TimeTableStudentComponent {

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
    private loadingService: LoadingService 
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
    this.timetableServ.GetByIdForStudentIdAsync(this.UserID, this.DomainName).subscribe((d) => {
        this.TimeTable = d.data;
        this.TimeTablePrint = d.data;
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
            upgradeToID: 0,
            upgradeToName: '',
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

  async DownloadAsExcel() {
    const data: any[] = [];

    this.TimeTable.forEach(day => {
      const row: any[] = [];
      row.push(day.dayName); // First column: Day

      // Columns for each session
      for (let i = 0; i < this.MaxPeriods; i++) {
        let sessionText = '';

        day.grades.forEach(grade => {
          grade.classrooms.forEach(classroom => {
            const session = classroom.sessions[i];

            if (session) {
              // Add subjects
              if (session.subjects?.length) {
                session.subjects.forEach(sub => {
                  sessionText += `${grade.gradeName} - ${classroom.classroomName} | ${sub.subjectName} (${sub.teacherName})\n`;
                });
              }

              // Add duty teacher
              if (session.dutyTeacherName) {
                sessionText += `${grade.gradeName} - ${classroom.classroomName} | Duty: ${session.dutyTeacherName}\n`;
              }

              // If empty session
              if (!session.subjects?.length && !session.dutyTeacherName) {
                sessionText += `${grade.gradeName} - ${classroom.classroomName} | --\n`;
              }
            } else {
              sessionText += `${grade.gradeName} - ${classroom.classroomName} | --\n`;
            }
          });
        });

        row.push(sessionText.trim()); // Add session column
      }

      data.push(row);
    });

    const table = {
      title: 'Time Table',
      headers: ['Day', ...Array.from({ length: this.MaxPeriods }, (_, i) => `Session ${i + 1}`)],
      data: data,
      styles: {
        header: { bold: true, fillColor: '#F3F4F6' },
        row: { wrapText: true } // so stacked subjects appear nicely
      }
    };

    await this.reportsService.generateExcelReport({
      infoRows: [
        { key: 'Name', value: this.TimeTableName },
      ],
      filename: "TimeTable.xlsx",
      tables: [table]
    });
  }

  async DownloadAsPDF() {
    this.isLoading = true;

    try {
    const tables: any[] = [];

    this.TimeTable.forEach(day => {
    const data: any[] = [];

    day.grades.forEach(grade => {
      grade.classrooms.forEach(classroom => {
        const row: any = {};

        row['Grade'] = grade.gradeName;
        row['Class'] = classroom.classroomName;

        for (let i = 0; i < this.MaxPeriods; i++) {
          const session = classroom.sessions[i];

          let sessionText = '';

          if (session?.subjects?.length) {
            sessionText += session.subjects.map(sub => `${sub.subjectName} (${sub.teacherName})`).join(', ');
          }

          if (session?.dutyTeacherName) {
            sessionText += ` | Duty: ${session.dutyTeacherName}`;
          }

          row[`Session ${i + 1}`] = sessionText || '--';
        }

        data.push(row);
      });
    });

    const headers = ['Grade', 'Class', ...Array.from({ length: this.MaxPeriods }, (_, i) => `Session ${i + 1}`)];

    tables.push({
      title: day.dayName,
      headers: headers,
      data: data
    });
    });

    await this.generatePDFWithSplitTables(tables);
    } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF. Please try again.');
    } finally {
    this.isLoading = false;
    }
  }

  private generatePDFWithSplitTables(tables: any[]) {
    const maxSessionsPerPage = 6; // Show max 6 sessions per page to avoid overflow

    const opt = {
    margin: [10, 10, 10, 10],
    filename: `TimeTable_${this.TimeTableName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
    scale: 2, 
    useCORS: true, 
    letterRendering: true, 
    allowTaint: false,
    logging: false
    },
    jsPDF: { 
    unit: 'mm', 
    format: 'a4', 
    orientation: 'landscape',
    compress: true 
    },
    pagebreak: { mode: 'css', before: '.page-break' }
    };

    // Create container with split tables
    const container = document.createElement('div');
    container.style.cssText = `
    width: 100%;
    background: white;
    padding: 10mm;
    font-family: Arial, sans-serif;
    font-size: 11px;
    `;

    let html = `
    <div style="text-align: center; margin-bottom: 20px;">
    <h2 style="margin: 0 0 5px 0; font-size: 18px;">${this.TimeTableName}</h2>
    <p style="margin: 0; font-size: 12px; color: #666;">Time Table Report</p>
    </div>
    `;

    let currentPageHeight = 60; // Start with header height
    const pageHeight = 210; // A4 height in mm
    const tableHeight = 40; // Estimated height per table section
    const margin = 10;

    tables.forEach((table, tableIndex) => {
    // Split sessions into chunks
    const sessionHeaders = table.headers.slice(2); // Skip Grade and Class
    const totalSessions = sessionHeaders.length;
    const chunks = Math.ceil(totalSessions / maxSessionsPerPage);

    for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
    const startSession = chunkIndex * maxSessionsPerPage;
    const endSession = Math.min(startSession + maxSessionsPerPage, totalSessions);

    const chunkHeaders = ['Grade', 'Class', ...sessionHeaders.slice(startSession, endSession)];

    // Check if we need a page break
    if (currentPageHeight + tableHeight > pageHeight - margin) {
      html += '<div class="page-break" style="page-break-before: always;"></div>';
      currentPageHeight = margin;
    }

    html += `
      <div style="margin-bottom: 10px; page-break-inside: avoid;">
        <h3 style="margin: 5px 0 3px 0; font-size: 12px; background: #ddd; padding: 3px; font-weight: bold;">${table.title}</h3>
        ${chunkIndex > 0 ? `<p style="margin: 2px 0 3px 0; font-size: 9px; color: #666;">(Sessions ${startSession + 1} - ${endSession})</p>` : ''}
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px; font-size: 9px;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              ${chunkHeaders.map(h => `<th style="border: 1px solid #999; padding: 3px; text-align: left; font-weight: bold; font-size: 8px; word-break: break-word;">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${table.data.map((row: any, rowIndex: number) => `
              <tr style="background-color: ${rowIndex % 2 === 0 ? '#fff' : '#f9f9f9'};">
                ${chunkHeaders.map(header => `
                  <td style="border: 1px solid #ccc; padding: 3px; font-size: 8px; word-break: break-word; white-space: normal;">
                    ${row[header] || '--'}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    currentPageHeight += tableHeight;
    }
    });

    container.innerHTML = html;
    document.body.appendChild(container);

    // Generate PDF
    const html2pdf = (window as any).html2pdf;
    html2pdf()
    .set(opt)
    .from(container)
    .save()
    .finally(() => {
    document.body.removeChild(container);
    this.isLoading = false;
    });
  }


  GetDataForPrint(): Observable<any[]> {
  const groupedByDay: any[] = [];

  this.TimeTable.forEach(day => {
  // 🔹 Find the maximum number of sessions in this day (across all classes)
  let maxSessionsForDay = 0;
  day.grades.forEach(grade => {
    grade.classrooms.forEach(classroom => {
      if (classroom.sessions && classroom.sessions.length > maxSessionsForDay) {
        maxSessionsForDay = classroom.sessions.length;
      }
    });
  });

  // 🔹 Build headers dynamically
  const tableHeaders = ['Grade', 'Class', ...Array.from({ length: maxSessionsForDay }, (_, i) => `Session ${i + 1}`)];
  const tableData: any[] = [];

  // 🔹 Build table data
  day.grades.forEach(grade => {
    grade.classrooms.forEach(classroom => {
      const row: any = {};
      row['Grade'] = grade.gradeName;
      row['Class'] = classroom.classroomName;

      for (let i = 0; i < maxSessionsForDay; i++) {
        const session = classroom.sessions[i];
        let sessionText = '';

        if (session?.subjects?.length) {
          sessionText += session.subjects
            .map(sub => `${sub.subjectName} (${sub.teacherName || 'N/A'})`)
            .join(', ');
        }

        if (session?.dutyTeacherName) {
          sessionText += ` | Duty: ${session.dutyTeacherName}`;
        }

        row[`Session ${i + 1}`] = sessionText || '--';
      }

      tableData.push(row);
    });
  });

  groupedByDay.push({
    header: day.dayName,
    data: [],
    tableHeaders,
    tableData
  });
  });

  return of(groupedByDay);
  }

  async triggerPrint() {
  setTimeout(() => {
  let printContents: string | undefined;
  printContents = document.getElementById("Data")?.innerHTML;
  if (!printContents) {
    console.error("Element not found!");
    return;
  }

  // Create a print-specific stylesheet with landscape orientation
  const printStyle = `
    <style>
      @page { 
        size: A4 landscape; 
        margin: 10mm;
      }
      body { 
        margin: 0; 
        padding: 0;
      }
      
      * {
        box-sizing: border-box;
      }

      @media print {
        body > *:not(#print-container) {
          display: none !important;
        }
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
          padding: 10mm !important;
        }
        
        /* Table styles for print */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        th, td {
          border: 1px solid #999;
          padding: 8px;
          text-align: left;
          font-size: 10px;
          word-wrap: break-word;
          white-space: normal;
        }
        
        th {
          background-color: #ddd;
          font-weight: bold;
        }
        
        /* Prevent page breaks within rows */
        tr {
          page-break-inside: avoid;
        }
        
        /* Page break before new day sections */
        .day-section {
          page-break-before: avoid;
          page-break-after: avoid;
        }
        
        /* Reduce font sizes for better fit */
        .rounded-lg {
          font-size: 9px;
          padding: 4px;
          margin: 2px 0;
        }
      }
    </style>
  `;

  // Create a container for printing
  const printContainer = document.createElement('div');
  printContainer.id = 'print-container';
  printContainer.innerHTML = printStyle + printContents;

  // Add to body and print
  document.body.appendChild(printContainer);
  window.print();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(printContainer);
    this.closePrintModal()
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

  Print() {
    this.isLoading = true;
    this.TimeTable2 = this.TimeTable;
    this.TimeTableName = this.TimeTableName;
    this.MaxPeriods = this.MaxPeriods;
    this.triggerPrint();
  }

}
