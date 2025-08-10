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
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-time-table-replace',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './time-table-replace.component.html',
  styleUrl: './time-table-replace.component.css',
})
export class TimeTableReplaceComponent {
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

  draggedSubject: any = null;
  draggedSession: any = null;
  SessionReplaced: TimeTableReplace[] = [];
  HoldingSessionsSession: any[] = [];
  AllTeacherInTarget: number[] = [];
  AllTeacherInDraged: number[] = [];
  dragFromcard: boolean = false;
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
    public timetableServ: TimeTableService,
    private languageService: LanguageService,
  ) {}
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

  GetTimeTable() {
    this.timetableServ
      .GetByID(this.TimeTableId, this.DomainName)
      .subscribe((d) => {
        this.TimeTable = d.data;
        this.TimeTableName = d.timeTableName;
        this.MaxPeriods = d.maxPeriods;
      });
  }

  moveToTimeTable() {
    this.router.navigateByUrl(`Employee/Time Table`);
  }

  onDragStart(event: DragEvent, session: any) {
    this.draggedSession = session; // store the reference, not deep copy
    this.draggedSubject = null;
    event.dataTransfer?.setData('text/plain', JSON.stringify(session));
    this.dragFromcard = false;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDropHolding(event: DragEvent) {
    event.preventDefault();
    if (!this.draggedSession) return;
    if (
      !this.HoldingSessionsSession.some(
        (s) => s.sessionId === this.draggedSession.sessionId
      )
    ) {
      this.HoldingSessionsSession.push(
        JSON.parse(JSON.stringify(this.draggedSession))
      ); // deep copy for holding area
    }
    this.removeSessionFromTimeTable(this.draggedSession.sessionId);
    this.draggedSession = null;
    this.dragFromcard = true;
  }

  private areSubjectsTeachersEqual(
    subjects1: any[],
    subjects2: any[]
  ): boolean {
    const teachers1 = [...new Set(subjects1.map((s) => s.teacherId))].sort();
    const teachers2 = [...new Set(subjects2.map((s) => s.teacherId))].sort();

    if (teachers1.length !== teachers2.length) return false;

    return teachers1.every((id, index) => id === teachers2[index]);
  }

  onDrop(event: DragEvent, targetSession: any, day: any, periodIndex: number) {
    event.preventDefault();
    if (!this.draggedSession) return;

    const draggedLocation = this.getSessionLocation(
      this.draggedSession.sessionId
    );
    const targetLocation = this.getSessionLocation(targetSession.sessionId);

    if (!draggedLocation || !targetLocation) {
      console.error(
        'Cannot proceed: draggedLocation or targetLocation is null'
      );
      return;
    }

    const draggedTeacherIds = this.extractTeacherIds(this.draggedSession);
    const targetTeacherIds = this.extractTeacherIds(targetSession);

    const isSameTeacher = this.areSubjectsTeachersEqual(
      targetSession.subjects,
      this.draggedSession.subjects
    );
    const isSameDayAndPeriod =
      (draggedLocation.dayId === targetLocation.dayId &&
        draggedLocation.periodIndex === targetLocation.periodIndex) ||
      isSameTeacher;

    let allTeachersInTargetDayPeriod, allTeachersInDraggedDayPeriod;

    if (!isSameDayAndPeriod) {
      allTeachersInTargetDayPeriod = this.collectTeachersAtPeriod(
        targetLocation.dayId,
        periodIndex,
        [targetSession.sessionId]
      );
      allTeachersInDraggedDayPeriod = this.collectTeachersAtPeriod(
        draggedLocation.dayId,
        periodIndex,
        [this.draggedSession.sessionId]
      );
    } else {
      allTeachersInTargetDayPeriod = this.collectTeachersAtPeriod(
        targetLocation.dayId,
        periodIndex,
        [this.draggedSession.sessionId, targetSession.sessionId]
      );
      allTeachersInDraggedDayPeriod = this.collectTeachersAtPeriod(
        draggedLocation.dayId,
        periodIndex,
        [this.draggedSession.sessionId, targetSession.sessionId]
      );
    }

    if (this.hasIntersection(targetTeacherIds, allTeachersInDraggedDayPeriod)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Target session teachers conflict with other sessions in the dragged session day/period',
        confirmButtonColor: '#089B41',
      });
      return;
    }

    if (this.hasIntersection(draggedTeacherIds, allTeachersInTargetDayPeriod)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: ' Dragged session teachers conflict with other sessions in the target session day/period',
        confirmButtonColor: '#089B41',
      });
      return;
    }
    const draggedSubjectIds = this.draggedSession.subjects.map(
      (s: any) => s.subjectId
    );
    const targetClassroomSubjects = this.getClassroomSubjectIds(
      targetLocation.classroomId
    );

    const targetSubjectIds = targetSession.subjects.map(
      (s: any) => s.subjectId
    );
    const dragedClassroomSubjects = this.getClassroomSubjectIds(
      draggedLocation.classroomId
    );
    // Check if all dragged subjects exist in target classroom
    const isSubjectValidForTargetClass =
      draggedSubjectIds.every((id: any) =>
        targetClassroomSubjects.includes(id)
      ) &&
      targetSubjectIds.every((id: any) => dragedClassroomSubjects.includes(id));

    if (!isSubjectValidForTargetClass) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'One or more subjects in the dragged session do not exist in the target classroom.',
        confirmButtonColor: '#089B41',
      });
      return;
    }
    this.SessionReplaced.push(
      new TimeTableReplace(
        this.draggedSession.sessionId,
        targetSession.sessionId
      )
    );
    const targetSessionCopy = JSON.parse(JSON.stringify(targetSession));
    this.swapSubjects(targetSession, this.draggedSession);
    if (this.dragFromcard == true) {
      const indexInHolding = this.HoldingSessionsSession.findIndex(
        (s) => s.sessionId === targetSession.sessionId
      );
      if (indexInHolding !== -1) {
        this.HoldingSessionsSession = this.HoldingSessionsSession.filter(
          (s) => s.sessionId !== targetSession.sessionId
        );
      }
    } else {
      this.HoldingSessionsSession = this.HoldingSessionsSession.filter(
        (s) => s.sessionId !== this.draggedSession.sessionId
      );
    }

    this.draggedSession = null;
  }

  private getClassroomSubjectIds(classroomId: number): number[] {
    const subjectIds = new Set<number>();
    this.TimeTable.forEach((day) => {
      day.grades.forEach((grade) => {
        grade.classrooms.forEach((classroom) => {
          if (classroom.classroomId === classroomId) {
            classroom.sessions.forEach((session) => {
              session.subjects.forEach((subject) => {
                if (subject.subjectId) {
                  subjectIds.add(subject.subjectId);
                }
              });
            });
          }
        });
      });
    });
    return Array.from(subjectIds);
  }

  private extractTeacherIds(session: any): number[] {
    return session.subjects
      .filter((s: any) => s.teacherId && s.teacherId !== 0)
      .map((s: any) => s.teacherId);
  }

  private removeSessionFromTimeTable(sessionId: number): void {
    for (const day of this.TimeTable) {
      for (const grade of day.grades) {
        for (const classroom of grade.classrooms) {
          for (
            let periodIndex = 0;
            periodIndex < classroom.sessions.length;
            periodIndex++
          ) {
            if (classroom.sessions[periodIndex].sessionId === sessionId) {
              // Clear subjects to indicate session is empty
              classroom.sessions[periodIndex].subjects = [];
              return; // Session found and cleared
            }
          }
        }
      }
    }
  }

  private collectTeachersAtPeriod(
    dayId: number,
    periodIndex: number,
    excludeSessionIds: number[]
  ): number[] {
    const teacherIds: number[] = [];
    this.TimeTable.filter((day) => day.dayId === dayId).forEach((day) => {
      day.grades.forEach((grade) => {
        grade.classrooms.forEach((classroom) => {
          const session = classroom.sessions[periodIndex];
          if (session && !excludeSessionIds.includes(session.sessionId)) {
            session.subjects.forEach((subject) => {
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
    return arr1.some((id) => arr2.includes(id));
  }

  private swapSubjects(targetSession: any, draggedSession: any): void {
    const tempSubjects = JSON.parse(JSON.stringify(targetSession.subjects));
    targetSession.subjects = JSON.parse(
      JSON.stringify(draggedSession.subjects)
    );
    draggedSession.subjects = tempSubjects;
  }

  onDragStartHolding(event: DragEvent, session: any) {
    this.draggedSession = session; // already in HoldingSessionsSession, so no deep copy needed
    this.draggedSubject = null;
    event.dataTransfer?.setData('text/plain', JSON.stringify(session));
  }

  getSessionLocation(sessionId: number) {
    for (const day of this.TimeTable) {
      for (const grade of day.grades) {
        for (const classroom of grade.classrooms) {
          for (
            let periodIndex = 0;
            periodIndex < classroom.sessions.length;
            periodIndex++
          ) {
            const session = classroom.sessions[periodIndex];
            if (session.sessionId === sessionId) {
              return {
                dayId: day.dayId,
                dayName: day.dayName,
                gradeId: grade.gradeId,
                gradeName: grade.gradeName,
                classroomId: classroom.classroomId,
                classroomName: classroom.classroomName,
                periodIndex: periodIndex,
              };
            }
          }
        }
      }
    }
    return null; // not found
  }

  private deduplicateSessionReplacements(): void {
    const uniquePairs = new Set<string>();
    const deduplicated: TimeTableReplace[] = [];

    this.SessionReplaced.forEach((item) => {
      // Create a normalized key, smaller ID first
      const key =
        item.fisrtSessionId < item.secondSessionId
          ? `${item.fisrtSessionId}-${item.secondSessionId}`
          : `${item.secondSessionId}-${item.fisrtSessionId}`;

      if (!uniquePairs.has(key)) {
        uniquePairs.add(key);
        deduplicated.push(item);
      }
    });

    this.SessionReplaced = deduplicated;
  }

  Save() {
    this.isLoading = true;
    this.deduplicateSessionReplacements();
    this.timetableServ.Edit(this.SessionReplaced, this.DomainName).subscribe(
      (d) => {
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Replaced Successfully',
          confirmButtonColor: '#089B41',
        });
        this.isLoading = false;
        this.router.navigateByUrl(
          `Employee/Time Table/` + this.TimeTableId
        );
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Try Again Later!',
          confirmButtonText: 'Okay',
          customClass: { confirmButton: 'secondaryBg' },
        });
        this.isLoading = false;
      }
    );
  }
}
