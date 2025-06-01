import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Student } from '../../../Models/student';

@Component({
  selector: 'app-search-student',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-student.component.html',
  styleUrl: './search-student.component.css'
})
export class SearchStudentComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() studentSelected = new EventEmitter<Student[]>();
 
  IsStudentsSelected = false

  students:Student[] = []
  
  close() {
    this.closeModal.emit();
  }
  
  closeWithData(){ 
    this.closeModal.emit();
    this.studentSelected.emit(this.students)
  }
}
