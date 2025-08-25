import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SubjectResource } from '../../../../Models/LMS/subject-resource';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { SubjectResourceService } from '../../../../Services/Employee/LMS/subject-resource.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { LessonLiveService } from '../../../../Services/Employee/LMS/lesson-live.service';
import { LessonLive } from '../../../../Models/LMS/lesson-live';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-subject-lesson-live',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './subject-lesson-live.component.html',
  styleUrl: './subject-lesson-live.component.css'
})
export class SubjectLessonLiveComponent {
  LessonLivesData: LessonLive[] = []
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
    public activeRoute: ActivatedRoute, private menuService: MenuService, public LessonLiveServ: LessonLiveService,
    private realTimeService: RealTimeNotificationServiceService,) { }

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
          this.realTimeService.stopConnection(); 
       if (this.subscription) {
        this.subscription.unsubscribe();
      }
  }

  GetSubjectLessonLiveData() {
    this.LessonLiveServ.GetBySubjectID(this.SubjectID, this.DomainName).subscribe((d) => {
      this.LessonLivesData = d
    })
  }

  moveToBack() {
    this.router.navigateByUrl(`Student/Subject`)
  }

  getRandomColor(index: number): string {
    return this.bgColors[index % this.bgColors.length];
  }

  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
