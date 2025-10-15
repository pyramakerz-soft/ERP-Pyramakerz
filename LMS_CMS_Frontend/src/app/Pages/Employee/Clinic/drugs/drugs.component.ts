import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../../Component/search/search.component';
import { ModalComponent } from '../../../../Component/modal/modal.component';
import Swal from 'sweetalert2';
import { TableComponent } from '../../../../Component/reuse-table/reuse-table.component';
import { ApiService } from '../../../../Services/api.service';
import { DrugService } from '../../../../Services/Employee/Clinic/drug.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { DrugClass } from '../../../../Models/Clinic/drug-class';
@Component({
  selector: 'app-drugs',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SearchComponent,
    ModalComponent,
    TableComponent,
    TranslateModule,
  ],
  templateUrl: './drugs.component.html',
  styleUrls: ['./drugs.component.css'],
})
export class DrugsComponent implements OnInit {
  drug: DrugClass = new DrugClass(0, '', new Date());
  editDrug = false;
  validationErrors: { [key: string]: string } = {};
  keysArray: string[] = ['id', 'name'];
  key: string = 'id';
  value: any = '';
  isModalVisible = false;
  drugs: DrugClass[] = [];
  DomainName: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  constructor(
    private drugService: DrugService,
    private apiService: ApiService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.DomainName = this.apiService.GetHeader();
    this.getDrugs();

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

  async getDrugs() {
    try {
      const data = await firstValueFrom(this.drugService.Get(this.DomainName));
      this.drugs = data.map((item) => {
        const insertedAtDate = new Date(item.insertedAt);

        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };
        const formattedDate: string = insertedAtDate.toLocaleDateString(
          undefined,
          options
        );

        return {
          ...item,
          insertedAt: formattedDate,
          actions: { delete: true, edit: true },
        };
      });
    } catch (error) {
      console.error('Error loading data:', error);
      this.drugs = [];
    }
  }

  closeModal() {
    this.isModalVisible = false;
    this.drug = new DrugClass(0, '', new Date());
    this.editDrug = false;
    this.validationErrors = {};
  }

  openModal(id?: number) {
    if (id) {
      this.editDrug = true;
      const originalDrug = this.drugs.find((drug) => drug.id === id)!;
      this.drug = new DrugClass(
        originalDrug.id,
        originalDrug.name,
        new Date(originalDrug.insertedAt)
      );
    } else {
      this.drug = new DrugClass(0, '', new Date());
      this.editDrug = false;
    }
    this.isModalVisible = true;
  }

  isSaving: boolean = false;

  saveDrug() {
    if (this.validateForm()) {
      const isEditing = this.editDrug;
      const domainName = this.DomainName;
      const drug = { ...this.drug };

      this.isSaving = true;

      const operation = isEditing
        ? this.drugService.Edit(drug, domainName)
        : this.drugService.Add(drug, domainName);

      operation.subscribe({
        next: () => {
          this.getDrugs();
          this.closeModal();
          const successMessage = isEditing
            ? this.translate.instant('Updated successfully')
            : this.translate.instant('Created successfully');
          this.showSuccessAlert(successMessage);
          this.isSaving = false;
        },
        error: (err) => {
          console.error(
            `Error ${isEditing ? 'updating' : 'creating'} drug:`,
            err
          );
          const errorMessage =
            err.error?.message ||
            this.translate.instant(
              `Failed to ${isEditing ? 'update' : 'create'} drug`
            );
          this.showErrorAlert(errorMessage);
          this.isSaving = false;
        },
      });
    }
  }

  deleteDrug(row: any) {
    this.drugService.Delete(row.id, this.DomainName).subscribe({
      next: (response) => {
        this.getDrugs();
        this.showSuccessAlert(this.translate.instant('Deleted successfully'));
      },
      error: (error) => {
        console.error('Error deleting drug:', error);
        const errorMessage =
          error.error?.message ||
          this.translate.instant('Failed to delete the drug');
        this.showErrorAlert(errorMessage);
      },
    });
  }

  validateForm(): boolean {
    let isValid = true;
    if (!this.drug.name) {
      this.validationErrors['name'] = `${this.translate.instant('Name is required')}`;
      isValid = false;
    } else {
      this.validationErrors['name'] = '';
    }
    return isValid;
  }

  onInputValueChange(event: { field: string; value: any }) {
    const { field, value } = event;
    (this.drug as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;

    await this.getDrugs();

    if (this.value != '') {
      this.drugs = this.drugs.filter((item: any) => {
        const fieldValue = item[this.key as keyof typeof item];

        const searchString = this.value.toString().toLowerCase();
        const fieldString = fieldValue?.toString().toLowerCase() || '';

        return fieldString.includes(searchString);
      });
    }
  }
  GetTableHeaders() {
    if (!this.isRtl) {
      return ['ID', 'Drug Name', 'Date', 'Actions'];
    } else {
      return ['المعرف', 'اسم الدواء', 'التاريخ', 'الإجراءات'];
    }
  }
}