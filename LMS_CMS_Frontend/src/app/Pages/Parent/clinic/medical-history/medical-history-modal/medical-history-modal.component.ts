import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
// import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ParentMedicalHistory } from '../../../../../Models/Clinic/MedicalHistory';
import { MedicalHistoryService } from '../../../../../Services/Employee/Clinic/medical-history.service';
import { ApiService } from '../../../../../Services/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { Student } from '../../../../../Models/student';
import { TokenData } from '../../../../../Models/token-data';
import { jwtDecode } from 'jwt-decode';
import { StudentService } from '../../../../../Services/student.service';

@Component({
  selector: 'app-parent-medical-history-modal',
  imports: [FormsModule, CommonModule, TranslateModule],
  standalone: true,
  templateUrl: './medical-history-modal.component.html',
  styleUrls: ['./medical-history-modal.component.css'],
})
export class ParentMedicalHistoryModalComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() medicalHistoryData: ParentMedicalHistory | null = null;
  @Output() isVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<void>();

  editMode = false;
  medicalHistory: ParentMedicalHistory = {
    id: 0,
    studentId: 0, // Changed from undefined to 0 for required field
    details: '',
    permanentDrug: '',
    firstReport: null,
    secReport: null,
    insertedAt: new Date().toISOString(),
    updatedAt: null,
    insertedByUserId: 0,
    en_name: ''
  };
  
  firstReportPreview: File | null = null;
  secReportPreview: File | string | null = null;
  validationErrors: { [key: string]: string } = {};
  isSaving: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  
  students: Student[] = [];
  parentId: number = 0;

  constructor(
    private medicalHistoryService: MedicalHistoryService,
    private studentService: StudentService,
    private languageService: LanguageService,
    private apiService: ApiService, 
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
    this.loadParentStudents();
  }

  ngOnDestroy(): void {  
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private getParentIdFromToken(): number {
    try {
      const token = localStorage.getItem('current_token');
      if (token) {
        const decodedToken: TokenData = jwtDecode(token);
        return decodedToken.id;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    return 0;
  }

  async loadParentStudents() {
    try {
      this.parentId = this.getParentIdFromToken();
      if (this.parentId > 0) {
        const domainName = this.apiService.GetHeader();
        const students = await firstValueFrom(
          this.studentService.Get_By_ParentID(this.parentId, domainName)
        );
        this.students = students;
        
        // Reset studentId to 0 (no selection) regardless of how many students
        if (!this.editMode) {
          this.medicalHistory.studentId = 0;
        }
      }
    } catch (error) { 
      this.showErrorAlert('Failed to load students');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['medicalHistoryData']) {
      if (this.medicalHistoryData) {
        this.editMode = true;
        this.medicalHistory = { ...this.medicalHistoryData };
        this.firstReportPreview = this.medicalHistory.firstReport as any;
        this.secReportPreview = this.medicalHistory.secReport as any;
      } else {
        this.resetForm();
      }
    }
  }

  private async showErrorAlert(errorMessage: string) {
    const translatedTitle = this.translate.instant('Error');
    const translatedButton = this.translate.instant('Okay');

    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      icon: 'error',
      title: translatedTitle,
      text: errorMessage,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  private async showSuccessAlert(message: string) {
    const translatedTitle = this.translate.instant('Success');
    const translatedButton = this.translate.instant('Okay');

    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      icon: 'success',
      title: translatedTitle,
      text: message,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  private resetForm() {
    this.editMode = false;
    this.medicalHistory = {
      id: 0,
      studentId: 0, // Always reset to 0 (no selection)
      details: '',
      permanentDrug: '',
      firstReport: null,
      secReport: null,
      insertedAt: new Date().toISOString(),
      updatedAt: null,
      insertedByUserId: 0,
      en_name: ''
    };
    this.firstReportPreview = null;
    this.secReportPreview = null;
  }

  onFileUpload(event: Event, field: 'firstReport' | 'secReport') {
    const input = event.target as HTMLInputElement;
    this.validationErrors[field] = '';
    
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileType = file.type;
      const maxSize = 25 * 1024 * 1024; // 25MB

      this.medicalHistory[field] = null;
      
      if (!fileType.startsWith('image/') && !fileType.startsWith('video/')) {
        this.validationErrors[field] = 'Invalid file type. Please upload an image or video.';
        return;
      }

      if (file.size > maxSize) {
        this.validationErrors[field] = 'File size exceeds maximum limit of 25MB.';
        return;
      }

      this.medicalHistory[field] = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (field === 'firstReport') {
          this.firstReportPreview = e.target.result;
        } else {
          this.secReportPreview = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  isFormValid(): boolean {
    this.validationErrors = {};
    let isValid = true;

    // Student selection validation - must select a student (value should not be 0)
    if (!this.medicalHistory.studentId || this.medicalHistory.studentId === 0) {
      this.validationErrors['studentId'] = '*Please select a student';
      isValid = false;
    }

    if (!this.medicalHistory.details || this.medicalHistory.details.trim() === '') {
      this.validationErrors['details'] = '*Details are required';
      isValid = false;
    }

    return isValid;
  }

  async saveMedicalHistory() {
    if (this.isFormValid()) {
      try {
        this.isSaving = true;
        const domainName = this.apiService.GetHeader();

        if (this.editMode) {
          await firstValueFrom(
            this.medicalHistoryService.UpdateByParentAsync(this.medicalHistory, domainName)
          );
          this.showSuccessAlert('Medical history updated successfully!');
        } else {
          await firstValueFrom(
            this.medicalHistoryService.AddByParent(this.medicalHistory, domainName)
          );
          this.showSuccessAlert('Medical history created successfully!');
        }

        this.onSave.emit();
        this.closeModal();
      } catch (error:any) {
        const errorMessage = error.error?.message || error.error || this.translate.instant('Failed to save the item');
        this.showErrorAlert(errorMessage);
      } finally {
        this.isSaving = false;
      }
    }
  }

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
  }
}