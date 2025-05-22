import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-week-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './week-details.component.html',
  styleUrls: ['./week-details.component.css']
})
export class WeekDetailsComponent implements OnInit {
  subjectName: string = '';
  weekName: string = '';
  activeTab: string = 'lessons-activity';
  expandedSections: { [key: string]: boolean } = {
    sheets: false,
    videos: false,
    links: false
  };
  
  // Mock data
  sheets = [
    { name: 'Sheets book 1.pdf', selected: false },
    { name: 'Sheets book 2.pdf', selected: false },
    { name: 'Sheets book 3.pdf', selected: false }
  ];
  
  videos = [
    { name: 'Introduction video', selected: false },
    { name: 'Advanced concepts', selected: false }
  ];
  
  links = [
    { name: 'External resource 1', url: '#', selected: false },
    { name: 'External resource 2', url: '#', selected: false }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const subjectId = params.get('subjectId');
      const weekId = params.get('weekId');
      
      if (subjectId) {
        this.subjectName = this.formatName(subjectId);
      }
      
      if (weekId) {
        this.weekName = this.formatName(weekId);
      }
    });
  }

  formatName(name: string): string {
    return name.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  toggleSection(section: string) {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  toggleSelection(item: any, type: string) {
    item.selected = !item.selected;
    // You can add additional logic here for selection handling
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
  navigateToLessonRes(subjectName: string) {
  const subjectId = subjectName.toLowerCase().replace(/\s+/g, '-');
  this.router.navigate(['/Student/Lesson-Resources-UI', subjectId]);
}

  goBack() {
    this.router.navigate(['/Student/Subject-Details-UI', this.subjectName.toLowerCase().replace(/\s+/g, '-')]);
  }
}