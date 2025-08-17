import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-lesson-resources',
  standalone: true,
  imports: [CommonModule , FormsModule , TranslateModule],
  templateUrl: './lesson-resources.component.html',
  styleUrl: './lesson-resources.component.css'
})
export class LessonResourcesComponent {
  subjectName: string = '';
  activeTab: string = 'resources'; // Default active tab
Sheets: string[] = [
  'Sheets book 1.pdf',
  'Sheets book 2.pdf',
  'Sheets book 3.pdf',
  'Sheets book 4.pdf',
  'Sheets book 5.pdf',
  'Sheets book 6.pdf',
  'Sheets book 7.pdf',
  'Sheets book 8.pdf',
];

  selectedWeek: string | null = null;
  isRtl: boolean = false;
  subscription!: Subscription;
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