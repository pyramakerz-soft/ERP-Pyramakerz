import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { Bank } from '../../../../Models/Accounting/bank';
import { BankService } from '../../../../Services/Employee/Accounting/bank.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
@Component({
  selector: 'app-bankinfor',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './bankinfor.component.html',
  styleUrl: './bankinfor.component.css'
})
@InitLoader()
export class BankinforComponent implements OnInit, OnDestroy {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: Bank[] = [];
  filteredData: Bank[] = [];
  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'bankName';
  value: any = '';
  keysArray: string[] = ['bankName', 'bankBranch'];

  bank: Bank = new Bank();
  validationErrors: { [key: string]: string } = {};
  isLoading = false;

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private translate: TranslateService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public BankServ: BankService,
    private languageService: LanguageService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });

    this.GetAllData();

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

  GetAllData() {
    this.TableData = [];
    this.BankServ.Get(this.DomainName).subscribe((d) => {
      this.TableData = d;
      this.filteredData = [...this.TableData];
    });
  }

  Create() {
    this.mode = 'Create';
    this.bank = new Bank();
    this.openModal();
    this.validationErrors = {};
  }

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
        this.BankServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData();
          this.showSuccessAlert(this.translate.instant('Deleted successfully'));
        });
      }
    });
  }

  Edit(row: Bank) {
    this.mode = 'Edit';
    this.BankServ.GetById(row.id, this.DomainName).subscribe((d) => {
      this.bank = d;
    });
    this.validationErrors = {};
    this.openModal();
  }

  IsAllowDelete(InsertedByID: number) {
    return this.EditDeleteServ.IsAllowDelete(
      InsertedByID,
      this.UserID,
      this.AllowDeleteForOthers
    );
  }

  IsAllowEdit(InsertedByID: number) {
    return this.EditDeleteServ.IsAllowEdit(
      InsertedByID,
      this.UserID,
      this.AllowEditForOthers
    );
  }

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true;

      // نسخ البيانات فقط للحقول المطلوبة
      const bankData: Bank = {
        ...this.bank,
        // يمكن إضافة قيم افتراضية للحقول الأخرى إذا لزم الأمر
        name: this.bank.bankName, // قد ترغب في تعيين name أيضاً
        bankAccountName: this.bank.bankName // أو أي قيمة افتراضية
      };

      if (this.mode == 'Create') {
        this.BankServ.Add(bankData, this.DomainName).subscribe(
          (d) => {
            this.GetAllData();
            this.isLoading = false;
            this.closeModal();
            this.showSuccessAlert(this.translate.instant('Created successfully'));
          },
          (error) => {
            this.isLoading = false;
            const errorMessage = error.error || this.translate.instant('Failed to create bank information');
            this.showErrorAlert(errorMessage);
          }
        );
      }
      if (this.mode == 'Edit') {
        this.BankServ.Edit(bankData, this.DomainName).subscribe(
          (d) => {
            this.GetAllData();
            this.isLoading = false;
            this.closeModal();
            this.showSuccessAlert(this.translate.instant('Updated successfully'));
          },
          (error) => {
            this.isLoading = false;
            const errorMessage = error.error || this.translate.instant('Failed to update bank information');
            this.showErrorAlert(errorMessage);
          }
        );
      }
    }
  }

  closeModal() {
    this.validationErrors = {};
    this.isModalVisible = false;
  }

  openModal() {
    this.isModalVisible = true;
  }

  isFormValid(): boolean {
    let isValid = true;
    this.validationErrors = {};

    if (!this.bank.bankName?.trim()) {
      this.validationErrors['bankName'] = this.getRequiredErrorMessage('Bank Name');
      isValid = false;
    }

    if (!this.bank.bankBranch?.trim()) {
      this.validationErrors['bankBranch'] = this.getRequiredErrorMessage('Bank Branch');
      isValid = false;
    }

    return isValid;
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

  onInputValueChange(field: string, value: any) {
    (this.bank as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value.toLowerCase();
    
    if (!this.value) {
      this.filteredData = [...this.TableData];
      return;
    }

    this.filteredData = this.TableData.filter((bank) => {
      const fieldValue = bank[this.key as keyof Bank];
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(this.value);
      }
      return false;
    });
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
}