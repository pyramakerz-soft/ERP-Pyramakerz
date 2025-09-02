import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import { RemedialTimeTableService } from '../../../../Services/Employee/LMS/remedial-time-table.service';
import { RemedialTimeTable } from '../../../../Models/LMS/remedial-time-table';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { Grade } from '../../../../Models/LMS/grade';
import { RemedialClassroom } from '../../../../Models/LMS/remedial-classroom';
import { RemedialClassroomService } from '../../../../Services/Employee/LMS/remedial-classroom.service';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { RemedialTimeTableDay } from '../../../../Models/LMS/remedial-time-table-day';
import { RemedialTimeTableClasses } from '../../../../Models/LMS/remedial-time-table-classes';
import Swal from 'sweetalert2';
import { RemedialTimeTableClassesService } from '../../../../Services/Employee/LMS/remedial-time-table-classes.service';
import { ReportsService } from '../../../../Services/shared/reports.service';
import { PdfPrintComponent } from '../../../../Component/pdf-print/pdf-print.component';
import { Employee } from '../../../../Models/Employee/employee';
import { Day } from '../../../../Models/day';
import { TimeTableDayGroupDTO } from '../../../../Models/LMS/time-table-day-group-dto';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { firstValueFrom, Subscription } from 'rxjs';
@Component({
  selector: 'app-remedial-time-table-view',
  standalone: true,
  imports: [FormsModule, CommonModule, DragDropModule, PdfPrintComponent, TranslateModule],
  templateUrl: './remedial-time-table-view.component.html',
  styleUrl: './remedial-time-table-view.component.css'
})
export class RemedialTimeTableViewComponent {
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
  RTimeTableId: number = 0;
  SelectedGradeId: number = 0;
  remedialTimeTable: RemedialTimeTable = new RemedialTimeTable();
  remedialTimeTableForPrint: RemedialTimeTable = new RemedialTimeTable();
  Grades: Grade[] = []
  remedialClasses: RemedialClassroom[] = []
  OriginremedialClassesForCard: RemedialClassroom[] = []
  NewremedialTimeTableClasses: RemedialTimeTableClasses[] = []
  DeletedRemedialTimeTableClasses: number[] = []
  connectedDropLists: string[] = [];
  isLoading = false;
  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  showPDF = false;
  tableHeadersForPDF: any[] = [];
  tableDataForPDF: any[] = [];
  types = ['All', 'Teacher', 'Grade', 'Day'];
  PrintType = 'All'; // default value

  SelectedTeacherForPrintId: number = 0;
  SelectedGradeForPrintId: number = 0;
  SelectedDayForPrintId: number = 0;
  Teachers: Employee[] = []
  Grade: Grade[] = []
  day: Day[] = []

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public BusTypeServ: BusTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public GradeServ: GradeService,
    private cdr: ChangeDetectorRef,
    public reportsService: ReportsService,
    public RemedialClassroomServ: RemedialClassroomService,
    public RemedialTimeTableServ: RemedialTimeTableService,
    public RemedialTimeTableClassesServ: RemedialTimeTableClassesService,    
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });
    this.RTimeTableId = Number(this.activeRoute.snapshot.paramMap.get('id'));
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

  GetAllGradeBySchool() {
    this.GradeServ.GetBySchoolId(this.remedialTimeTable.schoolID, this.DomainName).subscribe((d) => {
      this.Grades = d
    })
  }

  getAllClassByGradeId() {
    this.RemedialClassroomServ.GetByGradeId(this.SelectedGradeId, this.DomainName).subscribe((classes) => {
      this.OriginremedialClassesForCard = classes;
      this.remedialClasses = classes.map(cl => ({ ...cl }));
      const classUsageCount: { [id: number]: number } = {};
      this.remedialTimeTable.groupDays.forEach(day => {
        day.periods.forEach(period => {
          period.remedialTimeTableClasses.forEach(remedialClass => {
            const id = remedialClass.remedialClassroomID;
            classUsageCount[id] = (classUsageCount[id] || 0) + 1;
          });
        });
      });
      this.remedialClasses.forEach(cl => {
        const used = classUsageCount[cl.id] || 0;
        cl.numberOfSession -= used;
        if (cl.numberOfSession < 0) {
          cl.numberOfSession = 0
        }
      });
    });
  }

  GetTimeTable() {
    this.RemedialTimeTableServ.GetByID(this.RTimeTableId, this.DomainName).subscribe((d) => {
      this.remedialTimeTable = d;
      console.log(this.remedialTimeTable)

      this.day = this.remedialTimeTable.groupDays.map((d: any) => ({
        id: d.dayId,
        name: d.dayName
      }));

      this.GetAllGradeBySchool()
      this.connectedDropLists = [];
      this.remedialTimeTable.groupDays.forEach(day => {
        day.periods.forEach(period => {
          this.connectedDropLists.push(`dropList-${day.dayId}-${period.periodIndex}`);
        });
      });
    });
  }

  onDrop(event: CdkDragDrop<any[]>, period: RemedialTimeTableDay) {
    if (event.previousContainer === event.container) return;
    const draggedItem = event.previousContainer.data[event.previousIndex];

    // ✅ Ensure the array is initialized
    if (!period.remedialTimeTableClasses) {
      period.remedialTimeTableClasses = [];
    }
    const IsThisTeacherBeasy = period.remedialTimeTableClasses.find(s => s.teacherID == draggedItem.teacherID)
    if (IsThisTeacherBeasy != null) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: ' Dragged session teachers conflict with other sessions in the target session day/period',
        confirmButtonColor: '#089B41',
      });
      return;
    }
    const newClass = new RemedialTimeTableClasses();
    newClass.remedialClassroomID = draggedItem.id;
    newClass.remedialClassroomName = draggedItem.name;
    newClass.teacherID = draggedItem.teacherID;
    newClass.teacherEnName = draggedItem.teacherEnName;
    newClass.teacherArName = draggedItem.teacherArName;
    newClass.remedialTimeTableDayId = period.id;
    period.remedialTimeTableClasses.push(newClass);

    if (!this.NewremedialTimeTableClasses) {  // for new Remedial Time Table Classes
      this.NewremedialTimeTableClasses = [];
    }
    const remedial = this.NewremedialTimeTableClasses.find(s => s.remedialTimeTableDayId == period.id)
    if (remedial) {
      remedial.remedialClassroomIds.push(draggedItem.id)
    }
    else {
      const newRemedial = new RemedialTimeTableClasses()
      newRemedial.remedialTimeTableDayId = period.id;
      newRemedial.remedialClassroomIds.push(draggedItem.id);
      this.NewremedialTimeTableClasses.push(newRemedial)
    }

    const droppedClass = this.remedialClasses.find(s => s.id === draggedItem.id);
    if (droppedClass && droppedClass.numberOfSession > 0) {
      droppedClass.numberOfSession--;
    } else if (droppedClass && droppedClass.numberOfSession == 0) {
      this.remedialClasses = this.remedialClasses.filter(s => s.id != draggedItem.id);
    }
  }

  moveToTimeTable() {
    this.router.navigateByUrl(`Employee/Remedial TimeTable`);
  }

  deleteRemedialClassroom(classItem: RemedialTimeTableClasses, period: RemedialTimeTableDay) {
    if (classItem.id == 0) {
      period.remedialTimeTableClasses = period.remedialTimeTableClasses.filter(a => a.remedialClassroomID != classItem.remedialClassroomID)
      const newRemedial = this.NewremedialTimeTableClasses.find(r => r.remedialTimeTableDayId == period.id)
      if (newRemedial?.remedialClassroomIds) {
        newRemedial.remedialClassroomIds = newRemedial.remedialClassroomIds.filter(a => a != classItem.remedialClassroomID);
      }
      this.getAllClassByGradeId()
    } else {
      if (!this.DeletedRemedialTimeTableClasses) {  // for Existed Remedial Classes
        this.DeletedRemedialTimeTableClasses = [];
      }
      this.DeletedRemedialTimeTableClasses.push(classItem.id)
      period.remedialTimeTableClasses = period.remedialTimeTableClasses.filter(a => a.remedialClassroomID != classItem.remedialClassroomID)
      this.getAllClassByGradeId()
    }
  }

  Save() {
    if (this.DeletedRemedialTimeTableClasses.length > 0) {
      this.RemedialTimeTableClassesServ.Delete(this.DeletedRemedialTimeTableClasses, this.DomainName).subscribe((d) => {
      })
    }
    this.RemedialTimeTableServ.Edit(this.NewremedialTimeTableClasses, this.DomainName).subscribe((d) => {
      Swal.fire({
        icon: 'success',
        title: 'Done',
        text: 'Updated Successfully',
        confirmButtonColor: '#089B41',
      });
      this.GetTimeTable();
      this.isLoading = false
    }, err => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred',
        confirmButtonColor: '#089B41',
      });
      this.isLoading = false
    })
    this.NewremedialTimeTableClasses = []
    this.DeletedRemedialTimeTableClasses = []
  }

 Print() {
  this.remedialTimeTableForPrint = JSON.parse(JSON.stringify(this.remedialTimeTable)); // ✅ deep clone

  if (this.PrintType === "Day") {
    this.remedialTimeTableForPrint.groupDays = this.remedialTimeTableForPrint.groupDays
      .filter(d => d.dayId == this.SelectedDayForPrintId);
    this.triggerPrint();

  } else if (this.PrintType === "Teacher") {
    this.remedialTimeTableForPrint.groupDays = this.remedialTimeTableForPrint.groupDays.map(day => ({
      ...day,
      periods: day.periods.map(period => ({
        ...period,
        remedialTimeTableClasses: period.remedialTimeTableClasses
          .filter(cls => cls.teacherID == this.SelectedTeacherForPrintId)
      }))
    })).filter(day =>
      day.periods.some(period =>
        period.remedialTimeTableClasses.length > 0
      )
    );
    this.triggerPrint();

  } else if (this.PrintType === "Grade") {
    this.remedialTimeTableForPrint.groupDays = this.remedialTimeTableForPrint.groupDays.map(day => ({
      ...day,
      periods: day.periods.map(period => ({
        ...period,
        remedialTimeTableClasses: period.remedialTimeTableClasses
          .filter(cls => cls.gradeID == this.SelectedGradeForPrintId)
      }))
    })).filter(day =>
      day.periods.some(period =>
        period.remedialTimeTableClasses.length > 0
      )
    );
    this.triggerPrint();

  } else if (this.PrintType === "All") {
    this.remedialTimeTableForPrint = JSON.parse(JSON.stringify(this.remedialTimeTable));
    this.triggerPrint();
  }
}


  async triggerPrint() {
    setTimeout(() => {
      const printContents = document.getElementById("Print")?.innerHTML;
      if (!printContents) {
        console.error("Element not found!");
        return;
      }
      // Create a print-specific stylesheet
      const printStyle = `
        <style>
          @page { size: auto; margin: 0mm; }
          body { 
            margin: 0; 
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
      }, 100);
    }, 500);
  }

  generateTimeTablePDFData() {
    const headers = ['Day'];
    for (let i = 0; i < this.remedialTimeTable.maximumPeriodCountRemedials; i++) {
      headers.push(`Session ${i + 1}`);
    }

    const data = this.remedialTimeTable.groupDays.map((day: any) => {
      const row: any = { Day: day.dayName };
      for (let i = 0; i < this.remedialTimeTable.maximumPeriodCountRemedials; i++) {
        const period = day.periods.find((p: any) => p.periodIndex === i);
        const classes = period?.remedialTimeTableClasses || [];

        // Join multiple classes in same period
        row[`Session ${i + 1}`] = classes.map((c: any) =>
          `${c.remedialClassroomName} / ${c.teacherEnName}`
        ).join(', ');
      }
      return row;
    });

    this.tableHeadersForPDF = headers;
    this.tableDataForPDF = data;
  }

  openPrintModal() {
    document.getElementById('Print_Modal')?.classList.remove('hidden');
    document.getElementById('Print_Modal')?.classList.add('flex');
    this.PrintType = 'All'
    this.SelectedDayForPrintId=0
    this.SelectedGradeForPrintId=0
    this.SelectedTeacherForPrintId=0
    this.remedialTimeTableForPrint= new RemedialTimeTable()
  }

  closePrintModal() {
    document.getElementById('Print_Modal')?.classList.remove('flex');
    document.getElementById('Print_Modal')?.classList.add('hidden');
  }

  DownloadAsPDF() {
    this.generateTimeTablePDFData();
    this.showPDF = true;
    setTimeout(() => {
      if (this.pdfComponentRef) {
        this.pdfComponentRef.downloadPDF();
      } else {
        console.error('PDF Component not found');
      }
    }, 500); // Wait for *ngIf to render
  }

  GetTypes() {
    if (this.PrintType == "Teacher") {
      this.RemedialTimeTableServ.GetAllTeachersinThisTimetable(this.RTimeTableId, this.DomainName).subscribe((d) => {
        this.Teachers = d
      })
    }
  }

  async DownloadAsExcel() {
    if (!this.remedialTimeTable?.groupDays || this.remedialTimeTable.groupDays.length === 0) {
      alert("No timetable data to export.");
      return;
    }

    const maxSessions = this.remedialTimeTable.maximumPeriodCountRemedials;

    const headerKeyMap = [
      { header: 'Day', key: 'day' },
      ...Array.from({ length: maxSessions }, (_, i) => ({
        header: `Session ${i + 1}`,
        key: `session${i + 1}`
      }))
    ];

    const dataRows = this.remedialTimeTable.groupDays.map(day => {
      const row: any = { day: day.dayName };

      for (let i = 0; i < maxSessions; i++) {
        const period = day.periods?.[i];

        if (period?.remedialTimeTableClasses?.length > 0) {
          row[`session${i + 1}`] = period.remedialTimeTableClasses
            .map(cls => `${cls.remedialClassroomName} / ${cls.teacherEnName}`)
            .join(', ');
        } else {
          row[`session${i + 1}`] = '';
        }
      }

      return row;
    });

    console.log("Header Map:", headerKeyMap);
    console.log("Data Rows:", dataRows); // <- See the real output

    const dataMatrix = dataRows.map(rowObj =>
      headerKeyMap.map(header => rowObj[header.key] ?? '')
    );

    await this.reportsService.generateExcelReport({
      infoRows: [
        { key: 'Name', value: this.remedialTimeTable?.name ?? '' },
        { key: 'Created At', value: this.remedialTimeTable?.insertedAt ?? '' },
      ],
      filename: `${this.remedialTimeTable?.name ?? 'RemedialTimeTable'}.xlsx`,
      tables: [
        {
          title: this.remedialTimeTable?.name ?? 'Remedial Time Table',
          headers: headerKeyMap.map(h => h.header),
          data: dataMatrix   // ✅ array of arrays
        }
      ]
    });
  }
}
