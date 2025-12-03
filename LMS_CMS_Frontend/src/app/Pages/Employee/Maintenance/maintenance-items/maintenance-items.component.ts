import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { Router } from '@angular/router';
// import Swal from 'sweetalert2';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { AccountService } from '../../../../Services/account.service';
import { TokenData } from '../../../../Models/token-data';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaintenanceItem } from '../../../../Models/Maintenance/maintenance-item';
import { MaintenanceItemService } from '../../../../Services/Employee/Maintenance/maintenance-item.service';
import { ApiService } from '../../../../Services/api.service';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from '../../../../Services/shared/menu.service';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-maintenance-items',
  standalone: true,
  imports: [TranslateModule, SearchComponent, CommonModule, FormsModule],
  templateUrl: './maintenance-items.component.html',
  styleUrl: './maintenance-items.component.css'
})

@InitLoader()
export class MaintenanceItemsComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  UserID: number = 0;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  AllowEdit: boolean = true;
  AllowDelete: boolean = true;
  editItem: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  TableData: MaintenanceItem[] = [] 
  keysArray: string[] = ['id', 'en_Name', 'ar_Name'];
  key: string = "id";
  DomainName: string = '';
  value: any;
  IsChoosenDomain: boolean = false;
  selectedItem: MaintenanceItem | null = null;
  isLoading = false;
  isModalOpen = false;
  validationErrors: { [key in keyof MaintenanceItem]?: string } = {}; 
  academicDegree: MaintenanceItem = new MaintenanceItem(0,'','');
  mode: string = "";
  isEditMode = false;
  path: string = "";
  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;
  isDeleting: boolean = false;

  constructor(    
    private languageService: LanguageService,
    private router: Router,
    private apiService: ApiService,
    public account: AccountService, 
    private mainServ: MaintenanceItemService,
    private deleteEditPermissionServ: DeleteEditPermissionService, 
    private activeRoute: ActivatedRoute,
    private menuService: MenuService,
    private translate: TranslateService,
    private loadingService: LoadingService 
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    if (this.User_Data_After_Login.type === "employee") {
      this.IsChoosenDomain = true;
      this.DomainName = this.apiService.GetHeader();
      
      this.activeRoute.url.subscribe(url => {
        this.path = url[0].path;
      });
      this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
    }

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });

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

  GetAllData(DomainName: string, pageNumber: number, pageSize: number) {
    this.TableData = [];
    this.mainServ.GetWithPaggination(DomainName, pageNumber, pageSize).subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage;
        this.PageSize = data.pagination.pageSize;
        this.TotalPages = data.pagination.totalPages;
        this.TotalRecords = data.pagination.totalRecords;
        this.TableData = data.data;
      },
      (error) => {
        if (error.status == 404) {
          if (this.TotalRecords != 0) {
            let lastPage;
            if (this.isDeleting) {
              lastPage = (this.TotalRecords - 1) / this.PageSize;
            } else {
              lastPage = this.TotalRecords / this.PageSize;
            }
            if (lastPage >= 1) {
              if (this.isDeleting) {
                this.CurrentPage = Math.floor(lastPage);
                this.isDeleting = false;
              } else {
                this.CurrentPage = Math.ceil(lastPage);
              }
              this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
            }
          }
        } else {
          const errorMessage =
            error.error?.message ||
            this.translate.instant('Failed to load Data');
          this.showErrorAlert(errorMessage);
        }
      }
    );
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

  IsAllowDelete(InsertedByID: number): boolean {
    return this.deleteEditPermissionServ.IsAllowDelete(
      InsertedByID,
      this.UserID,
      this.AllowDeleteForOthers
    );
  }

  IsAllowEdit(InsertedByID: number): boolean {
    return this.deleteEditPermissionServ.IsAllowEdit(
      InsertedByID,
      this.UserID,
      this.AllowEditForOthers
    );
  }

  // async GetTableData() {
  //   this.TableData = [];
  //   try {
  //     const data = await firstValueFrom(this.mainServ.Get(this.DomainName)); 
  //     this.TableData = data;
  //   } catch (error) {
  //     this.TableData = [];
  //   }
  // }

  async Delete(id: number) {
    const deleteTitle = this.translate.instant('Are you sure you want to delete this item?');
    const deleteButton = this.translate.instant('Delete');
    const cancelButton = this.translate.instant('Cancel');

    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: deleteTitle,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: deleteButton,
      cancelButtonText: cancelButton
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.mainServ.Delete(id, this.DomainName).subscribe({
          next: () => {
            this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
            this.isLoading = false;
            this.showSuccessAlert(this.translate.instant('Item deleted successfully'));
          },
          error: (error) => {
            this.isLoading = false;
            const errorMessage = error.error?.message || this.translate.instant('Failed to delete item');
            this.showErrorAlert(errorMessage);
          }
        });
      }
    });
  }

  isFormValid(): boolean {
    let isValid = true;
    this.validationErrors = {};
    
    for (const key in this.selectedItem) { 
      if (this.selectedItem.hasOwnProperty(key)) {
        const field = key as keyof MaintenanceItem;
        if (!this.selectedItem[field]) {
          if (field == 'en_Name' || field == 'ar_Name') {
            this.validationErrors[field] = this.translate.instant('Field is required', { 
              field: this.capitalizeField(field) 
            });
            isValid = false;
          }
        } else { 
          this.validationErrors[field] = '';
        }
      }
    } 
    return isValid;
  }

  Edit(id: number) {
    const Item = this.TableData.find((row: any) => row.id === id);

    if (Item) {
      this.isEditMode = true;            
      this.selectedItem = { ...Item }; 
      this.openModal(false);              
    } else {
      console.error("Item not found with id:", id);
    }
  }



  async onSearchEvent(event: { key: string; value: any }) {
    this.PageSize = this.TotalRecords;
    this.CurrentPage = 1;
    this.TotalPages = 1;
    this.key = event.key;
    this.value = event.value;
    try {
      const data: any = await firstValueFrom(
        this.mainServ.GetWithPaggination(this.DomainName, this.CurrentPage, this.PageSize)
      );
      this.TableData = data.data || [];

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
            return fieldValue.toString().includes(numericValue.toString());
          }
          return fieldValue == this.value;
        });
      }
    } catch (error) {
      this.TableData = [];
    }
  }

  changeCurrentPage(currentPage: number) {
    this.CurrentPage = currentPage;
    this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
  }

  validatePageSize(event: any) {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
    }
  }

  get visiblePages(): number[] {
    const total = this.TotalPages;
    const current = this.CurrentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = current - half;
    let end = current + half;

    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  validateNumberPage(event: any): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      this.PageSize = 0;
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


  openModal(forNew: boolean = true) {
    if (forNew) {
      this.isEditMode = false;
      this.selectedItem = new MaintenanceItem(0, '', '');
    }
    this.isModalOpen = true;

    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  onInputValueChange(event: { field: keyof MaintenanceItem; value: any }) {
    const { field, value } = event;
    (this.selectedItem as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    } 
  }

  capitalizeField(field: keyof MaintenanceItem): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');   
    this.validationErrors = {};
  }

  Save() {  
    if (this.isFormValid()) {
      this.isLoading = true;    
      if (this.selectedItem?.id == 0) { 
        this.mainServ.Add(this.selectedItem!, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
            this.isLoading = false;
            this.showSuccessAlert(this.translate.instant('Item added successfully'));
          },
          (error) => {
            this.isLoading = false;
            const errorMessage = error.error?.message || this.translate.instant('Failed to add item');
            this.showErrorAlert(errorMessage);
          }
        );
      } else {
        this.mainServ.Edit(this.selectedItem!, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
            this.isLoading = false;
            this.showSuccessAlert(this.translate.instant('Item updated successfully'));
          },
          (error) => {
            this.isLoading = false;
            const errorMessage = error.error?.message || this.translate.instant('Failed to update item');
            this.showErrorAlert(errorMessage);
          }
        );
      }
    }
  }
}