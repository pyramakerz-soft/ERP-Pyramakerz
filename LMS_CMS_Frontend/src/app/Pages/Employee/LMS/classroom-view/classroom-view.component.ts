import { Component } from '@angular/core';
import { Classroom } from '../../../../Models/LMS/classroom';
import { TokenData } from '../../../../Models/token-data';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-classroom-view',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './classroom-view.component.html',
  styleUrl: './classroom-view.component.css'
})
export class ClassroomViewComponent { 
  classroom: Classroom = new Classroom();  

  DomainName: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  UserID: number = 0;
  classId: number = 0;
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');

  constructor(
    public account: AccountService, 
    public ApiServ: ApiService, 
    public classroomService: ClassroomService, 
    public activeRoute: ActivatedRoute,
    public router: Router,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService,
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader(); 

    this.classId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.DomainName = this.ApiServ.GetHeader();

    this.getClassData();  
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


  getClassData(){
    this.classroomService.GetByID(this.classId, this.DomainName).subscribe(
      data => {
        this.classroom = data
      }
    )
  }

  moveToClass() {
    this.router.navigateByUrl('Employee/Classroom');
  }

  GoToStudent() {
    this.router.navigateByUrl('Employee/Classroom Students/'+ this.classId);
  }

  GoToSubject() {
    this.router.navigateByUrl('Employee/Classroom Subject/'+ this.classId);
  } 
}
