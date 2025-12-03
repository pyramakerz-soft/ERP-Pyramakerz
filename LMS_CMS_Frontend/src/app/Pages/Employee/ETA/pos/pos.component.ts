import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import { POS } from '../../../../Models/ETA/pos';
import { TokenData } from '../../../../Models/token-data';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { POSService } from '../../../../Services/Employee/ETA/pos.service';
// import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs'; 
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.css'
})

@InitLoader()
export class POSComponent {
  validationErrors: { [key in keyof POS]?: string } = {}; 
  keysArray: string[] = ['id','clientID','clientSecret','clientSecret2','deviceSerialNumber'];
  key: string = 'id';
  value: any = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = '';

  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');

  pos: POS = new POS();
  POSData: POS[] = [];
   
  CurrentPage:number = 1
  PageSize:number = 10
  TotalPages:number = 1
  TotalRecords:number = 0
  isDeleting:boolean = false;
  viewClassStudents:boolean = false;
  viewStudents:boolean = false;

  isLoading = false;

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService,  
    public activeRoute: ActivatedRoute, 
    public posService: POSService, 
    public router: Router,
    private languageService: LanguageService, 
    private translate: TranslateService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    this.GetAllData(this.CurrentPage, this.PageSize) 

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

  private getRequiredErrorMessage(fieldName: string): string {
    const fieldTranslated = this.translate.instant(fieldName);
    const requiredTranslated = this.translate.instant('Is Required');
    
    if (this.isRtl) {
      return `${requiredTranslated} ${fieldTranslated}`;
    } else {
      return `${fieldTranslated} ${requiredTranslated}`;
    }
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

  GetAllData(pageNumber:number, pageSize:number){
    this.POSData = [] 
    this.CurrentPage = 1 
    this.TotalPages = 1
    this.TotalRecords = 0
    this.posService.Get(this.DomainName, pageNumber, pageSize).subscribe(
        (data) => {
          this.CurrentPage = data.pagination.currentPage
          this.PageSize = data.pagination.pageSize
          this.TotalPages = data.pagination.totalPages
          this.TotalRecords = data.pagination.totalRecords 
          this.POSData = data.data
        }, 
        (error) => { 
          if(error.status == 404){
            if(this.TotalRecords != 0){
              let lastPage = this.TotalRecords / this.PageSize 
              if(lastPage >= 1){
                if(this.isDeleting){
                  this.CurrentPage = Math.floor(lastPage) 
                  this.isDeleting = false
                } else{
                  this.CurrentPage = Math.ceil(lastPage) 
                }
                this.GetAllData(this.CurrentPage, this.PageSize)
              }
            } 
          }
        }
      )
  }

  getPOSById(id:number){
    this.pos = new POS()
    this.posService.GetByID(id, this.DomainName).subscribe(
      data => {
        this.pos = data  
      }
    )
  }

  openModal(Id?: number) {
    if (Id) { 
      this.getPOSById(Id);
    } 

    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden'); 
    this.validationErrors = {}; 
    this.pos = new POS();  
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

  capitalizeField(field: keyof POS): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }
    
  changeCurrentPage(currentPage:number){
    this.CurrentPage = currentPage
    this.GetAllData(this.CurrentPage, this.PageSize)
  }

  validatePageSize(event: any) { 
    const value = event.target.value;
    if (isNaN(value) || value === '') {
        event.target.value = '';
    }
  }

  validateNumberForPagination(event: any): void {
    const value = event.target.value;
    this.PageSize = 0
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

  onInputValueChange(event: { field: keyof POS; value: any }) {
    const { field, value } = event;
    (this.pos as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    } 
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.pos) { 
      if (this.pos.hasOwnProperty(key)) {
        const field = key as keyof POS;
        if (!this.pos[field]) {
          if (field == 'clientID' || field == 'clientSecret' || field == 'clientSecret2' || field == 'deviceSerialNumber') {
            // Use the helper method for properly formatted validation messages
            this.validationErrors[field] = this.getRequiredErrorMessage(this.capitalizeField(field));
            isValid = false;
          }
        } else { 
          this.validationErrors[field] = '';
        }
      }
    } 
    return isValid;
  }

  Save() {  
    if (this.isFormValid()) {
      this.isLoading = true;   
      if (this.pos.id == 0) { 
        this.posService.Add(this.pos, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetAllData(this.CurrentPage, this.PageSize)
            this.isLoading = false;
            this.showSuccessAlert(this.translate.instant('POS added successfully'));
          },
          (error) => {
            this.isLoading = false;
            const errorMessage = error.error?.message || this.translate.instant('Failed to add POS');
            this.showErrorAlert(errorMessage);
          }
        );
      } else {
        this.posService.Edit(this.pos, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetAllData(this.CurrentPage, this.PageSize)
            this.isLoading = false;
            this.showSuccessAlert(this.translate.instant('POS updated successfully'));
          },
          (error) => {
            this.isLoading = false;
            const errorMessage = error.error?.message || this.translate.instant('Failed to update POS');
            this.showErrorAlert(errorMessage);
          }
        );
      }
    }
  }

  async Delete(id: number) {
    const deleteTitle = this.translate.instant('Are you sure you want to delete this POS?');
    const deleteButton = this.translate.instant('Delete');
    const cancelButton = this.translate.instant('Cancel');
    const successMessage = this.translate.instant('POS deleted successfully');
    
    const Swal = await import('sweetalert2').then(m => m.default);
    
    Swal.fire({
      title: deleteTitle,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: deleteButton,
      cancelButtonText: cancelButton,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDeleting = true;
        this.posService.Delete(id,this.DomainName).subscribe({
          next: () => {
            this.GetAllData(this.CurrentPage, this.PageSize);
            this.showSuccessAlert(successMessage);
          },
          error: (error) => {
            const errorMessage = error.error?.message || this.translate.instant('Failed to delete POS');
            this.showErrorAlert(errorMessage);
          }
        });
      }
    });
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    this.PageSize = this.TotalRecords
    this.CurrentPage = 1
    this.TotalPages = 1
    try {
      const data: any = await firstValueFrom(
        this.posService.Get(this.DomainName, this.CurrentPage, this.PageSize)
      );
      this.POSData = data.data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.POSData = this.POSData.filter((t) => {
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
      this.POSData = [];
    }
  }
}