import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../../../Component/reuse-table/reuse-table.component';
import Swal from 'sweetalert2';
import { MedicalHistoryService } from '../../../../../Services/Employee/Clinic/medical-history.service';
import { ApiService } from '../../../../../Services/api.service';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { GradeService } from '../../../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../../../Services/Employee/LMS/classroom.service';
import { StudentService } from '../../../../../Services/student.service';
import { DoctorMedicalHistory } from '../../../../../Models/Clinic/MedicalHistory';
import { SearchComponent } from '../../../../../Component/search/search.component';
import { MedicalHistoryModalComponent } from "../medical-history-modal/medical-history-modal.component";
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-medical-history',
  standalone: true,
  imports: [FormsModule, CommonModule, TableComponent, SearchComponent, MedicalHistoryModalComponent, TranslateModule ],
  templateUrl: './medical-history.component.html',
  styleUrls: ['./medical-history.component.css'],
})
export class MedicalHistoryComponent implements OnInit {
  headers: string[] = ['ID', 'School', 'Grade', 'Class', 'Student', 'Details', 'Permanent Drug', 'Date', 'Actions'];
  headersarabic: string[] = ['المعرف', 'المدرسة', 'الصف', 'الفصل', 'الطالب', 'التفاصيل', 'الدواء الدائم', 'التاريخ', 'الإجراءات'];

  keys: string[] = ['id', 'school', 'grade', 'classRoom', 'student', 'details', 'permanentDrug', 'insertedAt'];
  keysArray: string[] = ['id', 'school', 'grade', 'classRoom', 'student', 'details', 'permanentDrug'];
  medicalHistories: DoctorMedicalHistory[] = [];
  isModalVisible = false;
  isRtl: boolean = false;
    subscription!: Subscription;
    searchKey: string = 'id';
  searchValue: string = '';
  
  constructor(
    private medicalHistoryService: MedicalHistoryService,
    private apiService: ApiService,
    private schoolService: SchoolService,
    private gradeService: GradeService,
    private classroomService: ClassroomService,
    private studentService: StudentService,
      private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadMedicalHistories();
     this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  async onSearchEvent(event: { key: string, value: any }) {
    this.searchKey = event.key;
    this.searchValue = event.value;
    await this.loadMedicalHistories();
    
    if (this.searchValue) {
        this.medicalHistories = this.medicalHistories.filter(mh => {
            const fieldValue = mh[this.searchKey as keyof typeof mh]?.toString().toLowerCase() || '';
            return fieldValue.includes(this.searchValue.toString().toLowerCase());
        });
    }
  }

  async loadMedicalHistories() {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(this.medicalHistoryService.GetByDoctor(domainName));
      this.medicalHistories = data.map(item => ({
        ...item,
        insertedAt: new Date(item.insertedAt).toLocaleDateString(),
        actions: { edit: true, delete: true },
      }));

      if (this.searchValue) {
        this.medicalHistories = this.medicalHistories.filter(mh => {
          const fieldValue = mh[this.searchKey as keyof typeof mh]?.toString().toLowerCase() || '';
          return fieldValue.includes(this.searchValue.toString().toLowerCase());
        });
      }
    } catch (error) {
      console.error('Error loading medical histories:', error);
    }
  }
  
  onModalVisibilityChange(visible: boolean) {
  this.isModalVisible = visible;
  if (!visible) {
    this.selectedMedicalHistory = null;
  }
}

   selectedMedicalHistory: DoctorMedicalHistory | null = null;
  @ViewChild(MedicalHistoryModalComponent) medicalHistoryModal!: MedicalHistoryModalComponent;

  openModal(row?: DoctorMedicalHistory) {
    this.isModalVisible = true;
    if (row) {
      this.selectedMedicalHistory = row;
    } else {
      this.selectedMedicalHistory = null;
    }
  }


  closeModal() {
    this.isModalVisible = false;
  }

deleteMedicalHistory(row: any) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You will not be able to recover this medical history!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#089B41',
    cancelButtonColor: '#2E3646',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, keep it',
  }).then((result) => {
    if (result.isConfirmed) {
      const domainName = this.apiService.GetHeader();
      this.medicalHistoryService.Delete(row.id, domainName).subscribe({
        next: () => {
          
          if (this.medicalHistories.length === 1) {
            this.medicalHistories = []; 
          }
          this.loadMedicalHistories(); 
          Swal.fire('Deleted!', 'The medical history has been deleted.', 'success');
        },
        error: (error) => {
          console.error('Error deleting medical history:', error);
          Swal.fire('Error', 'Failed to delete medical history. Please try again later.', 'error');
        },
      });
    }
  });
}


GetTableHeaders(){
   
if(!this.isRtl){
  return this.headers
}else{
  return this.headersarabic
}
}




}
