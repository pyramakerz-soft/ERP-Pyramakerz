import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import { SubjectCategory } from '../../../../Models/LMS/subject-category';
import Swal from 'sweetalert2';
import { SubjectCategoryService } from '../../../../Services/Employee/LMS/subject-category.service';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';

@Component({
  selector: 'app-subject-category',
  standalone: true,
  imports: [FormsModule,CommonModule,SearchComponent, TranslateModule],
  templateUrl: './subject-category.component.html',
  styleUrl: './subject-category.component.css'
})

@InitLoader()
export class SubjectCategoryComponent {
  keysArray: string[] = ['id', 'name'];
  key: string= "id";
  value: any = "";

  subjectCategoryData:SubjectCategory[] = []
  subjectCategory:SubjectCategory = new SubjectCategory()
  editSubjectCategory:boolean = false
  validationErrors: { [key in keyof SubjectCategory]?: string } = {};

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = ""
  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = "";
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  isLoading = false;
  
  constructor( 
    private languageService: LanguageService, 
    public account: AccountService, 
    public subjectCategoryService: SubjectCategoryService, 
    private translate: TranslateService, 
    public ApiServ: ApiService, 
    public EditDeleteServ: DeleteEditPermissionService, 
    public activeRoute: ActivatedRoute, 
    private menuService: MenuService,
    private loadingService: LoadingService
  ){}
  
  ngOnInit(){
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });

    this.getSubjectCategoryData()

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others
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

  private showWarningAlert(title: string, text: string, confirmButtonText: string) {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: text,
      confirmButtonText: confirmButtonText
    });
  }

  getSubjectCategoryData(){
    this.subjectCategoryData=[]
    this.subjectCategoryService.Get(this.DomainName).subscribe(
      (data) => {
        this.subjectCategoryData = data;
      }
    )
  }

  GetSubjectCategoryById(accountId: number) {
    this.subjectCategoryService.GetByID(accountId, this.DomainName).subscribe((data) => {
      this.subjectCategory = data;
    });
  }

  openModal(accountId?: number) {
    if (accountId) {
      this.editSubjectCategory = true;
      this.GetSubjectCategoryById(accountId); 
    }
    
    document.getElementById("Add_Modal")?.classList.remove("hidden");
    document.getElementById("Add_Modal")?.classList.add("flex");
  }

  closeModal() {
    document.getElementById("Add_Modal")?.classList.remove("flex");
    document.getElementById("Add_Modal")?.classList.add("hidden");

    this.subjectCategory= new SubjectCategory()

    if(this.editSubjectCategory){
      this.editSubjectCategory = false
    }
    this.validationErrors = {}; 
  }
  
  async onSearchEvent(event: { key: string, value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: SubjectCategory[] = await firstValueFrom(this.subjectCategoryService.Get(this.DomainName));  
      this.subjectCategoryData = data || [];
  
      if (this.value !== "") {
        const numericValue = isNaN(Number(this.value)) ? this.value : parseInt(this.value, 10);
  
        this.subjectCategoryData = this.subjectCategoryData.filter(t => {
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
      this.subjectCategoryData = [];
    }
  }

  isFormValid(): boolean {
    this.validationErrors = {};
    
    if (!this.subjectCategory.name) {
      this.validationErrors['name'] = `${this.translate.instant('Field is required')} ${this.translate.instant('Name')}`;
      return false;
    }
    
    if (this.subjectCategory.name && this.subjectCategory.name.length > 100) {
      this.validationErrors['name'] = `${this.translate.instant('Name')} ${this.translate.instant('cannot be longer than 100 characters')}`;
      return false;
    }
    
    return true;
  }

  onInputValueChange(event: { field: keyof SubjectCategory, value: any }) {
    const { field, value } = event;
    if (field == "name" ) {
      (this.subjectCategory as any)[field] = value;
      if (value && this.validationErrors[field]) {
        this.validationErrors[field] = '';
      }
    }
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID, this.UserID, this.AllowDeleteForOthers);
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  SaveSubjectCategory(){
    if(this.isFormValid()){
      this.isLoading = true;
      const isEditing = this.editSubjectCategory;
      
      const operation = isEditing 
        ? this.subjectCategoryService.Edit(this.subjectCategory, this.DomainName)
        : this.subjectCategoryService.Add(this.subjectCategory, this.DomainName);

      operation.subscribe({
        next: () => {
          this.closeModal();
          this.getSubjectCategoryData();
          const successMessage = isEditing 
            ? this.translate.instant('Updated successfully')
            : this.translate.instant('Created successfully');
          this.showSuccessAlert(successMessage);
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 403 && error.error === 'User is suspended.') {  
            const suspendedTitle = this.translate.instant('Account suspended');
            const suspendedText = this.translate.instant('Your account has been suspended. You will be logged out.');
            const okButton = this.translate.instant('OK');
            this.showWarningAlert(suspendedTitle, suspendedText, okButton);
          } else {
            const errorMessage = error.error?.message || this.translate.instant('Failed to save the item');
            this.showErrorAlert(errorMessage);
          }
        }
      });
    }
  } 

  deleteSubjectCategory(id:number){
    const translatedTitle = this.translate.instant('Are you sure?');
    const translatedText = this.translate.instant('You will not be able to recover this item!');
    const translatedConfirm = this.translate.instant('Yes, delete it!');
    const translatedCancel = this.translate.instant('No, keep it');
    const successMessage = this.translate.instant('Deleted successfully');

    Swal.fire({
      title: translatedTitle,
      text: translatedText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: translatedConfirm,
      cancelButtonText: translatedCancel,
    }).then((result) => {
      if (result.isConfirmed) {
        this.subjectCategoryService.Delete(id, this.DomainName).subscribe({
          next: () => {
            this.getSubjectCategoryData();
            this.showSuccessAlert(successMessage);
          },
          error: (error) => {
            const errorMessage = error.error?.message || this.translate.instant('Failed to delete the item');
            this.showErrorAlert(errorMessage);
          }
        });
      }
    });
  }
}