import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-subject-details',
    imports: [CommonModule, FormsModule , TranslateModule],
standalone:true,
  templateUrl: './subject-details.component.html',
  styleUrls: ['./subject-details.component.css']
})
export class SubjectDetailsComponent implements OnInit {

  subjectName: string = '';
    isRtl: boolean = false;
  subscription!: Subscription;
  activeTab: string = 'resources'; // Default active tab
weeks: string[] = [
  'Week 1',
  'Week 2',
  'Week 3',
  'Week 4',
  'Week 5',
  'Week 6',
  'Week 7',
  'Week 8',
  'Week 9'
];

  selectedWeek: string | null = null;

  constructor(
    private route: ActivatedRoute,
     private languageService: LanguageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const subjectId = params.get('subjectId');
      if (subjectId) {
        this.subjectName = this.formatSubjectName(subjectId);
      }
    });

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
  formatSubjectName(subjectId: string): string {
    return subjectId.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  selectWeek(week: string) {
    this.selectedWeek = week;
    this.router.navigate(['/Student/week-details', 
      this.subjectName.toLowerCase().replace(/\s+/g, '-'), 
      week.toLowerCase().replace(/\s+/g, '-')
    ]);
  }

  goBack() {
    this.router.navigate(['/Student/Subject-UI']);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
  navigateToAssignments(subjectName: string) {
  const subjectId = subjectName.toLowerCase().replace(/\s+/g, '-');
  this.router.navigate(['/Student/Assignments-UI', subjectId]);
}
navigateToLessonLive(subjectName: string) {
  const subjectId = subjectName.toLowerCase().replace(/\s+/g, '-');
  this.router.navigate(['/Student/Lesson-Resources-UI', subjectId]);
}

}