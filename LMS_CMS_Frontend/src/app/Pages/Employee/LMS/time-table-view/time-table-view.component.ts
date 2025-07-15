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

@Component({
  selector: 'app-time-table-view',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './time-table-view.component.html',
  styleUrl: './time-table-view.component.css'
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
  
  TimeTableId: number = 0;
  MaxPeriods: number = 0;
  TimeTableName: string = '';
  TimeTable: TimeTableDayGroupDTO[] = []

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
      console.log(d)
    })
  }

  moveToTimeTable() {
    this.router.navigateByUrl(`Employee/Time Table`)
  }
}
