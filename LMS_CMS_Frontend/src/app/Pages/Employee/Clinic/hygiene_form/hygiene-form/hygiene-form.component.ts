import { Component, Input, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../../../Component/search/search.component';
import Swal from 'sweetalert2';
import { TableComponent } from '../../../../../Component/reuse-table/reuse-table.component';
import { Router } from '@angular/router';
import { HygieneFormService } from '../../../../../Services/Employee/Clinic/hygiene-form.service';
import { ApiService } from '../../../../../Services/api.service';
import { HygieneForm } from '../../../../../Models/Clinic/HygieneForm';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-hygiene-form',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TableComponent,
    SearchComponent,
    TranslateModule,
  ],
  templateUrl: './hygiene-form.component.html',
  styleUrls: ['./hygiene-form.component.css'],
})
export class HygieneFormComponent implements OnInit {
  @Input() students: any[] = [];
  @Input() hygieneTypes: any[] = [];

  hygieneForms: HygieneForm[] = [];
  originalHygieneForms: HygieneForm[] = [];
  hygieneForm: any = { id: null, grade: '', classes: '' };
  editHygieneForm = false;
  validationErrors: { [key: string]: string } = {};
  isModalVisible = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'school', 'grade', 'classRoom'];

  constructor(
    private router: Router,
    private hygieneFormService: HygieneFormService,
    private apiService: ApiService,
    private languageService: LanguageService, 
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.DomainName = this.apiService.GetHeader();
    this.loadHygieneForms();
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

  async loadHygieneForms() {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(
        this.hygieneFormService.Get(domainName)
      );
      this.originalHygieneForms = data.map((item) => ({
        ...item,
        school: item.school,
        grade: item.grade,
        classRoom: item.classRoom,
        date: new Date(item.date).toLocaleDateString(),
        actions: { delete: true, edit: true, view: true },
      }));
      // console.log(this.originalHygieneForms);

      this.hygieneForms = [...this.originalHygieneForms];
      console.log('Hygiene Forms Loaded:');
      console.log(this.hygieneForms);
    } catch (error) {
      console.error('Error fetching hygiene forms:', error);
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;

    // Always start with original data
    this.hygieneForms = [...this.originalHygieneForms];

    if (this.value) {
      this.hygieneForms = this.hygieneForms.filter((form) => {
        const fieldValue =
          form[this.key as keyof typeof form]?.toString().toLowerCase() || '';
        return fieldValue.includes(this.value.toString().toLowerCase());
      });
    }
  }

  // applySearchFilter() {
  //   const numericValue = isNaN(Number(this.value)) ? this.value : parseInt(this.value, 10);

  //   this.hygieneForms = this.hygieneForms.filter((form) => {
  //     const fieldValue = form[this.key as keyof HygieneForm];
  //     if (typeof fieldValue === 'string') {
  //       return fieldValue.toLowerCase().includes(this.value.toLowerCase());
  //     }
  //     if (typeof fieldValue === 'number') {
  //       return fieldValue === numericValue;
  //     }
  //     return false;
  //   });
  // }

  navigateToCreateHygieneForm() {
    this.router.navigate(['/Employee/Hygiene Form']);
  }

  openModal(id?: number) {
    if (id) {
      this.editHygieneForm = true;
      this.hygieneForm = this.hygieneForms.find((hf) => hf.id === id);
    } else {
      this.hygieneForm = { id: null, grade: '', classes: '' };
      this.editHygieneForm = false;
    }
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
    this.hygieneForm = { id: null, grade: '', classes: '' };
    this.editHygieneForm = false;
    this.validationErrors = {};
  }

  saveHygieneForm() {
    if (this.validateForm()) {
      if (this.editHygieneForm) {
        const index = this.hygieneForms.findIndex(
          (hf) => hf.id === this.hygieneForm.id
        );
        this.hygieneForms[index] = {
          ...this.hygieneForm,
          actions: { delete: true, edit: true },
        };
      } else {
        this.hygieneForm.id = this.hygieneForms.length + 1;
        this.hygieneForms.push({
          ...this.hygieneForm,
          date: new Date().toISOString().split('T')[0],
          actions: { delete: true, edit: true },
        });
      }
      this.closeModal();
    }
  }

  deleteHygieneForm(row: any) {
    const translatedTitle = this.translate.instant('Are you sure?');
    const translatedText = this.translate.instant(
      'You will not be able to recover this hygiene form!'
    );
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
        this.hygieneFormService.Delete(row.id, this.DomainName).subscribe({
          next: (response) => {
            if (this.hygieneForms.length === 1) {
              this.hygieneForms = [];
            }
            this.loadHygieneForms();
            this.showSuccessAlert(successMessage);
          },
          error: (error) => {
            console.error('Error deleting hygiene form:', error);
            const errorMessage =
              error.error?.message ||
              this.translate.instant('Failed to delete the item');
            this.showErrorAlert(errorMessage);
          },
        });
      }
    });
  }

  validateForm(): boolean {
    let isValid = true;
    if (!this.hygieneForm.grade) {
      this.validationErrors['grade'] = `${this.translate.instant(
        'Field is required'
      )} ${this.translate.instant('grade')}`;
      isValid = false;
    } else {
      this.validationErrors['grade'] = '';
    }
    if (!this.hygieneForm.classes) {
      this.validationErrors['classes'] = `${this.translate.instant(
        'Field is required'
      )} ${this.translate.instant('classes')}`;
      isValid = false;
    } else {
      this.validationErrors['classes'] = '';
    }
    return isValid;
  }

  onInputValueChange(event: { field: string; value: any }) {
    const { field, value } = event;
    this.hygieneForm[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  onView(row: any) {
    this.router.navigate(['/Employee/Hygiene Form', row.id]);
  }

  GetTableHeaders() {
    if (!this.isRtl) {
      return ['ID', 'School', 'Grade', 'Classes', 'Date', 'Actions'];
    } else {
      return [
        'المعرف',
        'المدرسة',
        'الصف الدراسي',
        'الفصول',
        'التاريخ',
        'الإجراءات',
      ];
    }
  }
}
