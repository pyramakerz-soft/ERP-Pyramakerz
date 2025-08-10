import { Component, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MedicalHistoryService } from '../../../../../Services/Employee/Clinic/medical-history.service';
import { ApiService } from '../../../../../Services/api.service';
import { ParentMedicalHistory } from '../../../../../Models/Clinic/MedicalHistory';
import { SearchComponent } from '../../../../../Component/search/search.component';
import { MedicalHistoryModalComponent } from '../medical-history-modal/medical-history-modal.component';
import { MedicalHistoryTableComponent as AppMedicalHistoryTableComponent } from './medical-history-table.component';
import { TableComponent } from "../../../../../Component/reuse-table/reuse-table.component";

@Component({
  selector: 'app-medical-history-table',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SearchComponent,
    MedicalHistoryModalComponent,
    AppMedicalHistoryTableComponent,
    TableComponent
],
  templateUrl: './medical-history-table.component.html',
  styleUrls: ['./medical-history-table.component.css'],
})
export class MedicalHistoryTableComponent implements OnInit {
  medicalHistories: ParentMedicalHistory[] = [];
  isModalVisible = false;
  selectedMedicalHistory: ParentMedicalHistory | null = null;
  searchKey: string = 'details';
  searchValue: string = '';
  keysArray: string[] = ['details', 'permanentDrug'];

  @ViewChild(MedicalHistoryModalComponent)
  medicalHistoryModal!: MedicalHistoryModalComponent;

  constructor(
    private medicalHistoryService: MedicalHistoryService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadMedicalHistories();
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.searchKey = event.key;
    this.searchValue = event.value;
    await this.loadMedicalHistories();
    if (this.searchValue) {
      this.medicalHistories = this.medicalHistories.filter((mh) => {
        const fieldValue =
          mh[this.searchKey as keyof typeof mh]?.toString().toLowerCase() || '';
        return fieldValue.includes(this.searchValue.toString().toLowerCase());
      });
    }
  }

  async loadMedicalHistories() {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(
        (this.medicalHistoryService as any).GetByParent(domainName)
      );
      this.medicalHistories = (data as ParentMedicalHistory[]).map((item) => ({
        ...item,
        insertedAt: new Date(item.insertedAt).toLocaleDateString(),
      }));
      if (this.searchValue) {
        this.medicalHistories = this.medicalHistories.filter((mh) => {
          const fieldValue =
            mh[this.searchKey as keyof typeof mh]?.toString().toLowerCase() ||
            '';
          return fieldValue.includes(this.searchValue.toString().toLowerCase());
        });
      }
    } catch (error) {
      console.error('Error loading medical histories:', error);
    }
  }

  openModal(row?: ParentMedicalHistory) {
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

  deleteMedicalHistory(row: ParentMedicalHistory) {
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
            Swal.fire(
              'Deleted!',
              'The medical history has been deleted.',
              'success'
            );
          },
          error: (error) => {
            console.error('Error deleting medical history:', error);
            Swal.fire(
              'Error',
              'Failed to delete medical history. Please try again later.',
              'error'
            );
          },
        });
      }
    });
  }
}
