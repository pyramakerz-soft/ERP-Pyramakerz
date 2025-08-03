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

@Component({
  selector: 'app-remedial-time-table-view',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './remedial-time-table-view.component.html',
  styleUrl: './remedial-time-table-view.component.css'
})
export class RemedialTimeTableViewComponent {
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
  remedialTimeTable: RemedialTimeTable = new RemedialTimeTable();

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

  GetTimeTable() {
    this.RemedialTimeTableServ
      .GetByID(this.TimeTableId, this.DomainName)
      .subscribe((d) => {
        console.log(d)
        this.remedialTimeTable = d.data;
        this.TimeTableName = d.timeTableName;
        this.MaxPeriods = d.maxPeriods;
      });
  }

  moveToTimeTable() {
    this.router.navigateByUrl(`Employee/Remedial TimeTable`);
  }

  days = [
    { key: 'sat', name: 'Sat' },
    { key: 'sun', name: 'Sun' },
    { key: 'mon', name: 'Mon' },
    { key: 'tues', name: 'Tues' },
    { key: 'wed', name: 'Wed' }
  ];

  timetable: { [day: string]: { [period: number]: string[] } } = {
    sat: {
      1: ['CL 1 Math', 'CL 1 Arabic', 'CL 1 English'],
      3: ['CL 1 Math']
    },
    sun: {
      1: ['CL 1 Math', 'CL 1 Arabic'],
      3: ['CL 1 Math', 'CL 1 Arabic']
    },
    mon: {
      1: ['CL 1 Math'],
      2: ['CL 1 Math', 'CL 1 Arabic', 'CL 1 English']
    },
    tues: {
      1: ['CL 1 Math', 'CL 1 Arabic', 'CL 1 English'],
      3: ['CL 1 Math']
    },
    wed: {
      1: ['CL 1 Math', 'CL 1 English']
    }
  };

  getSessions(day: string, period: number): string[] {
    return this.timetable[day]?.[period] || [];
  }

  Save(){

  }
}
