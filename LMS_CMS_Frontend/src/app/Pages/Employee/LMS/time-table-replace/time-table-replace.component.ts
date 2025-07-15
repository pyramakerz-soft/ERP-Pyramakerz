import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TimeTableDayGroupDTO } from '../../../../Models/LMS/time-table-day-group-dto';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { TimeTableService } from '../../../../Services/Employee/LMS/time-table.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { TimeTableReplace } from '../../../../Models/LMS/time-table-replace';

@Component({
  selector: 'app-time-table-replace',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './time-table-replace.component.html',
  styleUrl: './time-table-replace.component.css'
})
export class TimeTableReplaceComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';

  TimeTableId: number = 0;
  MaxPeriods: number = 0;
  TimeTableName: string = '';
  TimeTable: TimeTableDayGroupDTO[] = []

  draggedSubject: any = null;
  draggedSession: any = null;
  SessionReplaced: TimeTableReplace[] = [];
  HoldingSessionsSession: any[] = [];
  AllTeacherInTarget: number[] = [];
  AllTeacherInDraged: number[] = [];

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public BusTypeServ: BusTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public timetableServ: TimeTableService
  ) { }
  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });
    this.TimeTableId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.GetTimeTable()
  }

  GetTimeTable() {
    this.timetableServ.GetByID(this.TimeTableId, this.DomainName).subscribe((d) => {
      this.TimeTable = d.data
      this.TimeTableName = d.timeTableName
      this.MaxPeriods = d.maxPeriods
    })
  }

  moveToTimeTable() {
    this.router.navigateByUrl(`Employee/Time Table`)
  }

  onDragStart(event: DragEvent, session: any) {
    this.draggedSession = session;
    this.draggedSubject = null; // Not needed in session replace
    event.dataTransfer?.setData('text/plain', JSON.stringify(session));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDropHolding(event: DragEvent) {
    event.preventDefault();
    if (!this.draggedSession) return;
    if (!this.HoldingSessionsSession.some(s => s.id === this.draggedSession.id)) {
      this.HoldingSessionsSession.push(this.draggedSession);
    }
    this.draggedSession = null;
  }

  onDrop(event: DragEvent, targetSession: any, day: any, periodIndex: number) {
    event.preventDefault();
    if (!this.draggedSession) return;

    const draggedLocation = this.getSessionLocation(this.draggedSession.sessionId);
    const targetLocation = this.getSessionLocation(targetSession.sessionId);

    const draggedTeacherIds = this.extractTeacherIds(this.draggedSession);
    const targetTeacherIds = this.extractTeacherIds(targetSession);

    if (!draggedLocation || !targetLocation) {
      console.error('Cannot proceed: draggedLocation or targetLocation is null');
      return;
    }

    const isSameDayAndPeriod = draggedLocation.dayId === targetLocation.dayId && draggedLocation.periodIndex === targetLocation.periodIndex;
    var allTeachersInTargetDayPeriod
    var allTeachersInDraggedDayPeriod

    if (!isSameDayAndPeriod) {
      console.log(16)
      allTeachersInTargetDayPeriod = this.collectTeachersAtPeriod(
        targetLocation.dayId, periodIndex, [targetSession.sessionId]
      );
      
      allTeachersInDraggedDayPeriod = this.collectTeachersAtPeriod(
        draggedLocation.dayId, periodIndex, [this.draggedSession.sessionId]
      );
    } else {
      console.log(17)

      allTeachersInTargetDayPeriod = this.collectTeachersAtPeriod(
        targetLocation.dayId, periodIndex, [this.draggedSession.sessionId, targetSession.sessionId]
      );

      allTeachersInDraggedDayPeriod = this.collectTeachersAtPeriod(
        draggedLocation.dayId, periodIndex, [this.draggedSession.sessionId, targetSession.sessionId]
      );
    }

    console.log(1, targetTeacherIds, allTeachersInDraggedDayPeriod)
    if (this.hasIntersection(targetTeacherIds, allTeachersInDraggedDayPeriod)) {
      alert('Cannot drop: Target session teachers conflict with other sessions in the dragged session day/period.');
      return;
    }
    console.log(2, draggedTeacherIds, allTeachersInTargetDayPeriod)

    if (this.hasIntersection(draggedTeacherIds, allTeachersInTargetDayPeriod)) {
      alert('Cannot drop: Dragged session teachers conflict with other sessions in the target session day/period.');
      return;
    }

    console.log(this.draggedSession.id, targetSession.id)
    this.swapSubjects(targetSession, this.draggedSession);
    this.SessionReplaced.push(new TimeTableReplace(this.draggedSession.id, targetSession.id));
    this.draggedSession = null;
  }

  private extractTeacherIds(session: any): number[] {
    return session.subjects
      .filter((s: any) => s.teacherId && s.teacherId !== 0)
      .map((s: any) => s.teacherId);
  }

  private collectTeachersAtPeriod(dayId: number, periodIndex: number, excludeSessionIds: number[]): number[] {
    const teacherIds: number[] = [];
    this.TimeTable
      .filter(day => day.dayId === dayId)
      .forEach(day => {
        day.grades.forEach(grade => {
          grade.classrooms.forEach(classroom => {
            const session = classroom.sessions[periodIndex];
            if (session && !excludeSessionIds.includes(session.sessionId)) {
              session.subjects.forEach(subject => {
                if (subject.teacherId && subject.teacherId !== 0) {
                  teacherIds.push(subject.teacherId);
                }
              });
            }
          });
        });
      });
    return teacherIds;
  }

  private hasIntersection(arr1: number[], arr2: number[]): boolean {
    return arr1.some(id => arr2.includes(id));
  }

  private swapSubjects(targetSession: any, draggedSession: any): void {
    const tempSubjects = targetSession.subjects;
    targetSession.subjects = draggedSession.subjects;
    draggedSession.subjects = tempSubjects;
  }


  onDragStartHolding(event: DragEvent, session: any) {
    this.draggedSession = session;
    this.draggedSubject = null; // Clear any subject dragging
    event.dataTransfer?.setData('text/plain', JSON.stringify(session));
  }

  getSessionLocation(sessionId: number) {
    for (const day of this.TimeTable) {
      for (const grade of day.grades) {
        for (const classroom of grade.classrooms) {
          for (let periodIndex = 0; periodIndex < classroom.sessions.length; periodIndex++) {
            const session = classroom.sessions[periodIndex];
            if (session.sessionId === sessionId) {
              return {
                dayId: day.dayId,
                dayName: day.dayName,
                gradeId: grade.gradeId,
                gradeName: grade.gradeName,
                classroomId: classroom.classroomId,
                classroomName: classroom.classroomName,
                periodIndex: periodIndex
              };
            }
          }
        }
      }
    }
    return null; // not found
  }

}
