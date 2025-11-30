import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
// import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { Supplier } from '../../../../Models/Accounting/supplier';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { Debit } from '../../../../Models/Accounting/debit';
import { AccountingTreeChart } from '../../../../Models/Accounting/accounting-tree-chart';
import { DebitService } from '../../../../Services/Employee/Accounting/debit.service';
import { firstValueFrom } from 'rxjs';
import { AccountingTreeChartService } from '../../../../Services/Employee/Accounting/accounting-tree-chart.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
@Component({
  selector: 'app-debits',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './debits.component.html',
  styleUrl: './debits.component.css'
})

@InitLoader()
export class DebitsComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: Debit[] = [];

  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'name', 'accountNumberName'];

  debit: Debit = new Debit();

  AccountNumbers: AccountingTreeChart[] = [];
  validationErrors: { [key in keyof Debit]?: string } = {};
  isLoading = false

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private translate: TranslateService,
    public BusTypeServ: BusTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public DebitServ: DebitService,
    public accountServ: AccountingTreeChartService,
    private languageService: LanguageService, 
    private loadingService: LoadingService
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
    this.GetAllAccount()

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
    this.TableData = []
    this.DebitServ.Get(this.DomainName).subscribe((d) => {
      this.TableData = d;
    })

  }
  GetAllAccount() {
    this.accountServ.GetBySubAndFileLinkID(3, this.DomainName).subscribe((d) => {
      this.AccountNumbers = d;
    })
  }

  Create() {
    this.mode = 'Create';
    this.debit = new Debit();
    this.validationErrors = {}
    this.openModal();
  }

  async Delete(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('the') + this.translate.instant('Debit')+ this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.DebitServ.Delete(id, this.DomainName).subscribe((D) => {
          this.GetAllData();
        })
      }
    });
  }

  Edit(id: number) {
    this.mode = 'Edit';
    this.DebitServ.GetById(id, this.DomainName).subscribe((d) => {
      this.debit = d
    })
    this.openModal();
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(
      InsertedByID,
      this.UserID,
      this.AllowDeleteForOthers
    );
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(
      InsertedByID,
      this.UserID,
      this.AllowEditForOthers
    );
    return IsAllow;
  }

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true
      if (this.mode == 'Create') {
        this.DebitServ.Add(this.debit, this.DomainName).subscribe((d) => {
          this.closeModal();
          this.GetAllData();
        },
          async error => {
            this.isLoading = false

            const Swal = await import('sweetalert2').then(m => m.default);

            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          });
      }
      if (this.mode == 'Edit') {
        this.DebitServ.Edit(this.debit, this.DomainName).subscribe((d) => {
          this.closeModal();
          this.GetAllData();
        },
          async error => {
            this.isLoading = false

            const Swal = await import('sweetalert2').then(m => m.default);

            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          });
      }
    }
  }

  closeModal() {
    this.isModalVisible = false;
    this.validationErrors = {}
    this.isLoading = false
  }

  openModal() {
    this.isModalVisible = true;
  }

isFormValid(): boolean {
  let isValid = true;
  this.validationErrors = {}; // Clear previous errors
  
  // Validate required fields with translation
  if (!this.debit.name) {
    this.validationErrors['name'] = this.getRequiredErrorMessage('Name');
    isValid = false;
  }
  
  if (!this.debit.accountNumberID) {
    this.validationErrors['accountNumberID'] = this.getRequiredErrorMessage('Account Number');
    isValid = false;
  }

  // Validate name length
  if (this.debit.name && this.debit.name.length > 100) {
    isValid = false;
    this.validationErrors['name'] = this.translate.instant('Name cannot be longer than 100 characters');
  }
  
  return isValid;
}


  capitalizeField(field: keyof Debit): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof Debit; value: any }) {
    const { field, value } = event;
    (this.debit as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: Debit[] = await firstValueFrom(
        this.DebitServ.Get(this.DomainName)
      );
      this.TableData = data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.TableData = this.TableData.filter((t) => {
          const fieldValue = t[this.key as keyof typeof t];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(this.value.toLowerCase());
          }
          if (typeof fieldValue === 'number') {
            return fieldValue.toString().includes(numericValue.toString())
          }
          return fieldValue == this.value;
        });
      }
    } catch (error) {
      this.TableData = [];
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
}
