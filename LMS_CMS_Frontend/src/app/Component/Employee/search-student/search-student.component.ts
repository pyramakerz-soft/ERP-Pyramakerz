import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Student } from '../../../Models/student';
import { FormsModule } from '@angular/forms';
import { AcademicYear } from '../../../Models/LMS/academic-year';
import { Grade } from '../../../Models/LMS/grade';
import { Classroom } from '../../../Models/LMS/classroom';
import { AcadimicYearService } from '../../../Services/Employee/LMS/academic-year.service';
import { GradeService } from '../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../Services/Employee/LMS/classroom.service';
import { ApiService } from '../../../Services/api.service';
import { StudentService } from '../../../Services/student.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-search-student',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './search-student.component.html',
  styleUrl: './search-student.component.css'
})
export class SearchStudentComponent {
  @Input() selectedYear: number | null = null;
  @Input() selectedGrade: number | null = null;
  @Input() selectedClassroom: number | null = null;
  @Input() hiddenInputs: string[] = [];
  @Input() hiddenColumns: string[] = [];
  @Input() IsDoneHidden: boolean | null = false;

  
  @Output() closeModal = new EventEmitter<void>();
  @Output() studentSelected = new EventEmitter<number[]>();
  
  IsStudentsSelected = false
  IsTableShown = false
  IsYearSelectedFromTheBegining = false
  IsGradeSelectedFromTheBegining = false
  IsClassSelectedFromTheBegining = false
  id: number | null = null;
  name: string | null = null;
  nationalID: number | null = null; 
  isRtl: boolean = false;
  subscription!: Subscription;
  students:Student[] = []
  selectedStudents:number[] = []
  AcademicYears:AcademicYear[] = []
  Grades:Grade[] = []
  Classrooms:Classroom[] = []
  
  DomainName: string = "";

  CurrentPage:number = 1
  PageSize:number = 10
  TotalPages:number = 1
  TotalRecords:number = 0


  constructor(public acadimicYearService:AcadimicYearService,private languageService: LanguageService,private translate: TranslateService, public gradeservice:GradeService, public StudentService: StudentService , public classroomService:ClassroomService, public studentService:StudentService, public ApiServ: ApiService , public router: Router){}

  ngOnInit(){ 
    this.DomainName = this.ApiServ.GetHeader(); 
    this.getAcademicYears()  
    this.getGrades(); 

    if(this.selectedYear){this.IsYearSelectedFromTheBegining = true}
    if(this.selectedGrade){this.IsGradeSelectedFromTheBegining = true}
    if(this.selectedClassroom){this.IsClassSelectedFromTheBegining = true}
    if (this.selectedYear || this.selectedGrade) {
      this.getClassrooms();
    } 

        this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  } 

  isInputHidden(input: string): boolean {
    return this.hiddenInputs.includes(input);
  }

   isColumnHidden(input: string): boolean {
    var dataCell = document.getElementById('data-cell');
    if (this.hiddenColumns.includes(input)) {
      if(dataCell)
        dataCell.setAttribute('colspan', '6');
    } else {
      if(dataCell)
        dataCell.setAttribute('colspan', '7');
    }
    return this.hiddenColumns.includes(input);
  }
 
  isYearDisabled(): boolean {
    return this.IsYearSelectedFromTheBegining;
  }

  isGradeDisabled(): boolean {
    return this.IsGradeSelectedFromTheBegining
  }

  isClassroomDisabled(): boolean {
    return this.IsClassSelectedFromTheBegining
  }

  close() {
    this.closeModal.emit();
  }
  
  closeWithData(){ 
    this.closeModal.emit();
    this.studentSelected.emit(this.selectedStudents)
  }

  HideTable(){
    this.IsTableShown = false  
  }

  validateNumberForSearch(event: any, field: 'id' | 'nationalID'): void {
    const value = event.target.value; 
    if (isNaN(value) || value.trim() === '') {
      event.target.value = '';
      this[field] = null;
      return;
    } 
    this[field] = Number(value);
  }

  onYearChange() {  
    this.Classrooms = []   
    this.selectedClassroom = null 
 
    if (this.selectedYear) {
      this.getClassrooms();  
    }
  }

  onGradeChange() {  
    this.Classrooms = []   
    this.selectedClassroom = null 
 
    if (this.selectedYear) {
      this.getClassrooms();  
    }
  }

  getAcademicYears(){
    this.AcademicYears = []
    this.acadimicYearService.Get(this.DomainName).subscribe(
      (data) => {
        this.AcademicYears = data
      }
    )
  }

  getGrades(){
    this.Grades = []
    this.gradeservice.Get(this.DomainName).subscribe(
      (data) => {
        this.Grades = data
      }
    ) 
  }

  getClassrooms(){
    this.Classrooms = []
    if(this.selectedYear && this.selectedGrade){
      this.classroomService.GetByGradeAndAcYearId(this.selectedGrade, this.selectedYear, this.DomainName).subscribe(
        (data) => {
          this.Classrooms = data
        }
      )
    } else if(this.selectedYear){
      this.classroomService.GetByAcYearId(this.selectedYear, this.DomainName).subscribe(
        (data) => {
          this.Classrooms = data
        }
      )
    } else if(this.selectedGrade){
      this.classroomService.GetByGradeId(this.selectedGrade, this.DomainName).subscribe(
        (data) => {
          this.Classrooms = data
        }
      )
    }
  }

  Search(){
    this.IsTableShown = true
    this.IsStudentsSelected = true
    this.selectedStudents = []
    this.CurrentPage= 1
    this.PageSize= 10
    this.TotalPages= 1
    this.TotalRecords= 0
    this.GetAllData(this.CurrentPage, this.PageSize) 
  } 

  GetAllData(pageNumber:number, pageSize:number){
    const filters = { 
      ID: this.id,
      Name: this.name,
      NationalID: this.nationalID,
      GradeID: this.selectedGrade,
      AcademicYearID: this.selectedYear,
      ClassroomID: this.selectedClassroom
    };

    this.students = []  

    this.studentService.SearchByMultiParameters(filters, this.DomainName, pageNumber, pageSize).subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage
        this.PageSize = data.pagination.pageSize
        this.TotalPages = data.pagination.totalPages
        this.TotalRecords = data.pagination.totalRecords 
        this.students = data.data
      }, 
      (error) => { 
        if(error.status == 404){
          if(this.TotalRecords != 0){
            let lastPage = this.TotalRecords / this.PageSize 
            if(lastPage >= 1){ 
              this.CurrentPage = Math.ceil(lastPage) 
              this.GetAllData(this.CurrentPage, this.PageSize)
            }
          } 
        }
      }
    )
  }

  changeCurrentPage(currentPage:number){
    this.CurrentPage = currentPage
    this.GetAllData(this.CurrentPage, this.PageSize)

    this.IsStudentsSelected= false
    this.selectedStudents= []
  }

  validateNumber(event: any): void {
    const value = event.target.value;
    this.PageSize = 0
  }

  validatePageSize(event: any) { 
    const value = event.target.value;
    if (isNaN(value) || value === '') {
        event.target.value = '';
    }
  }

  get visiblePages(): number[] {
    const total = this.TotalPages;
    const current = this.CurrentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = current - half;
    let end = current + half;

    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  
  toggleSelection(studentId: number, isChecked?: boolean) {
    if (isChecked) {
      if (!this.selectedStudents.includes(studentId)) {
        this.selectedStudents.push(studentId);
      }
    } else {
      this.selectedStudents = this.selectedStudents.filter(id => id !== studentId);
    }

    this.IsStudentsSelected = this.selectedStudents.length > 0;
  }

  onCheckboxChange(event: Event, studentId: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.toggleSelection(studentId, isChecked);
  }

  isSelected(studentId: number): boolean {
    return this.selectedStudents.includes(studentId);
  }

  selectAll(): boolean {
    return this.students.length > 0 && this.selectedStudents.length === this.students.length;
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedStudents = this.students.map(s => s.id);
    } else {
      this.selectedStudents = []; 
    }

    this.IsStudentsSelected = this.selectedStudents.length > 0;
  }

   Edit(StuId: number, Rid: number) {
      this.router.navigateByUrl(`Employee/Edit Student/${Rid}/${StuId}`);
    }
  
  
    View(id: number) {
      this.router.navigateByUrl(`Employee/Student/` + id);
    }
  
    Delete(id: number) {
     Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete')+ " " + this.translate.instant('هذا') + " " + this.translate.instant('the') + this.translate.instant('Student'),
           icon: 'warning',
           showCancelButton: true,
           confirmButtonColor: '#089B41',
           cancelButtonColor: '#17253E',
           confirmButtonText: this.translate.instant('Delete'),
           cancelButtonText: this.translate.instant('Cancel'),
         }).then((result) => {
        if (result.isConfirmed) {
          this.StudentService.Delete(id, this.DomainName).subscribe((d) => {
            this.Search();
          });
        }
      });
    }
}
