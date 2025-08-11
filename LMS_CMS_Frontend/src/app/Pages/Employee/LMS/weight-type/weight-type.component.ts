import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { WeightType } from '../../../../Models/LMS/weight-type';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { WeightTypeService } from '../../../../Services/Employee/LMS/weight-type.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-weight-type',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './weight-type.component.html',
  styleUrl: './weight-type.component.css'
})
export class WeightTypeComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: WeightType[] = [];

  DomainName: string = '';
  UserID: number = 0; 
  isRtl: boolean = false;
  subscription!: Subscription;
  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'englishName' ,'arabicName'];

  weightType: WeightType = new WeightType();

  validationErrors: { [key in keyof WeightType]?: string } = {};
  isLoading = false;

  editWeight:boolean = false

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public weightTypeService: WeightTypeService,
    public ApiServ: ApiService ,
    private languageService: LanguageService,
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

  GetAllData() {
    this.TableData = [];
    this.weightTypeService.Get(this.DomainName).subscribe((d) => {
      this.TableData = d;
    });
  }
  
  GetWeightTypeById(id:number) {
    this.weightType = new WeightType();
    this.weightTypeService.GetByID(id, this.DomainName).subscribe((d) => {
      this.weightType = d;
    });
  }

  OpenModal(id?: number) {
    if (id) {
      this.editWeight = true;
      this.GetWeightTypeById(id); 
    }

    document.getElementById("Add_Modal")?.classList.remove("hidden");
    document.getElementById("Add_Modal")?.classList.add("flex");
  }

  closeModal() {
    document.getElementById("Add_Modal")?.classList.remove("flex");
    document.getElementById("Add_Modal")?.classList.add("hidden");

    this.weightType = new WeightType()

    if(this.editWeight){
      this.editWeight = false
    }
    this.validationErrors = {}; 
  } 

  capitalizeField(field: keyof WeightType): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.weightType) {
      if (this.weightType.hasOwnProperty(key)) {
        const field = key as keyof WeightType;
        if (!this.weightType[field]) {
          if(field == "englishName" || field == "arabicName"){
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`
            isValid = false;
          }
        } else {
          if(field == "englishName" || field == 'arabicName'){
            if(this.weightType.englishName.length > 100 || this.weightType.arabicName.length > 100){
              this.validationErrors[field] = `*${this.capitalizeField(field)} cannot be longer than 100 characters`
              isValid = false;
            }
          } else{
            this.validationErrors[field] = '';
          }
        }
      }
    }
    return isValid;
  }

  onInputValueChange(event: { field: keyof WeightType, value: any }) {
    const { field, value } = event;
    (this.weightType as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
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

  Delete(id: number){
    Swal.fire({
      title: 'Are you sure you want to delete this Weight Type?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.weightTypeService.Delete(id, this.DomainName).subscribe(
          (data: any) => { 
            this.GetAllData()
          }
        );
      }
    });
  }

  Save(){
    if(this.isFormValid()){
      this.isLoading = true; 
      if(this.editWeight == false){
        this.weightTypeService.Add(this.weightType, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal()
            this.isLoading = false;
            this.GetAllData()
          },
          error => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Try Again Later!',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        );
      } else{
        this.weightTypeService.Edit(this.weightType, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal()
            this.GetAllData()
            this.isLoading = false;
          },
          error => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Try Again Later!',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        );
      }   
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: WeightType[] = await firstValueFrom(
        this.weightTypeService.Get(this.DomainName)
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
}
