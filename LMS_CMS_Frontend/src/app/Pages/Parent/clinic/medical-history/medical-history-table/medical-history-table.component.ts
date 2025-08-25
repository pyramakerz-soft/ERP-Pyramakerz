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
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';

@Component({
  selector: 'app-parent-medical-history',
  standalone: true,
  imports: [FormsModule, CommonModule, TableComponent, SearchComponent, MedicalHistoryModalComponent, ParentMedicalHistoryModalComponent, TranslateModule],
  templateUrl: './medical-history-table.component.html',
  styleUrls: ['./medical-history-table.component.css'],
})
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
    private realTimeService: RealTimeNotificationServiceService,
  ) {}

  ngOnInit(): void {
    this.loadMedicalHistories();
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
}