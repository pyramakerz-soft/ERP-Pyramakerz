import { HrEmployeeReportComponent } from './../Reports/hr-employee-report/hr-employee-report.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { SearchComponent } from '../../../../Component/search/search.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { LanguageService } from '../../../../Services/shared/language.service';

import { BounsCategory, BounsCategoryCreate } from '../../../../Models/HR/bounsCategory';
import { BounsCategoryService } from '../../../../Services/Employee/HR/bouns-category.service';

@Component({
  selector: 'app-bouns-category',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './bouns-category.component.html',
  styleUrl: './bouns-category.component.css'
})
export class BounsCategoryComponent implements OnInit, OnDestroy {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  UserID: number = 0;
  DomainName: string = '';

  AllowEdit = true;
  AllowDelete = true;
  AllowEditForOthers = true;
  AllowDeleteForOthers = true;

  TableData: BounsCategory[] = [];
  filteredData: BounsCategory[] = [];

  isModalVisible = false;
  mode: 'Create' | 'Edit' = 'Create';
  isLoading = false;

  category: BounsCategory = new BounsCategory();
  validationErrors: { [key: string]: string } = {};

  key: string = 'EnNameCategory';
  value: any = '';
  keysArray: string[] = ['EnNameCategory', 'ArNameCategory'];

  isRtl = false;
  subscription!: Subscription;
  path = '';

  constructor(
    private account: AccountService,
    private menuService: MenuService,
    private translate: TranslateService,
    private domainServ: DomainService,
    private editDeleteServ: DeleteEditPermissionService,
    private apiServ: ApiService,
    private bounsCategoryServ: BounsCategoryService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.apiServ.GetHeader();

    this.menuService.menuItemsForEmployee$.subscribe(items => {
      const page = this.menuService.findByPageName('bouns-category', items);
      if (page) {
        this.AllowEdit = page.allow_Edit;
        this.AllowDelete = page.allow_Delete;
        this.AllowEditForOthers = page.allow_Edit_For_Others;
        this.AllowDeleteForOthers = page.allow_Delete_For_Others;
      }
    });

    this.GetAllData();

    this.subscription = this.languageService.language$.subscribe(dir => {
      this.isRtl = dir === 'rtl';
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  // ================= Data =================
  GetAllData() {
    this.bounsCategoryServ.Get(this.DomainName).subscribe(d => {
      this.TableData = d;
      this.filteredData = [...d];
    });
  }

  // ================= Actions =================
  Create() {
    this.mode = 'Create';
    this.category = new BounsCategory();
    this.validationErrors = {};
    this.openModal();
  }

  Edit(row: BounsCategory) {
    this.mode = 'Edit';
    this.category = { ...row };
    this.validationErrors = {};
    this.openModal();
  }

  // Delete(id: number) {
  //   this.bounsCategoryServ.Delete(id, this.DomainName).subscribe(() => {
  //     this.GetAllData();
  //   });
  // }
  async Delete(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: this.translate.instant('Are you sure you want to delete this bank information?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.bounsCategoryServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData();
          this.showSuccessAlert(this.translate.instant('Deleted successfully'));
        });
      }
    });
  }


  CreateOREdit() {
    if (!this.isFormValid()) return;

    this.isLoading = true;

    if (this.mode === 'Create') {
      const payload: BounsCategoryCreate = {
        enNameCategory: this.category.enNameCategory,
        arNameCategory: this.category.arNameCategory
      };

      this.bounsCategoryServ.Add(payload, this.DomainName).subscribe(() => {
        this.afterSave();
      });
    } else {
      this.bounsCategoryServ.Edit(this.category, this.DomainName).subscribe(() => {
        this.afterSave();
      });
    }
  }

  afterSave() {
    this.isLoading = false;
    this.closeModal();
    this.GetAllData();
  }

  // ================= Helpers =================
  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }

  isFormValid(): boolean {
    this.validationErrors = {};
    let valid = true;

    if (!this.category.arNameCategory?.trim()) {
      this.validationErrors['ArNameCategory'] = this.getRequiredMsg('Arabic Name');
      valid = false;
    }

    if (!this.category.enNameCategory?.trim()) {
      this.validationErrors['EnNameCategory'] = this.getRequiredMsg('English Name');
      valid = false;
    }

    return valid;
  }

  getRequiredMsg(field: string): string {
    const f = this.translate.instant(field);
    const r = this.translate.instant('Is Required');
    return this.isRtl ? `${r} ${f}` : `${f} ${r}`;
  }

  onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value?.toLowerCase();

    if (!this.value) {
      this.filteredData = [...this.TableData];
      return;
    }

    this.filteredData = this.TableData.filter(x =>
      (x as any)[this.key]?.toLowerCase().includes(this.value)
    );
  }

IsAllowDelete(InsertedByID: number): boolean {
  const IsAllow = this.editDeleteServ.IsAllowDelete(
    InsertedByID,
    this.UserID,
    this.AllowDeleteForOthers
  );
  return IsAllow;
}

IsAllowEdit(InsertedByID: number): boolean {
  const IsAllow = this.editDeleteServ.IsAllowEdit(
    InsertedByID,
    this.UserID,
    this.AllowEditForOthers
  );
  return IsAllow;
}


  private async showErrorAlert(errorMessage: string) {
    const translatedTitle = this.translate.instant('Error');
    const translatedButton = this.translate.instant('Okay');

    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      icon: 'error',
      title: translatedTitle,
      text: errorMessage,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  private async showSuccessAlert(message: string) {
    const translatedTitle = this.translate.instant('Success');
    const translatedButton = this.translate.instant('Okay');

    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      icon: 'success',
      title: translatedTitle,
      text: message,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }
}

