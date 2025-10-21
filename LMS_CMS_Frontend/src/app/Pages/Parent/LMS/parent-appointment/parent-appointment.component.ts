import { Component } from '@angular/core';
import { AppointmentParent } from '../../../../Models/SocialWorker/appointment-parent';
import { AppointmentService } from '../../../../Services/Employee/SocialWorker/appointment.service';
import { AppointmentParentService } from '../../../../Services/Employee/SocialWorker/appointment-parent.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';

@Component({
  selector: 'app-parent-appointment',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './parent-appointment.component.html',
  styleUrl: './parent-appointment.component.css'
})
export class ParentAppointmentComponent {
  path: string = ""
  DomainName: string = "";
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  SubjectID: number = 0;
  isRtl: boolean = false;
  subscription!: Subscription;
  bgColors: string[] = ['#F7F7F7', '#D7F7FF', '#FFF1D7', '#E8EBFF'];
  mode: string = "solved";
  appointments: AppointmentParent[] = []

  constructor(public account: AccountService, private languageService: LanguageService, public router: Router, public ApiServ: ApiService, public AppointmentParentServ: AppointmentParentService,
    public activeRoute: ActivatedRoute, private menuService: MenuService,
    private realTimeService: RealTimeNotificationServiceService,) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });
    this.SubjectID = Number(this.activeRoute.snapshot.paramMap.get('SubjectId'));
    this.GetAppointments()
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

  GetAppointments() {
    this.AppointmentParentServ.GetByParentId(this.UserID,this.DomainName).subscribe((d) => {
      this.appointments = d
    })
  }

  EditAppointments(row : AppointmentParent) {
    console.log(row)
    this.AppointmentParentServ.Edit(row,this.DomainName).subscribe((d) => {
    this.GetAppointments()
    })
  }

  Accept( row: AppointmentParent) {
    row.appointmentStatusID = 3
    this.EditAppointments(row)
  }

  Deny(row : AppointmentParent) {
    row.appointmentStatusID = 2
    this.EditAppointments(row)
  }

  isPastdueDate(dueDate: string): boolean {
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    console.log(12345,today, due)
    return today <= due;
  }
}
