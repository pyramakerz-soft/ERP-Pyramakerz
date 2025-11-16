import { Component } from '@angular/core';
import { ParentMeeting } from '../../../../Models/SocialWorker/parent-meeting';
import { ParentMeetingService } from '../../../../Services/Employee/SocialWorker/parent-meeting.service';
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
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';

@Component({
  selector: 'app-parent-meeting',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './parent-meeting.component.html',
  styleUrl: './parent-meeting.component.css'
})

@InitLoader()
export class ParentMeetingComponent {
  MeetingsData: ParentMeeting[] = []
  path: string = ""
  DomainName: string = "";
  UserID: number = 0;
  isRtl: boolean = false;
  subscription!: Subscription;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  SubjectID: number = 0;
  SubjectName: string = ""
  bgColors: string[] = ['#F7F7F7', '#D7F7FF', '#FFF1D7', '#E8EBFF'];

  constructor(public account: AccountService, private languageService: LanguageService,public router: Router, public ApiServ: ApiService,
    public activeRoute: ActivatedRoute, private menuService: MenuService, public ParentMeetingServ: ParentMeetingService,
    private loadingService: LoadingService  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });
    this.SubjectID = Number(this.activeRoute.snapshot.paramMap.get('SubjectId'));
    this.GetSubjectLessonLiveData()
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

  GetSubjectLessonLiveData() {
    this.ParentMeetingServ.Get(this.DomainName).subscribe((d) => {
      this.MeetingsData = d
    })
  }

  getRandomColor(index: number): string {
    return this.bgColors[index % this.bgColors.length];
  }

  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
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
