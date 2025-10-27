import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../../Component/search/search.component';
import { ModalComponent } from '../../../../Component/modal/modal.component';
import { TableComponent } from '../../../../Component/reuse-table/reuse-table.component';
import { DoseService } from '../../../../Services/Employee/Clinic/dose.service';
import { ApiService } from '../../../../Services/api.service';
import Swal from 'sweetalert2';
import { Dose } from '../../../../Models/Clinic/dose';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-doses',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, 
    ModalComponent, TableComponent , TranslateModule],
  templateUrl: './doses.component.html',
  styleUrls: ['./doses.component.css'],
})
export class DosesComponent implements OnInit {
  dose: Dose = new Dose(0, '', '');
  editDose = false;
  validationErrors: { [key: string]: string } = {};
  keysArray: string[] = ['id', 'doseTimes'];
  key: string = 'id';
  value: any = '';
  isModalVisible = false;
  doses: Dose[] = [];
  DomainName: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;

  constructor(private doseService: DoseService, 
    private apiService: ApiService,
      private languageService: LanguageService, private realTimeService: RealTimeNotificationServiceService , 
      private translate: TranslateService
) {}

  ngOnInit(): void {
    this.DomainName = this.apiService.GetHeader();
    this.getDoses();
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

async getDoses() {
  try {
    const data = await firstValueFrom(this.doseService.Get(this.DomainName));
    this.doses = data.map((item) => {
      return {
        ...item,
        actions: { delete: true, edit: true },
      };
    });
  } catch (error) {
    console.error('Error loading doses:', error);
    const errorMessage = this.translate.instant('Failed to load items');
    this.showErrorAlert(errorMessage);
  }
}

  closeModal() {
    this.isModalVisible = false;
    this.dose = new Dose(0, '', '');
    this.editDose = false;
    this.validationErrors = {};
  }

  openModal(id?: number) {
    if (id) {
      this.editDose = true;
      const originalDose = this.doses.find((d) => d.id === id)!;
      this.dose = new Dose(
        originalDose.id,
        originalDose.doseTimes,
        originalDose.insertedAt
      );
    } else {
      this.dose = new Dose(0, '', '');
      this.editDose = false;
    }
    this.isModalVisible = true;
  }
  
isSaving: boolean = false;

saveDose() {
  if (this.validateForm()) {
    const isEditing = this.editDose;
    const domainName = this.DomainName;
    const dose = { ...this.dose };
    
    this.isSaving = true;

    const operation = isEditing 
      ? this.doseService.Edit(dose, domainName)
      : this.doseService.Add(dose, domainName);

    operation.subscribe({
      next: () => {
        this.getDoses();
        this.closeModal();
        const successMessage = isEditing 
          ? this.translate.instant('Updated successfully')
          : this.translate.instant('Created successfully');
        this.showSuccessAlert(successMessage);
        this.isSaving = false;
      },
      error: (error) => {
        console.error(`Error ${isEditing ? 'updating' : 'creating'} dose:`, error);
        const errorMessage = error.error?.message || this.translate.instant('Failed to save the item');
        this.showErrorAlert(errorMessage);
        this.isSaving = false;
      }
    });
  }
}

deleteDose(row: Dose) {
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
      this.doseService.Delete(row.id, this.DomainName).subscribe({
        next: () => {
          this.getDoses();
          this.showSuccessAlert(successMessage);
        },
        error: (error) => {
          console.error('Error deleting dose:', error);
          const errorMessage = error.error?.message || this.translate.instant('Failed to delete the item');
          this.showErrorAlert(errorMessage);
        },
      });
    }
  });
}


// deleteDose(row: Dose) {
//   const translatedTitle = this.translate.instant('Are you sure?');
//   const translatedText = this.getDeleteMessage('dose');
//   const translatedConfirm = this.translate.instant('Yes, delete it!');
//   const translatedCancel = this.translate.instant('No, keep it');
//   const successMessage = this.translate.instant('Deleted successfully');

//   Swal.fire({
//     title: translatedTitle,
//     text: translatedText,
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonColor: '#089B41',
//     cancelButtonColor: '#17253E',
//     confirmButtonText: translatedConfirm,
//     cancelButtonText: translatedCancel,
//   }).then((result) => {
//     if (result.isConfirmed) {
//       this.doseService.Delete(row.id, this.DomainName).subscribe({
//         next: () => {
//           this.getDoses();
//           this.showSuccessAlert(successMessage);
//         },
//         error: (error) => {
//           console.error('Error deleting dose:', error);
//           const errorMessage = error.error?.message || this.translate.instant('Failed to delete the item');
//           this.showErrorAlert(errorMessage);
//         },
//       });
//     }
//   });
// }

// private getDeleteMessage(itemType: string): string {
//   const itemTranslated = this.translate.instant(itemType);
//   const messagePartTranslated = this.translate.instant('You will not be able to recover this');
  
//   if (this.isRtl) {
//     return `${itemTranslated} ${messagePartTranslated}!`;
//   } else {
//     return `${messagePartTranslated} ${itemTranslated}!`;
//   }
// }

validateForm(): boolean {
  this.validationErrors = {};
  if (!this.dose.doseTimes) {
    this.validationErrors['doseTimes'] = this.getRequiredErrorMessage('Dose');
    return false;
  }
  return true;
}


  onInputValueChange(event: { field: string; value: any }) {
    const { field, value } = event;
    (this.dose as any)[field] = value;
    if (value && this.validationErrors[field]) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    await this.getDoses();
    
    if (this.value) {
      this.doses = this.doses.filter(dose => {
        const fieldValue = dose[this.key as keyof typeof dose]?.toString().toLowerCase() || '';
        return fieldValue.includes(this.value.toString().toLowerCase());
      });
    }
  }

  // private handleError(message: string, error: any) {
  //   console.error(message, error);
  //   // Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  // }

  GetTableHeaders(){
    if(!this.isRtl){
      return ['ID', 'Doses', 'Actions']
    }else{
      return[
        "المعرف",
        "الجرعات",
        "الإجراءات"
      ]
    }
  }
}