import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

@Component({
  selector: 'app-remedial-time-table-view',
  standalone: true,
  imports: [FormsModule, CommonModule, DragDropModule],
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

  TimeTableId: number = 0;
  SelectedGradeId: number = 0;
  remedialTimeTable: RemedialTimeTable = new RemedialTimeTable();
  Grades: Grade[] = []
  remedialClasses: RemedialClassroom[] = []
  OriginremedialClassesForCard: RemedialClassroom[] = []
  remedialTimeTableClasses: RemedialTimeTableClasses[] = []
  connectedDropLists: string[] = [];
  isLoading = false;

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
    public RemedialClassroomServ: RemedialClassroomService,
    public RemedialTimeTableServ: RemedialTimeTableService
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
  }

  GetAllGradeBySchool() {
    this.GradeServ.GetBySchoolId(this.remedialTimeTable.schoolID, this.DomainName).subscribe((d) => {
      this.Grades = d
    })
  }

  getAllClassByGradeId() {
    this.RemedialClassroomServ.GetByGradeId(this.SelectedGradeId, this.DomainName).subscribe((classes) => {
      console.log(classes);
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
      });
    });
  }

  GetTimeTable() {
    this.RemedialTimeTableServ.GetByID(this.TimeTableId, this.DomainName).subscribe((d) => {
      console.log(d)
      this.remedialTimeTable = d;
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

    console.log('Period:', period);
    console.log('Dragged Item:', draggedItem);

    // ✅ Ensure the array is initialized
    if (!period.remedialTimeTableClasses) {
      period.remedialTimeTableClasses = [];
    }
    if (!this.remedialTimeTableClasses) {
      this.remedialTimeTableClasses = [];
    }
    const newClass = new RemedialTimeTableClasses();
    newClass.remedialClassroomID = draggedItem.id;
    newClass.remedialClassroomName = draggedItem.name;
    newClass.remedialTimeTableDayId = period.id;
    period.remedialTimeTableClasses.push(newClass);


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

  Save() {

  }
}
