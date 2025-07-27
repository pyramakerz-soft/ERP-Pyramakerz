import { Component } from '@angular/core';
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

@Component({
  selector: 'app-time-table-view',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './time-table-view.component.html',
  styleUrl: './time-table-view.component.css',
})
export class TimeTableViewComponent {
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
    this.GetTimeTable();
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
        this.OriginTimeTable = d.data;
        this.TimeTableName = d.timeTableName;
        this.MaxPeriods = d.maxPeriods;
        this.ExtractDaysAndGrades();
        console.log(d);
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
    console.log('origin TimeTable:', this.OriginTimeTable);
    console.log('selected day:', this.SelectedDay);
    console.log('selected grade:', this.SelectedGrade);

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

    console.log('Filtered TimeTable:', this.TimeTable);
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
    this.timetableServ.GetDutyByDate(this.TimeTableId,this.date, this.DomainName).subscribe((d) => {
      this.TimeTable = d.data;
      this.OriginTimeTable = d.data;
      this.TimeTableName = d.timeTableName;
      this.MaxPeriods = d.maxPeriods;
      this.ExtractDaysAndGrades();
      console.log(d);
    });
  }
}
