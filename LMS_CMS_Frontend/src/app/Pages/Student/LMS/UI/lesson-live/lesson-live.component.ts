import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-lesson-live',
  standalone: true,
  imports: [CommonModule , FormsModule , TranslateModule],
  templateUrl: './lesson-live.component.html',
  styleUrl: './lesson-live.component.css'
})
export class LessonLiveUIComponent {
  subjectName: string = '';
  activeTab: string = 'resources'; // Default active tab

  isRtl: boolean = false;
  subscription!: Subscription;
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

  formatSubjectName(subjectId: string): string {
    return subjectId.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // selectWeek(week: string) {
  //   this.selectedWeek = week;
  //   this.router.navigate(['/Employee/week-details', 
  //     this.subjectName.toLowerCase().replace(/\s+/g, '-'), 
  //     week.toLowerCase().replace(/\s+/g, '-')
  //   ]);
  // }

  goBack() {
    this.router.navigate(['/Student/Subject-Details-UI', this.subjectName.toLowerCase().replace(/\s+/g, '-')]);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}