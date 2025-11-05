import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { Subject } from '../../../../Models/LMS/subject';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { AnnouncementService } from '../../../../Services/Employee/Administration/announcement.service';
import { Announcement } from '../../../../Models/Administrator/announcement';

@Component({
  selector: 'app-subject',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './subject.component.html',
  styleUrl: './subject.component.css'
})
export class SubjectComponent {
  subjectData: Subject[] = []
  path: string = ""
  DomainName: string = "";
  isRtl: boolean = false;
  subscription!: Subscription;
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  announcements: Announcement[] = []  
  selectedIndex = 0;
  private intervalId: any;

  constructor(public account: AccountService, private languageService: LanguageService, public router: Router, public ApiServ: ApiService,
    public activeRoute: ActivatedRoute, private menuService: MenuService, public subjectService: SubjectService,
    private realTimeService: RealTimeNotificationServiceService,private announcementService: AnnouncementService) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });
    this.getSubjectData()
    this.getMyAnnouncement()     
    this.startAutoSlide();
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

  getSubjectData() {
    this.subjectService.GetByStudentId(this.UserID, this.DomainName).subscribe(
      (data) => {
        this.subjectData = data;
      }
    )
  }

  moveToWeeks(subjectId: number) {
    this.router.navigateByUrl(`Student/SubjectWeeks/${subjectId}`)
  }

  moveToSubjectResources(subjectId: number) {
    this.router.navigateByUrl(`Student/SubjectResources/${subjectId}`)
  }

  moveToSubjectLive(subjectId: number) {
    this.router.navigateByUrl(`Student/SubjectLive/${subjectId}`)
  }

  moveToSubjectAssignments(subjectId: number) {
    this.router.navigateByUrl(`Student/SubjectAssignment/${subjectId}`)
  }

  getMyAnnouncement(){
    this.announcements = []
    this.announcementService.GetMyAnnouncement(this.DomainName).subscribe(
      data => {
        this.announcements = data
      }
    )
  }

  setSelectedIndex(index: number): void {
    this.selectedIndex = index;
  }

  nextSlide(): void {
    if (this.selectedIndex < this.announcements.length - 1) {
      this.selectedIndex++;
    } else {
      this.selectedIndex = 0;  
    }
  }

  prevSlide(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    } else {
      this.selectedIndex = this.announcements.length - 1;  
    }
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();  
    }, 5000); 
  }  
}
