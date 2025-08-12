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
import { ParentMedicalHistory } from '../../../../../Models/Clinic/MedicalHistory';
import { MedicalHistoryService } from '../../../../../Services/Employee/Clinic/medical-history.service';
import { ApiService } from '../../../../../Services/api.service';

@Component({
  selector: 'app-parent-medical-history-modal',
  imports: [FormsModule, CommonModule],
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
  secReportPreview: File | null = null;
  validationErrors: { [key: string]: string } = {};
  isSaving: boolean = false;

  constructor(
    private medicalHistoryService: MedicalHistoryService,
    private apiService: ApiService
  ) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['medicalHistoryData']) {
      if (this.medicalHistoryData) {
        this.editMode = true;
        this.medicalHistory = { ...this.medicalHistoryData };
        this.firstReportPreview = this.medicalHistory.firstReport;
        this.secReportPreview = this.medicalHistory.secReport;
      } else {
        this.resetForm();
      }
    }
  }

  private resetForm() {
    this.editMode = false;
    this.medicalHistory = {
      id: 0,
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
          Swal.fire('Success', 'Medical history updated successfully!', 'success');
        } else {
          await firstValueFrom(
            this.medicalHistoryService.AddByParent(this.medicalHistory, domainName)
          );
          Swal.fire('Success', 'Medical history created successfully!', 'success');
        }

        this.onSave.emit();
        this.closeModal();
      } catch (error) {
        console.error('Error saving medical history:', error);
        Swal.fire('Error', 'Failed to save medical history. Please try again later.', 'error');
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