import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assignment-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignment-edit.component.html',
  styleUrls: ['./assignment-edit.component.css']
})
export class AssignmentEditComponent {
  assignment: any = {
    name: 'Primary',
    type: 'textbook',
    openDate: '2024-05-22',
    dueDate: '2024-05-22',
    cutOffDate: '2024-05-22',
    classes: [
      { name: 'Class1', count: 5 }
    ],
    description: '',
    file: 'HannahBuzing_Resume.pdf'
  };

  constructor(private router: Router) {}

  goBack() {
    this.router.navigateByUrl(`Employee/Assignment Details`);
  }  

  getFileName(url: string): string {
    if (!url) return 'Document';
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Document';
  }

  removeFile() {
    this.assignment.file = null;
  }

  handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      // In a real app, you would upload the file and get a URL
      this.assignment.file = file.name;
    }
  }
}