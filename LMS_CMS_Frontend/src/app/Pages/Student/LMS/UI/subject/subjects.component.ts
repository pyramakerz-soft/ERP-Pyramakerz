import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-subjects',
    imports: [CommonModule, FormsModule , TranslateModule],
    standalone:true,
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css']
})
export class SubjectsComponent {
Test() {
}
  subjects = [
  { name: 'Arabic', icon: 'Images/254b3604a2d3ab135a3c4f2c673d8b308f0cf735.jpg' },
    { name: 'Mathematics', icon: 'Images/254b3604a2d3ab135a3c4f2c673d8b308f0cf735.jpg' },
    { name: 'Science', icon: 'Images/254b3604a2d3ab135a3c4f2c673d8b308f0cf735.jpg' },
    { name: 'English', icon: 'Images/254b3604a2d3ab135a3c4f2c673d8b308f0cf735.jpg' },
    { name: 'History', icon: 'Images/254b3604a2d3ab135a3c4f2c673d8b308f0cf735.jpg' },
    { name: 'Geography', icon: 'Images/254b3604a2d3ab135a3c4f2c673d8b308f0cf735.jpg' },
    { name: 'Art', icon: 'Images/254b3604a2d3ab135a3c4f2c673d8b308f0cf735.jpg' },
    { name: 'Music', icon: 'Images/254b3604a2d3ab135a3c4f2c673d8b308f0cf735.jpg' },
    { name: 'Physical Education', icon: 'Images/254b3604a2d3ab135a3c4f2c673d8b308f0cf735.jpg' }
  ];
    isRtl: boolean = false;
  subscription!: Subscription;

  constructor(
     private languageService: LanguageService,
    private router: Router) {}

  ngOnInit() {
    this.subscription = this.languageService.language$.subscribe(direction => {
    this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

navigateToSubject(subjectName: string) {
  const subjectId = subjectName.toLowerCase().replace(/\s+/g, '-');
  this.router.navigate(['/Student/Subject-Details-UI', subjectId]);
}
  navigateToLessonRes(subjectName: string) {
  const subjectId = subjectName.toLowerCase().replace(/\s+/g, '-');
  this.router.navigate(['/Student/Lesson-Resources-UI', subjectId]);
}
}