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
import { Drug } from '../../../../Models/Clinic/drug';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-drugs',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SearchComponent,
    ModalComponent,
    TableComponent,
    TranslateModule
  ],
  templateUrl: './drugs.component.html',
  styleUrls: ['./drugs.component.css'],
})
export class DrugsComponent implements OnInit {
  drug: Drug = new Drug(0, '', new Date());
  editDrug = false;
  validationErrors: { [key: string]: string } = {};
  keysArray: string[] = ['id', 'name'];
  key: string = 'id';
  value: any = '';
  isModalVisible = false;
  drugs: Drug[] = [];
  DomainName: string = '';
 isRtl: boolean = false;
  subscription!: Subscription;
  constructor(
    private drugService: DrugService,
    private apiService: ApiService ,
      private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.DomainName = this.apiService.GetHeader();
    this.getDrugs();

     this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
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
    this.drug = new Drug(0, '', new Date());
    this.editDrug = false;
    this.validationErrors = {};
  }

  openModal(id?: number) {
    if (id) {
      this.editDrug = true;
      const originalDrug = this.drugs.find((drug) => drug.id === id)!;
      this.drug = new Drug(
        originalDrug.id,
        originalDrug.name,
        new Date(originalDrug.insertedAt)
      );
    } else {
      this.drug = new Drug(0, '', new Date());
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

      // Disable the save button during submission
      this.isSaving = true;

      const operation = isEditing
        ? this.drugService.Edit(drug, domainName)
        : this.drugService.Add(drug, domainName);

      operation.subscribe({
        next: () => {
          this.getDrugs();
          this.closeModal();
          Swal.fire(
            'Success',
            `Drug ${isEditing ? 'updated' : 'created'} successfully`,
            'success'
          );
          this.isSaving = false;
        },
        error: (err) => {
          console.error(
            `Error ${isEditing ? 'updating' : 'creating'} drug:`,
            err
          );
          Swal.fire(
            'Error',
            `Failed to ${isEditing ? 'update' : 'create'} drug`,
            'error'
          );
          this.isSaving = false;
        },
      });
    }
  }

  deleteDrug(row: any) {
    Swal.fire({
      title: 'Are you sure you want to delete this drug?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.drugService.Delete(row.id, this.DomainName).subscribe({
          next: (response) => {
            this.getDrugs();
          },
          error: (error) => {
            console.error('Error deleting drug:', error);
            Swal.fire('Error!', 'Failed to delete the drug.', 'error');
          },
        });
      }
    });
  }

  validateForm(): boolean {
    let isValid = true;
    if (!this.drug.name) {
      this.validationErrors['name'] = '*Name is required';
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
GetTableHeaders(){
   
if(!this.isRtl){
  return ['ID', 'Drug Name', 'Date', 'Actions']
}else{
  return ['المعرف', 'اسم الدواء', 'التاريخ', 'الإجراءات']
}
}


}