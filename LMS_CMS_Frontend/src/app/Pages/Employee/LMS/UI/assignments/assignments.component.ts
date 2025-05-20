import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule , FormsModule],
  templateUrl: './assignments.component.html',
  styleUrl: './assignments.component.css'
})
export class AssignmentsComponent {
  subjectName: string = '';
  activeTab: string = 'resources'; // Default active tab
Sheets: string[] = [
  'Sheets book 1.pdf',
  'Sheets book 2.pdf',
  'Sheets book 3.pdf',
];

  selectedWeek: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const subjectId = params.get('subjectId');
      if (subjectId) {
        this.subjectName = this.formatSubjectName(subjectId);
      }
    });
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
    this.router.navigate(['/Employee/Subject-Details', this.subjectName.toLowerCase().replace(/\s+/g, '-')]);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}