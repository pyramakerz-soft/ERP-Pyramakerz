import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subjects',
    imports: [CommonModule, FormsModule],
    standalone:true,
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css']
})
export class SubjectsComponent {
Test() {
console.log('garab yad ybn el')}
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

  constructor(private router: Router) {}

navigateToSubject(subjectName: string) {
  const subjectId = subjectName.toLowerCase().replace(/\s+/g, '-');
  this.router.navigate(['/Employee/Subject-Details', subjectId]);
}
}