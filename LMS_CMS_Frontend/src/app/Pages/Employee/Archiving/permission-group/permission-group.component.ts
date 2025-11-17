import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TokenData } from '../../../../Models/token-data';
import { PermissionGroup } from '../../../../Models/Archiving/permission-group';
import { PermissionGroupService } from '../../../../Services/Employee/Archiving/permission-group.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-permission-group',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent],
  templateUrl: './permission-group.component.html',
  styleUrl: './permission-group.component.css'
})

@InitLoader()
export class PermissionGroupComponent {
 User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: PermissionGroup[] = [];
  permissionGroup:PermissionGroup = new PermissionGroup()
  DomainName: string = '';
  UserID: number = 0;
 
  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'en_Name' ,'ar_Name'];

  CurrentPage:number = 1
  PageSize:number = 10
  TotalPages:number = 1
  TotalRecords:number = 0
  isDeleting:boolean = false;

  validationErrors: { [key in keyof PermissionGroup]?: string } = {};
  isLoading = false;

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService, 
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public permissionGroupService:PermissionGroupService,
    private loadingService: LoadingService 
  ) {}
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

    this.GetAllData(this.CurrentPage, this.PageSize) 
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

  async onSearchEvent(event: { key: string; value: any }) {
    this.PageSize = this.TotalRecords
    this.CurrentPage = 1
    this.TotalPages = 1
    this.key = event.key;
    this.value = event.value;
    try {
      const data: any = await firstValueFrom(
        this.permissionGroupService.Get(this.DomainName, this.CurrentPage, this.PageSize)
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
            return fieldValue.toString().includes(numericValue.toString())
          }
          return fieldValue == this.value;
        });
      }
    } catch (error) {
      this.TableData = [];
    }
  }

  GetAllData(pageNumber:number, pageSize:number){
    this.permissionGroupService.Get(this.DomainName, pageNumber, pageSize).subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage
        this.PageSize = data.pagination.pageSize
        this.TotalPages = data.pagination.totalPages
        this.TotalRecords = data.pagination.totalRecords 
        this.TableData = data.data
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

  getById(id:number){
    this.permissionGroup = new PermissionGroup(); 
    this.permissionGroupService.GetById(id, this.DomainName).subscribe(
      (data) => { 
        this.permissionGroup = data
      }
    )
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

  validateNumber(event: any): void {
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

  Archiving(id:number){
    this.router.navigateByUrl(`Employee/Permissions Group Archiving/${id}`)
  }
  
  AddEmployee(id:number){
    this.router.navigateByUrl(`Employee/Permissions Group Employee/${id}`)
  }
  
  openModal(Id?: number) {
    if (Id) { 
      this.getById(Id);
    } 

    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

closeModal() {
  document.getElementById('Add_Modal')?.classList.remove('flex');
  document.getElementById('Add_Modal')?.classList.add('hidden'); 
  this.permissionGroup = new PermissionGroup(); 
  this.validationErrors = {};
}

  capitalizeField(field: keyof PermissionGroup): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.permissionGroup) {
      if (this.permissionGroup.hasOwnProperty(key)) {
        const field = key as keyof PermissionGroup;
        if (!this.permissionGroup[field]) {
          if (field == 'en_Name' || field == 'ar_Name') {
            this.validationErrors[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        } else {
          this.validationErrors[field] = '';
        }
      }
    }

    if (this.permissionGroup.en_Name.length > 100) {
      isValid = false;
      this.validationErrors['en_Name'] = 'English Name cannot be longer than 100 characters.'
    }

    if (this.permissionGroup.ar_Name.length > 100) {
      isValid = false;
      this.validationErrors['ar_Name'] = 'Arabic Name cannot be longer than 100 characters.'
    }

    return isValid;
  }

  onInputValueChange(event: { field: keyof PermissionGroup; value: any }) {
    const { field, value } = event;
    (this.permissionGroup as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    } 
  }

  Save() {  
    if (this.isFormValid()) {
      this.isLoading = true;    
      if (this.permissionGroup.id == 0) { 
        this.permissionGroupService.Add(this.permissionGroup, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetAllData(this.CurrentPage, this.PageSize)
            this.isLoading = false;
          },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        );
      } else {
        this.permissionGroupService.Edit(this.permissionGroup, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetAllData(this.CurrentPage, this.PageSize)
            this.isLoading = false;
          },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        );
      }
    }
  }

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this Permission Group?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.permissionGroupService.Delete(id,this.DomainName).subscribe((D)=>{
          this.GetAllData(this.CurrentPage, this.PageSize)
        })
      }
    });
  }
}
