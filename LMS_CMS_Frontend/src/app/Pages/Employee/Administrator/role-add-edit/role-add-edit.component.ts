import { Component } from '@angular/core';
import { PagesWithRoleId } from '../../../../Models/pages-with-role-id';
import { PageService } from '../../../../Services/Employee/page.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { TokenData } from '../../../../Models/token-data';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleAdd } from '../../../../Models/Administrator/role-add';
import { RoleService } from '../../../../Services/Employee/role.service';
// import Swal from 'sweetalert2';
import { RoleDetailsService } from '../../../../Services/Employee/role-details.service';
import { RolePut } from '../../../../Models/Administrator/role-put';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
@Component({
  selector: 'app-role-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './role-add-edit.component.html',
  styleUrl: './role-add-edit.component.css'
})

@InitLoader()
export class RoleAddEditComponent {

  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")

  DomainName: string = "";
  UserID: number = 0;
  path: string = "";
  data: PagesWithRoleId[] = []
  PagecollapseStates: boolean[][] = [];
  collapseStates: boolean[] = [];
  checkboxStates: { [key: string]: boolean } = {};
  isRtl: boolean = false;
  subscription!: Subscription;
  ResultArray: {
    Rowkey: number;
    pageId: number;
    allow_Edit: boolean;
    allow_Delete: boolean;
    allow_Edit_For_Others: boolean;
    allow_Delete_For_Others: boolean;
    IsSave: boolean;
  }[] = [];

  RoleName: string = ""
  RoleId: number = 0;
  mode: string = ""
  DataToSave: RolePut = new RolePut();
  dataForEdit: PagesWithRoleId[] = []
  loading = true;
  validationErrors: { [key in keyof RolePut]?: string } = {};
  isLoading = false

  constructor(public pageServ: PageService,
    public RoleDetailsServ: RoleDetailsService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    private menuService: MenuService,
    public EditDeleteServ: DeleteEditPermissionService,
    public RoleServ: RoleService,
    private router: Router,
    private languageService: LanguageService, 
    private translate: TranslateService,
    private loadingService: LoadingService
  ) { }

  async ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    if (this.User_Data_After_Login.type === "employee") {
      this.DomainName = this.ApiServ.GetHeader();
      this.activeRoute.url.subscribe(url => {
        this.path = url.map(segment => segment.path).join('/');
      });

      await this.getAllPges();
      console.log("this.path" ,this.path)

      if (this.path.endsWith("Role/Create")) {
        this.mode = "Create";
        this.loading = false; // Not loading in create mode
      }else{
        this.RoleId = Number(this.activeRoute.snapshot.paramMap.get('id'));
        this.mode = "Edit";
        this.GetRoleName();
  
        setTimeout(async () => {
          await this.GetAllPgesForEdit();
          this.loading = false; // Only set to false when the function completes
        }, 0);
      }
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

// Helper method to show success messages
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


  GetRoleName() {
    this.RoleServ.Get_Role_id(this.RoleId, this.DomainName).subscribe((data) => {
      console.log('Fetched role data:', data);
      this.RoleName = data.name;
    })
  }

  async getAllPges() {
    try {
      const data = await firstValueFrom(this.pageServ.Get_Pages(this.DomainName));
      this.data = data;
      this.ResultArray = [];
      const processPages = (items: any[], parentId = 0) => {
        items.forEach(item => {
          this.ResultArray.push({
            Rowkey: parentId, // Parent ID
            pageId: item.id,  // Current Page ID
            allow_Edit: false,
            allow_Delete: false,
            allow_Edit_For_Others: false,
            allow_Delete_For_Others: false,
            IsSave: false,
          });

          if (item.children && Array.isArray(item.children)) {
            processPages(item.children, item.id);
          }
        });
      };
      processPages(this.data);
      this.collapseStates = new Array(this.data.length).fill(false);
      this.PagecollapseStates = this.data.map(() =>
        new Array(this.data[0]?.children?.length || 0).fill(false)
      );
    } catch (error) {
      console.error("Error fetching pages:", error);
      this.data = [];
    }
  }

  async GetAllPgesForEdit(): Promise<void> {
    try {
      this.dataForEdit = await firstValueFrom(this.RoleDetailsServ.Get_Pages_With_RoleID(this.RoleId, this.DomainName));
    } catch (error) {
      console.error('Error fetching pages for edit:', error);
      return;
    }

    const processPages = (items: any[], parentId = 0) => {
      items.forEach(element => {
        const resultItem = this.ResultArray.find(item => item.Rowkey === parentId && item.pageId === element.id);
        if (resultItem) {
          resultItem.IsSave = true;
          resultItem.allow_Delete = element.allow_Delete ?? true;
          resultItem.allow_Edit = element.allow_Edit ?? true;
          resultItem.allow_Edit_For_Others = element.allow_Edit_For_Others ?? true;
          resultItem.allow_Delete_For_Others = element.allow_Delete_For_Others ?? true;
        }

        if (element.children && Array.isArray(element.children)) {
          processPages(element.children, element.id);
        }
      });
    };

    processPages(this.dataForEdit);

  }

  moveToRoles() {
    this.router.navigateByUrl(`Employee/Role`)
  }

  togglePageCollapse(rowIndex: number, pageIndex: number) {
    this.PagecollapseStates[rowIndex][pageIndex] = !this.PagecollapseStates[rowIndex][pageIndex];
  }

  toggleCollapse(rowIndex: number) {
    this.collapseStates[rowIndex] = !this.collapseStates[rowIndex];
  }

  toggleCheckboxState(id: string) {
    this.checkboxStates[id] = !this.checkboxStates[id];
  }

  isChecked(id: string): boolean {
    return this.checkboxStates[id] || false;
  }

  SaveCheck(row: number, page: number, per: 'allow_Edit' | 'allow_Delete' | 'allow_Edit_For_Others' | 'allow_Delete_For_Others') {
    const resultItem = this.ResultArray.find((item) => item.Rowkey === row && item.pageId === page);
    if (resultItem) {
      resultItem[per] = !resultItem[per];
    }
  }

  getPermissionState(rowId: number, pageId: number, permission: 'allow_Edit' | 'allow_Delete' | 'allow_Edit_For_Others' | 'allow_Delete_For_Others'): boolean {
    const resultItem = this.ResultArray.find(item => item.Rowkey === rowId && item.pageId === pageId);
    return resultItem ? resultItem[permission] : false;
  }

  setPermissionState(rowId: number, pageId: number, permission: 'allow_Edit' | 'allow_Delete' | 'allow_Edit_For_Others' | 'allow_Delete_For_Others'): void {
    const resultItem = this.ResultArray.find(item => item.Rowkey === rowId && item.pageId === pageId);
    if (resultItem) {
      resultItem[permission] = !resultItem[permission];
      if (resultItem[permission] == true && resultItem.IsSave == false) {
        resultItem.IsSave = true;
        this.SetForRow(pageId ,rowId, true);
      }
    }
  }

  checkForPage(pageId: number, RowId: number): boolean {
    const resultItem = this.ResultArray.find(item => item.Rowkey === RowId && item.pageId === pageId);
    return resultItem ? resultItem.IsSave : false;
  }

  SetForPage(RowId: number, PageId: number): void {
    const resultItem = this.ResultArray.find(item => item.Rowkey === RowId && item.pageId === PageId);
    if (resultItem) {
      const newState = !resultItem.IsSave;
      resultItem.IsSave = newState;
      resultItem.allow_Delete = newState;
      resultItem.allow_Delete_For_Others = newState;
      resultItem.allow_Edit = newState;
      resultItem.allow_Edit_For_Others = newState;
      const resultItems = this.ResultArray.filter(item => item.Rowkey === RowId);
      const allChecked = resultItems.every(item => item.IsSave);
      const anyChecked = resultItems.some(item => item.IsSave);
      if (allChecked || !anyChecked) {
        resultItems.forEach(item => (item.IsSave = allChecked));
      }
    }
  }

  checkForRow(id: number): boolean {
    const resultItems = this.ResultArray.filter(item => item.pageId === id);
    return resultItems.some(item => item.IsSave);
  }

  onCheckboxChange(event: Event, id: number, parentId: number): void {
    const target = event.target as HTMLInputElement;
    const newState = target.checked; // Extract the checked state safely
    this.SetForRow(id, parentId, newState);
  }

  SetForRow(id: number, parentId: number, newState: boolean): void {
    // Recursive function to update all children
    const updateChildren = (id: number, state: boolean) => {
      const children = this.ResultArray.filter(item => item.Rowkey === id);
      children.forEach(child => {
        child.IsSave = state;
        child.allow_Delete = state;
        child.allow_Delete_For_Others = state;
        child.allow_Edit = state;
        child.allow_Edit_For_Others = state;
        updateChildren(child.pageId, state); // Recursively update deeper children
      });
    };
    // Recursive function to update all parent pages up to the top level
    const updateParents = (currentId: number) => {
      const parentPage = this.ResultArray.find(item => item.pageId === currentId);
      if (parentPage) {
        // Find all children of this parent
        const children = this.ResultArray.filter(item => item.Rowkey === currentId);
        // Check if at least one child is selected
        const hasActiveChild = children.some(child => child.IsSave);
        // Update parent based on children state
        parentPage.IsSave = hasActiveChild;
        parentPage.allow_Delete = hasActiveChild;
        parentPage.allow_Delete_For_Others = hasActiveChild;
        parentPage.allow_Edit = hasActiveChild;
        parentPage.allow_Edit_For_Others = hasActiveChild;
        // Continue updating its parent if it has one
        if (parentPage.Rowkey !== 0) {
          updateParents(parentPage.Rowkey);
        }
      }
    };

    // Update the selected page
    if (parentId == null) parentId = 0
    const selectedPage = this.ResultArray.find(item => item.Rowkey === parentId && item.pageId === id);
    if (selectedPage) {
      selectedPage.IsSave = newState;
      selectedPage.allow_Delete = newState;
      selectedPage.allow_Delete_For_Others = newState;
      selectedPage.allow_Edit = newState;
      selectedPage.allow_Edit_For_Others = newState;
    }
    // Update all child pages recursively
    updateChildren(id, newState);
    // Update parent and grandparent pages recursively
    updateParents(parentId);
  }

Save() {
  const resultItems = this.ResultArray.filter(item => item.IsSave === true);
  this.DataToSave.id = this.RoleId;
  this.DataToSave.name = this.RoleName
  this.DataToSave.pages = resultItems;
  if (this.isFormValid()) {
    this.isLoading = true
    if (this.mode == "Create") {
      this.RoleServ.AddRole(this.DataToSave, this.DomainName).subscribe({
        next: (response) => {
          this.showSuccessAlert(this.translate.instant('Role added successfully'));
          this.isLoading = false
          this.router.navigateByUrl("Employee/Role")
        },
        error: (error) => {
          this.isLoading = false
          const nameError = error?.error?.errors?.Name?.[0]

          if (error?.error?.status === 401) {
            this.showErrorAlert(this.translate.instant('You are not allowed to add roles'));
          } else if (
            typeof nameError === 'string' &&
            nameError.includes("Role cannot be longer than 100 characters")
          ) {
            this.showErrorAlert(this.translate.instant('Role name cannot be longer than 100 characters'));
          } else {
            const errorMessage = error.error?.message || this.translate.instant('Failed to add role');
            this.showErrorAlert(errorMessage);
          }
        },
      });
    }
    else if (this.mode == "Edit") {
      this.RoleServ.EditRole(this.DataToSave, this.DomainName).subscribe({
        next: (response) => {
          this.showSuccessAlert(this.translate.instant('Role updated successfully'));
          this.isLoading = false
          this.router.navigateByUrl("Employee/Role")
        },
        error: (error) => {
          console.log(error)
          this.isLoading = false
          const nameError = error?.error?.errors?.Name?.[0]
          
          if (error?.error?.status === 401) {
            this.showErrorAlert(this.translate.instant('You are not allowed to edit this role'));
          } else if (
            typeof nameError === 'string' &&
            nameError.includes("Role cannot be longer than 100 characters")
          ) {
            this.showErrorAlert(this.translate.instant('Role name cannot be longer than 100 characters'));
          } else {
            const errorMessage = error.error?.message || this.translate.instant('Failed to update role');
            this.showErrorAlert(errorMessage);
          }
        },
      });
    }
  }
}

  onInputValueChange(event: { field: keyof RolePut, value: any }) {
    const { field, value } = event;
    if (field == "name") {
      (this.DataToSave as any)[field] = value;
      if (value) {
        this.validationErrors[field] = '';
      }
    }
  }

isFormValid(): boolean {
  let isValid = true;
  this.validationErrors = {};

  if (!this.DataToSave.name) {
    this.validationErrors['name'] = this.translate.instant('Role name is required');
    isValid = false;
  }

  if (this.DataToSave.pages.length == 0) {
    this.showErrorAlert(this.translate.instant('Please select at least one page'));
    isValid = false;
  }

  return isValid;
}

  capitalizeField(field: keyof RolePut): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }
}
