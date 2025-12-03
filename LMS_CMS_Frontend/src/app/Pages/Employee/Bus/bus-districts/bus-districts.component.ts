import { Component } from '@angular/core';
import { BusType } from '../../../../Models/Bus/bus-type';
import { TokenData } from '../../../../Models/token-data';
import { Domain } from '../../../../Models/domain';
import { MenuService } from '../../../../Services/shared/menu.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { BusDistrictService } from '../../../../Services/Employee/Bus/bus-district.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { ApiService } from '../../../../Services/api.service';
import { SearchComponent } from '../../../../Component/search/search.component';
import { firstValueFrom } from 'rxjs';
// import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
@Component({
  selector: 'app-bus-Districts',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent, TranslateModule],
  templateUrl: './bus-districts.component.html',
  styleUrl: './bus-districts.component.css'
})

@InitLoader()
export class BusDistrictsComponent {

  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  busDistrict: BusType = new BusType(0, "", 0);

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: BusType[] = []
  DomainData: Domain[] = []

  DomainName: string = "";
  UserID: number = 0;

  IsChoosenDomain: boolean = false;
  IsEmployee: boolean = true;

  isModalVisible: boolean = false;
  mode: string = "";
 isRtl: boolean = false;
  subscription!: Subscription;
  path: string = ""
  key: string = "id";
  value: any = "";
  keysArray: string[] = ['id', 'name'];

  validationErrors: { [key in keyof BusType]?: string } = {};
  isLoading = false;

  constructor(private router: Router, 
    public activeRoute: ActivatedRoute, 
    private menuService: MenuService, 
    private translate: TranslateService,
    public account: AccountService, 
    public busDistrictServ: BusDistrictService, 
    public DomainServ: DomainService, 
    public EditDeleteServ: DeleteEditPermissionService, 
    public ApiServ: ApiService ,
    private languageService: LanguageService,
    private loadingService: LoadingService) { }

  ngOnInit() {

    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    if (this.User_Data_After_Login.type === "employee") {
      this.IsChoosenDomain = true;
      this.DomainName = this.ApiServ.GetHeader();

      this.activeRoute.url.subscribe(url => {
        this.path = url[0].path
      });

      this.GetTableData();
      this.menuService.menuItemsForEmployee$.subscribe((items) => {
        const settingsPage = this.menuService.findByPageName(this.path, items);
        if (settingsPage) {
          this.AllowEdit = settingsPage.allow_Edit;
          this.AllowDelete = settingsPage.allow_Delete;
          this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others
          this.AllowEditForOthers = settingsPage.allow_Edit_For_Others
        }
      });
    } else if (this.User_Data_After_Login.type === "octa") {
      this.GetAllDomains();
      this.IsEmployee = false;
      this.AllowEdit = true;
      this.AllowDelete = true;
    }
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


  Create() {
    this.mode = "add";
    this.openModal();
  }
  
  GetAllDomains() {
    this.DomainServ.Get().subscribe((data) => {
      this.DomainData = data;
    })
  }

  async GetTableData() {
    this.TableData = [];
    try {
      const data = await firstValueFrom(this.busDistrictServ.Get(this.DomainName));
      this.TableData = data;
    } catch (error) {
      this.TableData = [];
    }
  }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.busDistrict = new BusType()
    this.isModalVisible = false;
    this.validationErrors = {};
  }

  async Delete(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);

     Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('District') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.busDistrictServ.Delete(id, this.DomainName).subscribe((data) => {
          this.GetTableData();
        }
        );
      }
    });
  }

  Edit(id: number) {
    this.mode = "edit";
    const typeToEdit = this.TableData.find((t) => t.id === id);
    if (typeToEdit) {
      this.busDistrict = { ...typeToEdit };
      this.openModal();
    } else {
      console.error("Type not found!");
    }
  }

  capitalizeField(field: keyof BusType): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

isFormValid(): boolean {
  let isValid = true;
  for (const key in this.busDistrict) {
    if (this.busDistrict.hasOwnProperty(key)) {
      const field = key as keyof BusType;
      if (!this.busDistrict[field]) {
        if(field == "name"){
          this.validationErrors[field] = this.getRequiredErrorMessage(
            this.capitalizeField(field)
          );
          isValid = false;
        }
      } else {
        this.validationErrors[field] = '';
      }
    }
  }

  if (this.busDistrict.name.length > 100) {
    isValid = false;
    this.validationErrors['name'] = this.translate.instant('Name cannot be longer than 100 characters.');
  }

  return isValid;
}

  onInputValueChange(event: { field: keyof BusType, value: any }) {
    const { field, value } = event;
    if (field == "name") {
      (this.busDistrict as any)[field] = value;
      if (value) {
        this.validationErrors[field] = '';
      }
    }
  }

  AddNewType() {
    this.isLoading = true;
    this.busDistrictServ.Add(this.busDistrict, this.DomainName).subscribe((data) => {
      this.closeModal();
      this.GetTableData();
      this.isLoading = false; // Hide spinner
      this.busDistrict = new BusType()
    },
      error => {
      this.isLoading = false; // Hide spinner
      });
  }

  Save() {
    this.isLoading = true;
    this.busDistrictServ.Edit(this.busDistrict, this.DomainName).subscribe(() => {
      this.GetTableData();
      this.closeModal();
      this.isLoading = false; // Hide spinner
      this.busDistrict = new BusType()
    },
    error => {
    this.isLoading = false; // Hide spinner
    });
}

  CreateOREdit() {
    if(this.isFormValid()){
      if (this.mode === "add") {
        this.AddNewType();
      }
      else if (this.mode === "edit") {
        this.Save();
      }
    }
  }

  getBusDataByDomainId(event: Event) {
    this.IsChoosenDomain = true;
    const selectedValue: string = ((event.target as HTMLSelectElement).value);
    this.DomainName = selectedValue;
    this.GetTableData();
  }

  IsAllowDelete(InsertedByID: number) {
    if (this.IsEmployee == false) { return true; }
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID, this.UserID, this.AllowDeleteForOthers);
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    if (this.IsEmployee == false) { return true; }
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  async onSearchEvent(event: { key: string, value: any }) {
    this.key = event.key;
    this.value = event.value;

    const data: BusType[] = await firstValueFrom(
      this.busDistrictServ.Get(this.DomainName)
    );

    this.TableData = data || [];
 
    if (this.value != "") {
      const numericValue = isNaN(Number(this.value)) ? this.value : parseInt(this.value, 10);

      this.TableData = this.TableData.filter(t => {
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
