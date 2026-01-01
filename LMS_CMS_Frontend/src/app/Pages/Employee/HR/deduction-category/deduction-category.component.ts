import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { LanguageService } from '../../../../Services/shared/language.service';

import {
  DeductionCategory,
  DeductionCategoryCreate
} from '../../../../Models/HR/deductionCategory';
import { DeductionCategoryService } from '../../../../Services/Employee/HR/deduction-category.service';

@Component({
  selector: 'app-deduction-category',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './deduction-category.component.html',
  styleUrl: './deduction-category.component.css'
})
export class DeductionCategoryComponent implements OnInit, OnDestroy {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  UserID = 0;
  DomainName = '';

  AllowEdit = true;
  AllowDelete = true;
  AllowEditForOthers = true;
  AllowDeleteForOthers = true;

  TableData: DeductionCategory[] = [];
  filteredData: DeductionCategory[] = [];

  isModalVisible = false;
  mode: 'Create' | 'Edit' = 'Create';
  isLoading = false;

  category: DeductionCategory = new DeductionCategory();
  validationErrors: { [key: string]: string } = {};

  isRtl = false;
  subscription!: Subscription;

  constructor(
    private account: AccountService,
    private menuService: MenuService,
    private translate: TranslateService,
    private editDeleteServ: DeleteEditPermissionService,
    private apiServ: ApiService,
    private deductionCategoryServ: DeductionCategoryService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.apiServ.GetHeader();

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
    this.deductionCategoryServ.Get(this.DomainName).subscribe(d => {
      this.TableData = d;
      this.filteredData = [...d];
    });
  }

  // ================= Actions =================
  Create() {
    this.mode = 'Create';
    this.category = new DeductionCategory();
    this.validationErrors = {};
    this.openModal();
  }

  Edit(row: DeductionCategory) {
    this.mode = 'Edit';
    this.category = { ...row };
    this.validationErrors = {};
    this.openModal();
  }

  async Delete(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: this.translate.instant('Are you sure?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then(res => {
      if (res.isConfirmed) {
        this.deductionCategoryServ.Delete(id, this.DomainName).subscribe(() => {
          this.GetAllData();
        });
      }
    });
  }

  CreateOREdit() {
    if (!this.isFormValid()) return;

    this.isLoading = true;

    if (this.mode === 'Create') {
      const payload: DeductionCategoryCreate = {
        enNameDeductionCategory: this.category.enNameDeductionCategory,
        arNameDeductionCategory: this.category.arNameDeductionCategory
      };

      this.deductionCategoryServ.Add(payload, this.DomainName).subscribe(() => {
        this.afterSave();
      });
    } else {
      this.deductionCategoryServ.Edit(this.category, this.DomainName).subscribe(() => {
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

    if (!this.category.arNameDeductionCategory?.trim()) {
      this.validationErrors['ArNameCategory'] = this.getRequiredMsg('Arabic Name');
      valid = false;
    }

    if (!this.category.enNameDeductionCategory?.trim()) {
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

  IsAllowDelete(insertedByUserId: number | null) {
    if (insertedByUserId == null) return true;
    return this.editDeleteServ.IsAllowDelete(
      insertedByUserId,
      this.UserID,
      this.AllowDeleteForOthers
    );
  }

  IsAllowEdit(insertedByUserId: number | null) {
    if (insertedByUserId == null) return true;
    return this.editDeleteServ.IsAllowEdit(
      insertedByUserId,
      this.UserID,
      this.AllowEditForOthers
    );
  }
}

