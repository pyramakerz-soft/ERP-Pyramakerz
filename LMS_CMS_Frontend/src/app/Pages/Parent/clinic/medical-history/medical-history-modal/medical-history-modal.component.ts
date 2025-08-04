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
  selector: 'app-medical-history-modal',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './medical-history-modal.component.html',
  styleUrls: ['./medical-history-modal.component.css'],
})
export class MedicalHistoryModalComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() medicalHistoryData: ParentMedicalHistory | null = null;
  @Output() isVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<void>();

  editMode = false;
  medicalHistory: ParentMedicalHistory = new ParentMedicalHistory(
    0,
    '',
    '',
    null,
    null,
    new Date().toISOString(),
    null,
    0,
    ''
  );
  firstReportPreview: string | null = null;
  secReportPreview: string | null = null;
  validationErrors: { [key: string]: string } = {};

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
        this.firstReportPreview = this.medicalHistory.firstReport
          ? this.getFilePreview(this.medicalHistory.firstReport)
          : null;
        this.secReportPreview = this.medicalHistory.secReport
          ? this.getFilePreview(this.medicalHistory.secReport)
          : null;
      } else {
        this.editMode = false;
        this.medicalHistory = new ParentMedicalHistory(
          0,
          '',
          '',
          null,
          null,
          new Date().toISOString(),
          null,
          0,
          ''
        );
        this.firstReportPreview = null;
        this.secReportPreview = null;
      }
    }
  }

  onFileUpload(event: Event, field: 'firstReport' | 'secReport') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileType = file.type;
      if (fileType.startsWith('image/') || fileType.startsWith('video/')) {
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
      } else {
        alert('Invalid file type. Please upload an image or video.');
      }
    }
  }

  isFormValid(): boolean {
    this.validationErrors = {};
    let isValid = true;

    if (
      !this.medicalHistory.details ||
      this.medicalHistory.details.trim() === ''
    ) {
      this.validationErrors['details'] = '*Details are required';
      isValid = false;
    }

    if (
      !this.medicalHistory.permanentDrug ||
      this.medicalHistory.permanentDrug.trim() === ''
    ) {
      this.validationErrors['permanentDrug'] = '*Permanent Drug is required';
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
          // No edit for parent in your backend, but if needed, add here
        } else {
          await firstValueFrom(
            this.medicalHistoryService.AddByParent(
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

    // Reset form data and validation errors when closing
    this.editMode = false;
    this.medicalHistory = new ParentMedicalHistory(
      0,
      '',
      '',
      null,
      null,
      new Date().toISOString(),
      null,
      0,
      ''
    );
    this.firstReportPreview = null;
    this.secReportPreview = null;
    this.validationErrors = {};
  }

  private getFilePreview(file: File | string | null): string | null {
    if (!file) return null;
    if (typeof file === 'string') return file;
    // If file is a File object, create a preview URL
    return URL.createObjectURL(file);
  }
}
