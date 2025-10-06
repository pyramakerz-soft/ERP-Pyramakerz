import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';

import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DoctorMedicalHistory } from '../../../../../Models/Clinic/MedicalHistory';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { GradeService } from '../../../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../../../Services/Employee/LMS/classroom.service';
import { StudentService } from '../../../../../Services/student.service';
import { MedicalHistoryService } from '../../../../../Services/Employee/Clinic/medical-history.service';
import { ApiService } from '../../../../../Services/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-medical-history-modal',
  imports: [FormsModule, CommonModule, TranslateModule],
  standalone: true,
  templateUrl: './medical-history-modal.component.html',
  styleUrls: ['./medical-history-modal.component.css'],
})
export class MedicalHistoryModalComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() medicalHistoryData: DoctorMedicalHistory | null = null;
  @Output() isVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<void>();

  editMode = false;
  medicalHistory: DoctorMedicalHistory = new DoctorMedicalHistory(
    0,
    0,
    '',
    0,
    '',
    0,
    '',
    0,
    '',
    '',
    null,
    '',
    null,
    null,
    new Date().toISOString(),
    0,
    ''
  );
  firstReportPreview: File | null = null;
  secReportPreview: File | null = null;
  validationErrors: { [key: string]: string } = {};
  isRtl: boolean = false;
  subscription!: Subscription;
  schools: any[] = [];
  grades: any[] = [];
  classes: any[] = [];
  students: any[] = [];

  constructor(
    private schoolService: SchoolService,
    private gradeService: GradeService,
    private classroomService: ClassroomService,
    private studentService: StudentService,
    private medicalHistoryService: MedicalHistoryService,
    private apiService: ApiService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService
  ) { }

  async ngOnInit() {
    await this.loadSchools();
    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
    this.realTimeService.stopConnection();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['medicalHistoryData']) {
      if (this.medicalHistoryData) {
        this.editMode = true;
        this.medicalHistory = { ...this.medicalHistoryData };
        await this.loadSchools();
        if (this.medicalHistory.schoolId) {
          await this.loadGrades(this.medicalHistory.schoolId);
          if (this.medicalHistory.gradeId) {
            await this.loadClasses(this.medicalHistory.gradeId);
            if (this.medicalHistory.classRoomID) {
              await this.loadStudents(this.medicalHistory.classRoomID); // Load students
              // Give time for async operations to complete
              setTimeout(() => {
                this.medicalHistory.studentId = this.medicalHistoryData?.studentId || 0;
              }, 100);
            }
          }
        }
        this.firstReportPreview = this.medicalHistory.firstReport;
        this.secReportPreview = this.medicalHistory.secReport;
      } else {
        this.resetForm();
      }
    }
  }

private resetForm() {
  this.editMode = false;
  this.medicalHistory = new DoctorMedicalHistory(
    0,
    0,
    '',
    0,
    '',
    0,
    '',
    0,
    '',
    '',
    null,
    '',
    null,
    null,
    new Date().toISOString(),
    0,
    ''
  );
  this.firstReportPreview = null;
  this.secReportPreview = null;
  this.grades = [];
  this.classes = [];
  this.students = [];
}

  async loadSchools() {
    try {
      const domainName = this.apiService.GetHeader();
      this.schools = await firstValueFrom(this.schoolService.Get(domainName));
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  }

  async loadGrades(schoolId: number) {
    try {
      const domainName = this.apiService.GetHeader();
      this.grades = await firstValueFrom(
        this.gradeService.GetBySchoolId(schoolId, domainName)
      );
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  }

  async loadClasses(gradeId: number) {
    try {
      const domainName = this.apiService.GetHeader();
      this.classes = await firstValueFrom(
        this.classroomService.GetByGradeId(gradeId, domainName)
      );
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  }

  async loadStudents(classId: number) {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(
        this.studentService.GetByClassID(classId, domainName)
      );
      this.students = data.map((student) => ({
        id: student.id,
        name: student.en_name,
      }));
    } catch (error) {
      console.error('Error loading students:', error);
    }
  }

  onSchoolChange(event: Event) {
    const selectedSchoolId = Number((event.target as HTMLSelectElement).value);
    this.medicalHistory.schoolId = selectedSchoolId;
    this.medicalHistory.gradeId = 0;
    this.medicalHistory.classRoomID = 0;
    this.medicalHistory.studentId = 0;
    this.grades = [];
    this.classes = [];
    this.students = [];
    if (selectedSchoolId) {
      this.loadGrades(selectedSchoolId);
    }
  }

  onGradeChange(event: Event) {
    const selectedGradeId = Number((event.target as HTMLSelectElement).value);
    this.medicalHistory.gradeId = selectedGradeId;
    this.medicalHistory.classRoomID = 0;
    this.medicalHistory.studentId = 0;
    this.classes = [];
    this.students = [];
    if (selectedGradeId) {
      this.loadClasses(selectedGradeId);
    }
  }

  onClassChange(event: Event) {
    const selectedClassId = Number((event.target as HTMLSelectElement).value);
    this.medicalHistory.classRoomID = selectedClassId;
    this.medicalHistory.studentId = 0;
    this.students = [];
    if (selectedClassId) {
      this.loadStudents(selectedClassId);
    }
  }

onFileUpload(event: any, field: 'firstReport' | 'secReport') {
  const fileToEmpty: File = event.target.files[0];
  const input = event.target as HTMLInputElement;
  this.validationErrors[field] = '';
  console.log("fansedbhaDESf");

  if (input.files && input.files[0]) {
    const file = input.files[0];
    const fileType = file.type;
    const maxSize = 25 * 1024 * 1024; // 25MB

    // Clear previous file
    this.medicalHistory[field] = null;

    // Validate file type - match the accept attribute
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const isValidType = validImageTypes.includes(fileType);

    if (!isValidType) {
      this.validationErrors[field] = 'Invalid file type. Please upload JPEG, PNG, JPG images or videos.';
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      this.validationErrors[field] = 'File size exceeds maximum limit of 25MB.';
      return;
    }

    // Process valid file
    this.medicalHistory[field] = file;

    // Create preview for both images and videos
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (field === 'firstReport') {
        this.firstReportPreview = fileToEmpty;
      } else {
        this.secReportPreview = fileToEmpty;
      }
    };
    reader.readAsDataURL(fileToEmpty);

  }
}

  isFormValid(): boolean {
    this.validationErrors = {};
    let isValid = true;

    // Existing validation checks...
    if (!this.medicalHistory.schoolId || this.medicalHistory.schoolId === 0) {
      this.validationErrors['schoolId'] = '*School is required';
      isValid = false;
    }

    if (!this.medicalHistory.gradeId || this.medicalHistory.gradeId === 0) {
      this.validationErrors['gradeId'] = '*Grade is required';
      isValid = false;
    }

    if (!this.medicalHistory.classRoomID || this.medicalHistory.classRoomID === 0) {
      this.validationErrors['classRoomID'] = '*Class is required';
      isValid = false;
    }

    if (!this.medicalHistory.studentId || this.medicalHistory.studentId === 0) {
      this.validationErrors['studentId'] = '*Student is required';
      isValid = false;
    }

    return isValid;
  }

  isSaving: boolean = false;


  async saveMedicalHistory() {
    if (this.isFormValid()) {
      try {
        this.isSaving = true;

        const domainName = this.apiService.GetHeader();

        if (this.editMode) {
          await firstValueFrom(
            this.medicalHistoryService.UpdateByDoctorAsync(
              this.medicalHistory,
              domainName
            )
          );
          Swal.fire(
            'Success',
            'Medical history updated successfully!',
            'success'
          );
        } else {
          await firstValueFrom(
            this.medicalHistoryService.AddByDoctor(
              this.medicalHistory,
              domainName
            )
          );
          Swal.fire(
            'Success',
            'Medical history created successfully!',
            'success'
          );
        }

        this.onSave.emit();
        this.closeModal();
      } catch (error) {
        console.error('Error saving medical history:', error);
        Swal.fire(
          'Error',
          'Failed to save medical history. Please try again later.',
          'error'
        );
      } finally {
        this.isSaving = false;
      }
    }
  }

  // Add this method to clear validation error for a field
  clearValidationError(field: string) {
    if (this.validationErrors[field]) {
      delete this.validationErrors[field];
    }
  }

closeModal() {
  this.isVisible = false;
  this.isVisibleChange.emit(false);
  this.resetForm();
  this.validationErrors = {};
  
  // Reset file inputs
  const firstReportInput = document.getElementById('firstReportUpload') as HTMLInputElement;
  const secReportInput = document.getElementById('secReportUpload') as HTMLInputElement;
  
  if (firstReportInput) firstReportInput.value = '';
  if (secReportInput) secReportInput.value = '';
}

onFirstReportFileSelected(event: any) {
  const file: File = event.target.files[0];
  const input = event.target as HTMLInputElement;
  
  if (file) {
    if (file.size > 25 * 1024 * 1024) {
      this.validationErrors['firstReport'] = 'The file size exceeds the maximum limit of 25 MB.';
      this.medicalHistory.firstReport = null;
      this.firstReportPreview = null;
      return; 
    }
    if (file.type === 'image/jpeg' || file.type === 'image/png') {
      this.medicalHistory.firstReport = file; 
      this.validationErrors['firstReport'] = ''; 

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.firstReportPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.validationErrors['firstReport'] = 'Invalid file type. Only JPEG, JPG and PNG are allowed.';
      this.medicalHistory.firstReport = null;
      this.firstReportPreview = null;
      return; 
    }
  }
  
  input.value = '';
}

onSecReportFileSelected(event: any) {
  const file: File = event.target.files[0];
  const input = event.target as HTMLInputElement;
  
  if (file) {
    if (file.size > 25 * 1024 * 1024) {
      this.validationErrors['secReport'] = 'The file size exceeds the maximum limit of 25 MB.';
      this.medicalHistory.secReport = null;
      this.secReportPreview = null;
      return; 
    }
    if (file.type === 'image/jpeg' || file.type === 'image/png') {
      this.medicalHistory.secReport = file; 
      this.validationErrors['secReport'] = ''; 

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.secReportPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.validationErrors['secReport'] = 'Invalid file type. Only JPEG, JPG and PNG are allowed.';
      this.medicalHistory.secReport = null;
      this.secReportPreview = null;
      return; 
    }
  }
  
  input.value = '';
}
}
