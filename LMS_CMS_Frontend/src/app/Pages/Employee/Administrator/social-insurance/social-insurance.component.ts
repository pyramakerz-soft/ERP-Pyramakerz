import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';

import { SearchComponent } from '../../../../Component/search/search.component';
import { ApiService } from '../../../../Services/api.service';
import { AccountService } from '../../../../Services/account.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';

import { SocialInsurance, SocialInsuranceCreate } from '../../../../Models/Administrator/SocialInsurance';
import { SocialInsuranceService } from '../../../../Services/Employee/Administration/social-insurance.service';
import { TokenData } from '../../../../Models/token-data';

@Component({
  selector: 'app-social-insurance',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './social-insurance.component.html',
  styleUrls: ['./social-insurance.component.css'],
})
@InitLoader()
export class SocialInsuranceComponent implements OnInit, OnDestroy {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  TableData: SocialInsurance[] = [];
  DomainName: string = '';
  UserID: number = 0;
  isRtl: boolean = false;
  subscription!: Subscription;

  // Modal
  isModalVisible: boolean = false;
  mode: 'Create' | 'Edit' = 'Create';
 currentRecord: SocialInsuranceCreate = {
  insuranceOfficeName: '',
};


  validationErrors: { InsuranceOfficeName?: string } = {};
  isLoading: boolean = false;

  // Permissions
  AllowDelete: boolean = true;
  AllowDeleteForOthers: boolean = true;
  AllowEdit: boolean = true;
  AllowEditForOthers: boolean = true;

  // Search
  keysArray: string[] = ['insuranceOfficeName', 'condidateNane'];

  constructor(
    private account: AccountService,
    private apiServ: ApiService,
    private menuService: MenuService,
    private editDeleteServ: DeleteEditPermissionService,
    private languageService: LanguageService,
    private loadingService: LoadingService,
    private socialInsuranceServ: SocialInsuranceService
  ) {}

  ngOnInit(): void {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.apiServ.GetHeader();

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const page = this.menuService.findByPageName('social-insurance', items);
      if (page) {
        this.AllowDelete = page.allow_Delete;
        this.AllowDeleteForOthers = page.allow_Delete_For_Others;
        this.AllowEdit = page.allow_Edit;
        this.AllowEditForOthers = page.allow_Edit_For_Others;
      }
    });

    this.GetAllData();

    this.subscription = this.languageService.language$.subscribe((direction) => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }

  GetAllData() {
    this.TableData = [];
    this.socialInsuranceServ.Get(this.DomainName).subscribe((data) => {
      this.TableData = data;
    });
  }


Create() {
  this.mode = 'Create';
  this.currentRecord = { insuranceOfficeName: '' }; 
  this.validationErrors = {};
  this.openModal();
}


  async Delete(id: number) {
    const Swal = await import('sweetalert2').then((m) => m.default);

    Swal.fire({
      title: 'Are you sure you want to delete this record?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.socialInsuranceServ.Delete(id, this.DomainName).subscribe(() => {
          this.GetAllData();
          Swal.fire('Deleted!', 'Record has been deleted.', 'success');
        });
      }
    });
  }



CreateOREdit() {
  if (!this.isFormValid()) return;

  this.isLoading = true;

  if (this.mode === 'Create') {
    this.socialInsuranceServ.Add(this.currentRecord, this.DomainName).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
        this.GetAllData();
      },
      error: async (error) => {
        this.isLoading = false;
        const Swal = await import('sweetalert2').then(m => m.default);
        Swal.fire({ icon: 'error', title: 'Oops...', text: error.error || 'Something went wrong!' });
      }
    });
  }

  if (this.mode === 'Edit') {
    const editDto = { id: (this.currentRecord as any).id, insuranceOfficeName: this.currentRecord.insuranceOfficeName };
    this.socialInsuranceServ.Edit(editDto, this.DomainName).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
        this.GetAllData();
      },
      error: async (error) => {
        this.isLoading = false;
        const Swal = await import('sweetalert2').then(m => m.default);
        Swal.fire({ icon: 'error', title: 'Oops...', text: error.error || 'Something went wrong!' });
      }
    });
  }
}

  isFormValid(): boolean {
    this.validationErrors = {};
    let valid = true;

    if (!this.currentRecord.insuranceOfficeName || this.currentRecord.insuranceOfficeName.trim() === '') {
      this.validationErrors.InsuranceOfficeName = 'Insurance Office Name is required';
      valid = false;
    }

    return valid;
  }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }

Edit(record: SocialInsurance) {
  this.mode = 'Edit';
  this.currentRecord = {
    insuranceOfficeName: record.insuranceOfficeName
  } as SocialInsuranceCreate & { id: number };

  (this.currentRecord as any).id = record.id;
  this.openModal();
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

}

