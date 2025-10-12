import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { Subject } from '../../../../Models/LMS/subject';
import { SemesterWorkingWeekService } from '../../../../Services/Employee/LMS/semester-working-week.service';
import { SemesterWorkingWeek } from '../../../../Models/LMS/semester-working-week';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-subject-weeks',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './subject-weeks.component.html',
  styleUrl: './subject-weeks.component.css'
})
export class SubjectWeeksComponent {
  WorkingWeekData: SemesterWorkingWeek[] = []
  path: string = ""
  DomainName: string = "";
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  SubjectID: number = 0;
  isRtl: boolean = false;
  subscription!: Subscription;
  SubjectName: string = ""
  bgColors: string[] = ['#F7F7F7', '#D7F7FF', '#FFF1D7', '#E8EBFF'];

  constructor(public account: AccountService,private realTimeService: RealTimeNotificationServiceService, private languageService: LanguageService, public router: Router, public ApiServ: ApiService,
    public activeRoute: ActivatedRoute, private menuService: MenuService, public SemesterWorkingWeekServ: SemesterWorkingWeekService) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });
    this.SubjectID = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.getSemesterWorkingWeekData()

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

  getRandomColor(index: number): string {
    return this.bgColors[index % this.bgColors.length];
  }

  getSemesterWorkingWeekData() {
    this.SemesterWorkingWeekServ.GetBySubjectID(this.SubjectID, this.UserID, this.DomainName).subscribe(
      (data) => {
        this.WorkingWeekData = data.weeks;
        this.SubjectName = data.subjectName;
      },error=>{
        console.log(error)
        this.SubjectName = error.error.subjectName;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.error.error,
          confirmButtonText: 'Okay',
          customClass: { confirmButton: 'secondaryBg' },
        });
      }
    )
  }

  moveToLessons(weekid: number) {
    this.router.navigateByUrl(`Student/SubjectWeeksLesson/${this.SubjectID}/${weekid}`)
  }

  moveToSubjectResources() {
    this.router.navigateByUrl(`Student/SubjectResources/${this.SubjectID}`)
  }

  moveToSubjectLive() {
    this.router.navigateByUrl(`Student/SubjectLive/${this.SubjectID}`)
  }

  moveToSubjectAssignments() {
    this.router.navigateByUrl(`Student/SubjectAssignment/${this.SubjectID}`)
  }

  moveToBack() {
    this.router.navigateByUrl(`Student/Subject`)
  }
}
