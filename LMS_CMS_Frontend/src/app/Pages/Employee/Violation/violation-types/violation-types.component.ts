import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, formatCurrency } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { EmployeeTypeGet } from '../../../../Models/Administrator/employee-type-get';
import { Violation } from '../../../../Models/Violation/violation';
import { ViolationAdd } from '../../../../Models/Administrator/violation-add';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { EmployeeTypeViolationService } from '../../../../Services/Employee/employee-type-violation.service';
import { EmployeeTypeService } from '../../../../Services/Employee/employee-type.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { ViolationType } from '../../../../Models/Violation/violation-type';
import { ViolationTypeService } from '../../../../Services/Employee/Violation/violation-type.service';
@Component({
  selector: 'app-violation-types',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent, TranslateModule],
  templateUrl: './violation-types.component.html',
  styleUrl: './violation-types.component.css',
})
export class ViolationTypesComponent {
  User_Data_After_Login: TokenData = new TokenData(
    '',
    0,
    0,
    0,
    0,
    '',
    '',
    '',
    '',
    ''
  );

  DomainName: string = '';
  UserID: number = 0;
  path: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  Data: ViolationType[] = [];
  violationType: ViolationType = new ViolationType();
  SelectedEmployeeType: number = 0;
  validationErrors: { [key in keyof ViolationType]?: string } = {};

  violationId: number = 0;

  isModalVisible: boolean = false;
  mode: string = 'Create';

  empTypes: EmployeeTypeGet[] = [];

  dropdownOpen = false;
  empTypesSelected: EmployeeTypeGet[] = [];

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  keysArray: string[] = ['id', 'name'];
  key: string = "id";
  value: any = "";
  isLoading = false


  constructor(
    public violationTypeServ: ViolationTypeService,
    public empTypeVioletionServ: EmployeeTypeViolationService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    private menuService: MenuService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    public empTypeServ: EmployeeTypeService,
    private languageService: LanguageService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });
    this.GetEmployeeType();
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

  GetViolation() {
    this.Data = []
    if (this.SelectedEmployeeType != 0) {
      this.violationTypeServ.GetByEmployeeType(this.SelectedEmployeeType, this.DomainName).subscribe((data) => {
        this.Data = data;
      });
    }
  }

  GetEmployeeType() {
    this.empTypeServ.Get(this.DomainName).subscribe((data) => {
      this.empTypes = data;
    });
  }

  Create() {
    this.mode = 'Create';
    this.violationType = new ViolationType();
    this.dropdownOpen = false;
    this.openModal();
    this.empTypesSelected = [];
  }

  openModal() {
    this.isModalVisible = true;
  }

  Edit(row: ViolationType): void {
    this.mode = 'Edit';
    this.violationTypeServ.GetViolationTypeByID(row.id, this.DomainName).subscribe(
      data => {
        this.violationType = data;
        const empTypeSelected = data.employeeTypes
        this.empTypesSelected = empTypeSelected
        const employeeTypeIds = this.Data.find((v) => v.id === data.id)?.employeeTypes.map((empType) => empType.id) ?? [];
        this.violationType.employeeTypeIds = employeeTypeIds
      }
    )
    this.openModal();
    this.dropdownOpen = false;
  }

  Delete(id: number): void {
    Swal.fire({
      title: 'Are you sure you want to delete this Violation?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.violationTypeServ.Delete(id, this.DomainName).subscribe({
          next: (data) => {
            this.GetViolation();
          },
          error: (error) => {
            console.error('Error while deleting the Violation:', error);
            Swal.fire({
              title: 'Error',
              text: 'An error occurred while deleting the Violation. Please try again later.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          },
        });
      }
    });
  }

  closeModal() {
    this.isModalVisible = false;
  }

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true
      if (this.mode == 'Create') {
        this.violationTypeServ.Add(this.violationType, this.DomainName).subscribe((d) => {
          this.GetViolation()
          this.closeModal()
          this.isLoading = false
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Created Successfully',
            confirmButtonColor: '#089B41',
          });
        }, error => {
          this.isLoading = false
          if (error.error?.toLowerCase().includes('name') && error.status === 400) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'This Name Already Exists',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Try Again Later!',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' }
            });
          }

        })
      }
      else if (this.mode == 'Edit') {
        this.violationTypeServ.Edit(this.violationType, this.DomainName).subscribe((d) => {
          this.GetViolation()
          this.closeModal()
          this.isLoading = false
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Updatedd Successfully',
            confirmButtonColor: '#089B41',
          });
        }, error => {
          this.isLoading = false
          if (error.error?.toLowerCase().includes('name') && error.status === 400) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'This Name Already Exists',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Try Again Later!',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' }
            });
          }
        })
      }
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectEmployeeType(employeeType: EmployeeTypeGet): void {
    if (!this.empTypesSelected.some((e) => e.id === employeeType.id)) {
      this.empTypesSelected.push(employeeType);
    }

    if (!this.violationType.employeeTypeIds.some((e) => e === employeeType.id)) {
      this.violationType.employeeTypeIds.push(employeeType.id);
    }

    this.dropdownOpen = false; // Close dropdown after selection
  }

  removeSelected(id: number): void {
    this.empTypesSelected = this.empTypesSelected.filter((e) => e.id !== id);
    this.violationType.employeeTypeIds = this.violationType.employeeTypeIds.filter(
      (i) => i !== id
    );
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID, this.UserID, this.AllowDeleteForOthers);
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.violationType) {
      if (this.violationType.hasOwnProperty(key)) {
        const field = key as keyof ViolationType;
        if (!this.violationType[field]) {
          if (
            field == 'employeeTypeIds' ||
            field == 'name'
          ) {
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
            isValid = false;
          }
        }
      }
    }
    return isValid;
  }

  capitalizeField(field: keyof ViolationType): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  async onSearchEvent(event: { key: string, value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: ViolationType[] = await firstValueFrom( this.violationTypeServ.GetViolationType(this.DomainName));  
      this.Data = data || [];

      if (this.value !== "") {
        const numericValue = isNaN(Number(this.value)) ? this.value : parseInt(this.value, 10);

        this.Data = this.Data.filter(t => {
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
      this.Data = [];
    }
  }

}
