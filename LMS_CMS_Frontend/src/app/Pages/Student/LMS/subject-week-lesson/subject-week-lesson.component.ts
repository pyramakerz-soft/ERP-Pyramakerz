import { Component } from '@angular/core';
import { LessonResource } from '../../../../Models/LMS/lesson-resource';
import { LessonActivity } from '../../../../Models/LMS/lesson-activity';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { SemesterWorkingWeekService } from '../../../../Services/Employee/LMS/semester-working-week.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { LessonActivityService } from '../../../../Services/Employee/LMS/lesson-activity.service';
import { LessonResourceService } from '../../../../Services/Employee/LMS/lesson-resource.service';
import { LessonResourceType } from '../../../../Models/LMS/lesson-resource-type';
import { LessonActivityType } from '../../../../Models/LMS/lesson-activity-type';

@Component({
  selector: 'app-subject-week-lesson',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './subject-week-lesson.component.html',
  styleUrl: './subject-week-lesson.component.css'
})
export class SubjectWeekLessonComponent {
  LessonResourcesTypeData: LessonResourceType[] = []
  LessonActivityTypeData: LessonActivityType[] = []
  path: string = ""
  DomainName: string = "";
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  SubjectID: number = 0;
  WeekId: number = 0;
  SubjectName: string = ""
  WeekName: string = ""
  mode: string = "Activity";
  bgColors: string[] = ['#F7F7F7', '#D7F7FF', '#FFF1D7', '#E8EBFF'];
  toggledIndexesActivity: Set<number> = new Set();
  toggledIndexesResource: Set<number> = new Set();

  constructor(public account: AccountService, public router: Router, public ApiServ: ApiService,
    public activeRoute: ActivatedRoute, private menuService: MenuService, public LessonActivityServ: LessonActivityService, public LessonResourceServ: LessonResourceService) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });
    this.SubjectID = Number(this.activeRoute.snapshot.paramMap.get('SubjectId'));
    this.WeekId = Number(this.activeRoute.snapshot.paramMap.get('WeekId'));
    this.GetActivityData()
  }

  GetActivityData() {
    this.mode = "Activity";
    this.LessonActivityServ.GetByWeekIDGroupByType(this.SubjectID, this.WeekId, this.DomainName).subscribe((d) => {
      this.LessonActivityTypeData = d.data
      console.log(this.LessonActivityTypeData)
      this.SubjectName = d.subjectName
      this.WeekName = d.weekName
    })
  }

  toggleActivity(index: number): void {
    if (this.toggledIndexesActivity.has(index)) {
      this.toggledIndexesActivity.delete(index);
    } else {
      this.toggledIndexesActivity.add(index);
    }
  }

  openLinkActivity(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

   toggleResource(index: number): void {
    if (this.toggledIndexesResource.has(index)) {
      this.toggledIndexesResource.delete(index);
    } else {
      this.toggledIndexesResource.add(index);
    }
  }

  openLinkResource(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  GetResourceData() {
    this.mode = "Resource";
    this.LessonResourceServ.GetByWeekIDGroupByType(this.SubjectID, this.WeekId, this.DomainName).subscribe((d) => {
      this.LessonResourcesTypeData = d.data
      this.SubjectName = d.subjectName
      this.WeekName = d.weekName
    })
  }

  moveToBack() {
    this.router.navigateByUrl(`Student/SubjectWeeks/${this.SubjectID}`)
  }

  getRandomColor(index: number): string {
    return this.bgColors[index % this.bgColors.length];
  }
}
