import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { SearchComponent } from '../../../../Component/search/search.component';
import { ModalComponent } from '../../../../Component/modal/modal.component';
import Swal from 'sweetalert2';
import { TableComponent } from '../../../../Component/reuse-table/reuse-table.component';
import { ApiService } from '../../../../Services/api.service';
import { HygieneTypesService } from '../../../../Services/Employee/Clinic/hygiene-type.service';
import { HygieneTypes } from '../../../../Models/Clinic/hygiene-types';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';
@Component({
  selector: 'app-hygiene-types',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SearchComponent,
    ModalComponent,
    TableComponent,
    TranslateModule,
  ],
  templateUrl: './hygiene-types.component.html',
  styleUrls: ['./hygiene-types.component.css'],
})

@InitLoader()
export class HygieneTypesComponent implements OnInit {
  hygieneType: HygieneTypes = new HygieneTypes(0, '', 0);
  editHygieneType = false;

  validationErrors: { [key: string]: string } = {};
  keysArray: string[] = ['id', 'type'];
  key: string = 'id';
  value: any = '';
  isModalVisible = false;
  hygieneTypes: HygieneTypes[] = [];
  DomainName: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  constructor(
    private hygieneTypesService: HygieneTypesService,
    private apiService: ApiService,
    private languageService: LanguageService, 
    private translate: TranslateService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.DomainName = this.apiService.GetHeader();
    this.getHygieneTypes();
    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void { 
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private getRequiredErrorMessage(fieldName: string): string {
  const fieldTranslated = this.translate.instant(fieldName);
  const requiredTranslated = this.translate.instant('Is Required');
  
  if (this.isRtl) {
    return `${requiredTranslated} ${fieldTranslated}`;
  } else {
    return `${fieldTranslated} ${requiredTranslated}`;
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

  async getHygieneTypes() {
    try {
      const data = await firstValueFrom(
        this.hygieneTypesService.Get(this.DomainName)
      );
      console.log('Fetched hygiene types:', data);
      this.hygieneTypes = data.map((item) => {
        // const insertedAtDate = new Date(item.insertedAt);
        // const options: Intl.DateTimeFormatOptions = {
        //   year: 'numeric',
        //   month: 'long',
        //   day: 'numeric',
        // };
        // const formattedDate: string = insertedAtDate.toLocaleDateString(
        //   undefined,
        //   options
        // );

        return {
          ...item,
          // insertedAt: formattedDate,
          actions: { delete: true, edit: true },
        };
      });
    } catch (error) {
      console.error('Error loading data:', error);
      this.hygieneTypes = [];
    }
  }

  openModal(id?: number) {
    if (id) {
      this.editHygieneType = true;

      const originalHygieneType = this.hygieneTypes.find((ht) => ht.id === id)!;
      this.hygieneType = new HygieneTypes(
        originalHygieneType.id,
        originalHygieneType.type,
        // new Date(originalHygieneType.insertedAt),
        originalHygieneType.insertedByUserId
      );
    } else {
      this.hygieneType = new HygieneTypes(0, '', 0);
      this.editHygieneType = false;
    }
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
    this.hygieneType = new HygieneTypes(0, '', 0);
    this.editHygieneType = false;
    this.validationErrors = {};
  }

  isSaving: boolean = false;

  saveHygieneType() {
    if (this.validateForm()) {
      const isEditing = this.editHygieneType;
      const domainName = this.DomainName;
      const hygieneType = { ...this.hygieneType };

      this.isSaving = true;

      const operation = isEditing
        ? this.hygieneTypesService.Edit(hygieneType, domainName)
        : this.hygieneTypesService.Add(hygieneType, domainName);

      operation.subscribe({
        next: () => {
          this.getHygieneTypes();
          this.closeModal();
          const successMessage = isEditing
            ? this.translate.instant('Updated successfully')
            : this.translate.instant('Created successfully');
          this.showSuccessAlert(successMessage);
          this.isSaving = false;
        },
        error: (err) => {
          console.error(
            `Error ${isEditing ? 'updating' : 'creating'} hygiene type:`,
            err
          );
          const errorMessage =
            err.error?.message ||
            this.translate.instant(
              `Failed to ${isEditing ? 'update' : 'create'} hygiene type`
            );
          this.showErrorAlert(errorMessage);
          this.isSaving = false;
        },
      });
    }
  }

  private formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return dateObj.toLocaleDateString(undefined, options);
  }

  deleteHygieneType(row: any) {
      const translatedTitle = this.translate.instant('Are you sure?');
      const translatedText = this.translate.instant('You will not be able to recover this item!');
      const translatedConfirm = this.translate.instant('Yes, delete it!');
      const translatedCancel = this.translate.instant('No, keep it');
      const successMessage = this.translate.instant('Deleted successfully');
    
      Swal.fire({
        title: translatedTitle,
        text: translatedText,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#089B41',
        cancelButtonColor: '#17253E',
        confirmButtonText: translatedConfirm,
        cancelButtonText: translatedCancel,
      }).then((result) => {
        if (result.isConfirmed) {
    this.hygieneTypesService.Delete(row.id, this.DomainName).subscribe({
      next: (response) => {
        this.getHygieneTypes();
        this.showSuccessAlert(this.translate.instant('Deleted successfully'));
      },
      error: (error) => {
        console.error('Error deleting Hygiene Type:', error);
        const errorMessage =
          error.error?.message ||
          this.translate.instant('Failed to delete');
        this.showErrorAlert(errorMessage);
      },
    });
  }
    });
  }

  validateForm(): boolean {
    let isValid = true;
    if (!this.hygieneType.type) {
      this.validationErrors['name'] = this.getRequiredErrorMessage('Hygiene Type');
      isValid = false;
    } else {
      this.validationErrors['name'] = '';
    }
    return isValid;
  }

  onInputValueChange(event: { field: string; value: any }) {
    const { field, value } = event;
    (this.hygieneType as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;

    await this.getHygieneTypes();

    if (this.value != '') {
      this.hygieneTypes = this.hygieneTypes.filter((t) => {
        const fieldValue = t[this.key as keyof typeof t];

        const searchString = this.value.toString().toLowerCase();
        const fieldString = fieldValue?.toString().toLowerCase() || '';

        return fieldString.includes(searchString);
      });
    }
  }

  GetTableHeaders() {
    if (!this.isRtl) {
      return ['ID', 'Hygiene Type', 'Actions'];
    } else {
      return ['المعرف', 'نوع النظافة', 'الإجراءات'];
    }
  }
}
