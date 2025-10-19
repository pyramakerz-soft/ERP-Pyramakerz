import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../../Component/search/search.component';
import { ModalComponent } from '../../../../Component/modal/modal.component';
import Swal from 'sweetalert2';
import { TableComponent } from '../../../../Component/reuse-table/reuse-table.component';
import { ApiService } from '../../../../Services/api.service';
import { DiagnosisService } from '../../../../Services/Employee/Clinic/diagnosis.service';
import { Diagnosis } from '../../../../Models/Clinic/diagnosis';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';

@Component({
  selector: 'app-diagnosis',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SearchComponent,
    ModalComponent,
    TableComponent,
    TranslateModule,
  ],
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.css'],
})
export class DiagnosisComponent implements OnInit {
  diagnosis: Diagnosis = new Diagnosis(0, '', new Date(), 0);
  editDiagnosis = false;
  validationErrors: { [key: string]: string } = {};
  keysArray: string[] = ['id', 'name'];
  key: string = 'id';
  value: any = '';
  isModalVisible = false;
  diagnoses: Diagnosis[] = [];
  DomainName: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;

  constructor(
    private diagnosisService: DiagnosisService,
    private apiService: ApiService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.DomainName = this.apiService.GetHeader();
    this.getDiagnoses();

    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
    this.realTimeService.stopConnection();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private showErrorAlert(errorMessage: string) {
    const translatedTitle = this.translate.instant('Error');
    const translatedButton = this.translate.instant('Okay');

    Swal.fire({
      icon: 'error',
      title: translatedTitle,
      text: errorMessage,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  private showSuccessAlert(message: string) {
    const translatedTitle = this.translate.instant('Success');
    const translatedButton = this.translate.instant('Okay');

    Swal.fire({
      icon: 'success',
      title: translatedTitle,
      text: message,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  async getDiagnoses() {
    try {
      const data = await firstValueFrom(
        this.diagnosisService.Get(this.DomainName)
      );
      this.diagnoses = data.map((item) => {
        return {
          ...item,
          actions: { delete: true, edit: true },
        };
      });
    } catch (error) {
      console.error('Error loading data:', error);
      this.diagnoses = [];
    }
  }

  closeModal() {
    this.isModalVisible = false;
    this.diagnosis = new Diagnosis(0, '', new Date(), 0);
    this.editDiagnosis = false;
    this.validationErrors = {};
  }

  openModal(id?: number) {
    if (id) {
      this.editDiagnosis = true;
      const originalDiagnosis = this.diagnoses.find((diag) => diag.id === id)!;
      this.diagnosis = new Diagnosis(
        originalDiagnosis.id,
        originalDiagnosis.name,
        new Date(originalDiagnosis.insertedAt),
        originalDiagnosis.insertedByUserId
      );
    } else {
      this.diagnosis = new Diagnosis(0, '', new Date(), 0);
      this.editDiagnosis = false;
    }
    this.isModalVisible = true;
  }

  isSaving: boolean = false;
  saveDiagnosis() {
    if (this.validateForm()) {
      const isEditing = this.editDiagnosis;
      const domainName = this.DomainName;
      const diagnosis = { ...this.diagnosis };

      this.isSaving = true;

      const operation = isEditing
        ? this.diagnosisService.Edit(diagnosis, domainName)
        : this.diagnosisService.Add(diagnosis, domainName);

      operation.subscribe({
        next: () => {
          this.getDiagnoses();
          this.closeModal();
          const successMessage = isEditing
            ? this.translate.instant('Updated successfully')
            : this.translate.instant('Created successfully');
          this.showSuccessAlert(successMessage);
          this.isSaving = false;
        },
        error: (err) => {
          console.error(
            `Error ${isEditing ? 'updating' : 'creating'} diagnosis:`,
            err
          );
          const errorMessage =
            err.error?.message ||
            this.translate.instant(
              `Failed to ${isEditing ? 'update' : 'create'} diagnosis`
            );
          this.showErrorAlert(errorMessage);
          this.isSaving = false;
        },
      });
    }
  }

  deleteDiagnosis(row: any) {
    this.diagnosisService.Delete(row.id, this.DomainName).subscribe({
      next: (response) => {
        this.getDiagnoses();
        this.showSuccessAlert(this.translate.instant('Deleted successfully'));
      },
      error: (error) => {
        console.error('Error deleting diagnosis:', error);
        const errorMessage =
          error.error?.message ||
          this.translate.instant('Failed to delete the diagnosis');
        this.showErrorAlert(errorMessage);
      },
    });
  }

  validateForm(): boolean {
    let isValid = true;
    if (!this.diagnosis.name) {
      this.validationErrors['name'] = `${this.translate.instant(
        'Field is required'
      )} ${this.translate.instant('name')}`;
      isValid = false;
    } else {
      this.validationErrors['name'] = '';
    }
    return isValid;
  }

  onInputValueChange(event: { field: string; value: any }) {
    const { field, value } = event;
    (this.diagnosis as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;

    await this.getDiagnoses();

    if (this.value != '') {
      this.diagnoses = this.diagnoses.filter((item: any) => {
        const fieldValue = item[this.key as keyof typeof item];

        const searchString = this.value.toString().toLowerCase();
        const fieldString = fieldValue?.toString().toLowerCase() || '';

        return fieldString.includes(searchString);
      });
    }
  }

  GetTableHeaders() {
    if (!this.isRtl) {
      return ['ID', 'Diagnosis Name', 'Actions'];
    } else {
      return ['المعرف', 'اسم التشخيص', 'الإجراءات'];
    }
  }
}
