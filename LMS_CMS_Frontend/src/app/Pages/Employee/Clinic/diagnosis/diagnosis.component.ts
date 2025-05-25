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

@Component({
  selector: 'app-diagnosis',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, ModalComponent, TableComponent],
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.css'],
})
export class DiagnosisComponent implements OnInit {
  diagnosis: Diagnosis = new Diagnosis(0, '', new Date(), 0);
  editDiagnosis = false;
  validationErrors: { [key: string]: string } = {};
  keysArray: string[] = ['id', 'name'];
  key: string = "id";
  value: any = "";
  isModalVisible = false;
  diagnoses: Diagnosis[] = [];
  DomainName: string = '';

  constructor(
    private diagnosisService: DiagnosisService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.DomainName = this.apiService.GetHeader(); 
    this.getDiagnoses();
  }

 
async getDiagnoses() {
  try {
    const data = await firstValueFrom(this.diagnosisService.Get(this.DomainName));
    this.diagnoses = data.map((item) => {
      const insertedAtDate = new Date(item.insertedAt);

      
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const formattedDate: string = insertedAtDate.toLocaleDateString(undefined, options);

      
      return {
        ...item,
        insertedAt: formattedDate, 
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
    
    // Disable the save button during submission
    this.isSaving = true;

    const operation = isEditing 
      ? this.diagnosisService.Edit(diagnosis, domainName)
      : this.diagnosisService.Add(diagnosis, domainName);

    operation.subscribe({
      next: () => {
        this.getDiagnoses();
        this.closeModal();
        Swal.fire('Success', `Diagnosis ${isEditing ? 'updated' : 'created'} successfully`, 'success');
        this.isSaving = false;
      },
      error: (err) => {
        console.error(`Error ${isEditing ? 'updating' : 'creating'} diagnosis:`, err);
        Swal.fire('Error', `Failed to ${isEditing ? 'update' : 'create'} diagnosis`, 'error');
        this.isSaving = false;
      }
    });
  }
}


deleteDiagnosis(row: any) {
  Swal.fire({
    title: 'Are you sure you want to delete this diagnosis?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#089B41',
    cancelButtonColor: '#17253E',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.diagnosisService.Delete(row.id, this.DomainName).subscribe({
        next: (response) => {
          this.getDiagnoses();
          
        },
        error: (error) => {
          console.error('Error deleting diagnosis:', error);
          Swal.fire('Error!', 'Failed to delete the diagnosis.', 'error');
        },
      });
    }
  });
}

  
  validateForm(): boolean {
    let isValid = true;
    if (!this.diagnosis.name) {
      this.validationErrors['name'] = '*Name is required';
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
    
    if (this.value != "") {
        this.diagnoses = this.diagnoses.filter((item: any) => { 
            const fieldValue = item[this.key as keyof typeof item];
            
            
            const searchString = this.value.toString().toLowerCase();
            const fieldString = fieldValue?.toString().toLowerCase() || '';
            
            
            return fieldString.includes(searchString);
        });
    }
}
}