import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../../../Component/reuse-table/reuse-table.component';
import Swal from 'sweetalert2';
import { MedicalHistoryService } from '../../../../../Services/Employee/Clinic/medical-history.service';
import { ApiService } from '../../../../../Services/api.service';
import { ParentMedicalHistory } from '../../../../../Models/Clinic/MedicalHistory';
import { SearchComponent } from '../../../../../Component/search/search.component';
import { MedicalHistoryModalComponent } from "../../../../Employee/Clinic/medical-history/medical-history-modal/medical-history-modal.component";
import { ParentMedicalHistoryModalComponent } from "../medical-history-modal/medical-history-modal.component";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { LoadingService } from '../../../../../Services/loading.service';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-parent-medical-history',
  standalone: true,
  imports: [FormsModule, CommonModule, TableComponent, SearchComponent,  ParentMedicalHistoryModalComponent, TranslateModule],
  templateUrl: './medical-history-table.component.html',
  styleUrls: ['./medical-history-table.component.css'],
})

@InitLoader()
export class ParentMedicalHistoryComponent implements OnInit {
  headers: string[] = ['ID', 'Details', 'Permanent Drug', 'Date', 'Actions'];
  keys: string[] = ['id', 'details', 'permanentDrug', 'insertedAt'];
  keysArray: string[] = ['id', 'details', 'permanentDrug'];
  medicalHistories: ParentMedicalHistory[] = [];
  isModalVisible = false;
  searchKey: string = 'id';
  searchValue: string = '';
  selectedMedicalHistory: ParentMedicalHistory | null = null;
  isRtl: boolean = false;
  subscription!: Subscription;
  constructor(
    private medicalHistoryService: MedicalHistoryService,
    private languageService: LanguageService,
    private apiService: ApiService, 
    private translate: TranslateService, // Add this 
    private loadingService: LoadingService 
  ) {}

  ngOnInit(): void {
    this.loadMedicalHistories();
        this.subscription = this.languageService.language$.subscribe(direction => {
    this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {  
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
      const data = await firstValueFrom(this.medicalHistoryService.GetByParent(domainName));
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

  openModal(row?: ParentMedicalHistory) {
    this.isModalVisible = true;
    this.selectedMedicalHistory = row || null;
  }

deleteMedicalHistory(row: any) {
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
    cancelButtonColor: '#2E3646',
    confirmButtonText: translatedConfirm,
    cancelButtonText: translatedCancel,
  }).then((result) => {
    if (result.isConfirmed) {
      const domainName = this.apiService.GetHeader();
      this.medicalHistoryService.Delete(row.id, domainName).subscribe({
        next: () => {
          if (this.medicalHistories.length === 1) {
            this.medicalHistories = [];
          }
          this.loadMedicalHistories();
          this.showSuccessAlert(successMessage);
        },
        error: (error) => {
          console.error('Error deleting medical history:', error);
          const errorMessage = error.error?.message || this.translate.instant('Failed to delete the item');
          this.showErrorAlert(errorMessage);
        },
      });
    }
  });
}
}