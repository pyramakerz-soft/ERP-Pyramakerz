import { Component } from '@angular/core';
import { SalaryConfiguration } from '../../../../Models/HR/salary-configuration';
import { SalaryConfigurationService } from '../../../../Services/Employee/HR/salary-configuration.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-salary-configuration',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './salary-configuration.component.html',
  styleUrl: './salary-configuration.component.css'
})
export class SalaryConfigurationComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'name'];

  salaryConfiguration: SalaryConfiguration = new SalaryConfiguration();

  validationErrors: { [key in keyof SalaryConfiguration]?: string } = {};
  isLoading = false;

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private languageService: LanguageService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public SalaryConfigurationServ: SalaryConfigurationService, 
    private translate: TranslateService 
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

  GetAllData() {
    this.salaryConfiguration = new SalaryConfiguration();
    this.SalaryConfigurationServ.Get(this.DomainName).subscribe((d) => {
      this.salaryConfiguration = d;
    });
  }

isFormValid(): boolean {
  let isValid = true;
  this.validationErrors = {};
  
  if (this.salaryConfiguration.startDay > 28 || this.salaryConfiguration.startDay < 1) {
    isValid = false;
    this.validationErrors["startDay"] = this.translate.instant('Start day should be from 1 to 28');
  }
  return isValid;
}

  onInputValueChange(event: { field: keyof SalaryConfiguration; value: any }) {
    const { field, value } = event;
    (this.salaryConfiguration as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

 save() {
  if (this.isFormValid()) {
    this.isLoading = true;
    this.SalaryConfigurationServ.Edit(this.salaryConfiguration, this.DomainName).subscribe(
      (d) => {
        this.salaryConfiguration = d;
        this.showSuccessAlert(this.translate.instant('Salary configuration updated successfully'));
        this.GetAllData();
        this.isLoading = false;
      }, 
      error => {
        this.isLoading = false;
        const errorMessage = error.error?.message || this.translate.instant('Failed to update salary configuration');
        this.showErrorAlert(errorMessage);
      }
    );
  }
}

  validateNumber(event: any, field: keyof SalaryConfiguration): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.salaryConfiguration[field] === 'string') {
        this.salaryConfiguration[field] = '' as never;
      }
    }
  }

}
