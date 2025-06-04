import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../../../Component/search/search.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assignment-details',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent],
  templateUrl: './assignment-details.component.html',
  styleUrls: ['./assignment-details.component.css']
})
export class AssignmentDetailsComponent {

  constructor(private router: Router) {}
  editAssignment(assignmentId: number) {
    this.router.navigateByUrl(`Employee/Assignment-Edit-UI`);
  }

  assignmentData: any[] = [
    {
      id: 1,
      name: 'Live 1',
      type: 'Text Book',
      subjectId: 1,
      openDate: new Date(),
      dueDate: new Date(),
      cutOffDate: new Date(),
      classes: [
        { name: 'Class 1', count: 5 },
        { name: 'Class 2', count: 4 }
      ]
    },
    {
      id: 2,
      name: 'Live 1',
      type: 'Fixed Question',
      subjectId: 2,
      openDate: new Date(),
      dueDate: new Date(),
      cutOffDate: new Date(),
      classes: [
        { name: 'Class 3', count: 20 },
        { name: 'Class 2', count: 20 }
      ]
    },
    {
      id: 3,
      name: 'Live 1',
      type: 'Randomized',
      subjectId: 3,
      openDate: new Date(),
      dueDate: new Date(),
      cutOffDate: new Date(),
      classes: [
        { name: 'Class 1', count: 5 },
        { name: 'Class 2', count: 4 }
      ]
    }
  ];

  filteredAssignments = [...this.assignmentData];
  
  subjects = [
    { id: 1, name: 'Mathematics' },
    { id: 2, name: 'Science' },
    { id: 3, name: 'English' }
  ];

  availableClasses = [
    { 
      id: 1, 
      name: 'Class 1', 
      selected: false,
      students: [
        { id: 1, name: 'Mohamed Kamal', selected: false },
        { id: 2, name: 'Ahmed Ali', selected: false }
      ]
    },
    { 
      id: 2, 
      name: 'Class 2', 
      selected: false,
      students: [
        { id: 3, name: 'Student A', selected: false },
        { id: 4, name: 'Student B', selected: false }
      ]
    },
    { 
      id: 3, 
      name: 'Class 3', 
      selected: false,
      students: [
        { id: 5, name: 'Student C', selected: false },
        { id: 6, name: 'Student D', selected: false }
      ]
    }
  ];

  // New properties for dropdown functionality
  isSubjectDropdownOpen = false;
  isModalSubjectDropdownOpen = false;
  selectedSubjectName = '';
  modalSelectedSubjectName = '';
  
  selectedClass: any = null;
  selectAllStudents = false;
  isSpecificStudents = false;
  totalSelectedStudents = 0;

  selectedClasses: {
    className: string;
    students: string[];
  }[] = [];
  
  isDropdownOpen = false;
  currentClassToEdit: any = null;
  selectedSubject: string = '';
  totalSelectedClasses = 0;
  currentPage = 1;
  // editAssignment = false;
  keysArray = ['name', 'type', 'openDate', 'dueDate', 'cutOffDate'];
  key = "name";
  value = "";
  isClassSelectorOpen = false;

  // New methods for dropdown functionality
  toggleSubjectDropdown() {
    this.isSubjectDropdownOpen = !this.isSubjectDropdownOpen;
  }

  selectSubject(subject: any) {
    this.selectedSubject = subject.id;
    this.selectedSubjectName = subject.name;
    this.isSubjectDropdownOpen = false;
    this.filterBySubject();
  }

  toggleModalSubjectDropdown() {
    this.isModalSubjectDropdownOpen = !this.isModalSubjectDropdownOpen;
  }

  selectModalSubject(subject: any) {
    this.modalSelectedSubjectName = subject.name;
    this.isModalSubjectDropdownOpen = false;
    // Store the selected subject ID for the modal form if needed
  }

  // Existing methods
  selectClass(cls: any, event?: Event) {
    if (event && (event.target as HTMLElement).tagName === 'INPUT') {
      return;
    }
    this.selectedClass = cls;
    this.selectAllStudents = cls.students.every((s: any) => s.selected);
  }

  toggleSelectAllStudents() {
    if (this.selectedClass) {
      this.selectedClass.students.forEach((student: any) => {
        student.selected = this.selectAllStudents;
      });
      this.updateSelectedCount();
    }
  }

  openClassSelector() {
    this.isClassSelectorOpen = true;
  }

  closeClassSelector() {
    this.isClassSelectorOpen = false;
    this.selectedClass = null;
  }

  openModal(assignmentId?: number) {
    if (assignmentId) {
      // this.editAssignment = true;
      // Load assignment data for editing
    }
    this.isClassSelectorOpen = false;
    this.selectedClass = null;
    
    document.getElementById("Add_Modal")?.classList.remove("hidden");
    document.getElementById("Add_Modal")?.classList.add("flex");
  }

  updateSelectedCount() {
    if (this.selectedClass) {
      this.selectAllStudents = this.selectedClass.students.every((s: any) => s.selected);
    }
    
    let count = 0;
    
    if (this.isSpecificStudents) {
      this.availableClasses.forEach(cls => {
        if (cls.selected && cls.students) {
          count += cls.students.filter((s: any) => s.selected).length;
        }
      });
    } else {
      this.availableClasses.forEach(cls => {
        if (cls.selected) {
          count += cls.students.length;
        }
      });
    }
    
    this.totalSelectedStudents = count;
  }

  filterBySubject() {
    if (!this.selectedSubject) {
      this.filteredAssignments = [...this.assignmentData];
    } else {
      this.filteredAssignments = this.assignmentData.filter(
        assignment => assignment.subjectId == this.selectedSubject
      );
    }
  }

  updateSelectedClasses() {
    this.totalSelectedClasses = this.selectedClasses.reduce(
      (sum, cls) => sum + cls.students.length,
      0
    );
  }

  closeModal() {
    document.getElementById("Add_Modal")?.classList.remove("flex");
    document.getElementById("Add_Modal")?.classList.add("hidden");
    // this.editAssignment = false;
  }

  deleteAssignment(assignmentId: number) {
    console.log('Delete assignment', assignmentId);
  }

  onSearchEvent(event: { key: string, value: any }) {
    this.key = event.key;
    this.value = event.value;
    
    if (this.value !== "") {
      this.filteredAssignments = this.assignmentData.filter(item => {
        const fieldValue = item[this.key as keyof typeof item];
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(this.value.toLowerCase());
        }
        return fieldValue == this.value;
      });
    } else {
      this.filterBySubject();
    }
  }
}