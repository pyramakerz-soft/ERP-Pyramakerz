// zatca-devices.component.ts
import { Component, OnInit } from '@angular/core';
import { SchoolPCsService } from '../../../../Services/Employee/Inventory/school-pcs.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { SearchComponent } from '../../../../Component/search/search.component';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { ZatcaDevice } from '../../../../Models/zatca/zatca-device.model';
import { School } from '../../../../Models/school';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { ApiService } from '../../../../Services/api.service';

@Component({
  selector: 'app-zatca-devices',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent],
  templateUrl: './zatca-devices.component.html',
  styleUrls: ['./zatca-devices.component.css'],
  providers: [DatePipe]
})
export class ZatcaDevicesComponent implements OnInit {
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "");
  TableData: ZatcaDevice[] = [];
  schools: School[] = [];
  zatcaDevice: ZatcaDevice = new ZatcaDevice();
  
  DomainName: string = "";
  UserID: number = 0;
  AllowEdit: boolean = true;
  AllowDelete: boolean = true;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  
  IsChoosenDomain: boolean = false;
  IsEmployee: boolean = true;
  
  isModalVisible: boolean = false;
  mode: string = "";
  isLoading = false;
  
  path: string = "";
  key: string = "id";
  value: any = "";
  keysArray: string[] = ['id', 'pcName', 'serialNumber', 'schoolName'];
  validationErrors: { [key: string]: string } = {};

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private schoolPCsService: SchoolPCsService,
    private schoolService: SchoolService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    if (this.User_Data_After_Login.type === "employee") {
      this.IsChoosenDomain = true;
      this.DomainName = this.ApiServ.GetHeader();
      
      this.activeRoute.url.subscribe(url => {
        this.path = url[0].path;
      });

      this.GetTableData();
      this.getSchools();
      
      this.menuService.menuItemsForEmployee$.subscribe((items) => {
        const settingsPage = this.menuService.findByPageName(this.path, items);
        if (settingsPage) {
          this.AllowEdit = settingsPage.allow_Edit;
          this.AllowDelete = settingsPage.allow_Delete;
          this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
          this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
        }
      });
    } else if (this.User_Data_After_Login.type === "octa") {
      this.getSchools();
      this.IsEmployee = false;
      this.AllowEdit = true;
      this.AllowDelete = true;
    }
  }

  async GetTableData() {
    this.TableData = [];
    try {
      const data = await firstValueFrom(this.schoolPCsService.GetAll(this.DomainName));

      console.log('data')
      console.log(data)
      this.TableData = data;
    } catch (error) {
      this.TableData = [];
    }
  }

  getSchools() {
    this.schoolService.Get(this.DomainName).subscribe((data: School[]) => {
      this.schools = data;
    });
  }

  Create() {
    this.mode = "add";
    this.zatcaDevice = new ZatcaDevice();
    this.openModal();
  }

  Edit(id: number) {
    this.mode = "edit";
    const deviceToEdit = this.TableData.find((d) => d.id === id);
    if (deviceToEdit) {
      this.zatcaDevice = { ...deviceToEdit };
      this.openModal();
    }
  }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
    this.zatcaDevice = new ZatcaDevice();
    this.validationErrors = {};
  }

  isFormValid(): boolean {
    this.validationErrors = {};
    let isValid = true;

    if (!this.zatcaDevice.pcName) {
      this.validationErrors['pcName'] = '*PC Name is required';
      isValid = false;
    }

    if (!this.zatcaDevice.serialNumber) {
      this.validationErrors['serialNumber'] = '*Serial Number is required';
      isValid = false;
    }

    if (!this.zatcaDevice.school) {
      this.validationErrors['schoolId'] = '*School is required';
      isValid = false;
    }

    return isValid;
  }

  onInputValueChange(event: { field: keyof ZatcaDevice, value: any }) {
    const { field, value } = event;
    (this.zatcaDevice as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  CreateOREdit() {
    if (!this.isFormValid()) return;

    this.isLoading = true;
    if (this.mode === "add") {
      this.AddNewDevice();
    } else {
      this.Save();
    }
  }

  AddNewDevice() {
    this.schoolPCsService.Create(this.zatcaDevice, this.DomainName).subscribe({
      next: () => {
        this.GetTableData();
        this.closeModal();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Try Again Later!',
          confirmButtonText: 'Okay',
          customClass: { confirmButton: 'secondaryBg' }
        });
      }
    });
  }

  Save() {
    this.schoolPCsService.Edit(this.zatcaDevice.id, this.zatcaDevice, this.DomainName).subscribe({
      next: () => {
        this.GetTableData();
        this.closeModal();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Try Again Later!',
          confirmButtonText: 'Okay',
          customClass: { confirmButton: 'secondaryBg' }
        });
      }
    });
  }

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this device?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF7519',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.schoolPCsService.Delete(id, this.DomainName).subscribe(() => {
          this.GetTableData();
        });
      }
    });
  }

  formatDate(date: string | null): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'MMM d, yyyy') || '';
  }

  IsAllowDelete(insertedByUserId: number): boolean {
    if (!this.IsEmployee) return true;
    return this.EditDeleteServ.IsAllowDelete(insertedByUserId, this.UserID, this.AllowDeleteForOthers);
  }

  IsAllowEdit(insertedByUserId: number): boolean {
    if (!this.IsEmployee) return true;
    return this.EditDeleteServ.IsAllowEdit(insertedByUserId, this.UserID, this.AllowEditForOthers);
  }

  async onSearchEvent(event: { key: string, value: any }) {
    this.key = event.key;
    this.value = event.value;
    
    try {
      const data: ZatcaDevice[] = await firstValueFrom(this.schoolPCsService.GetAll(this.DomainName));
      this.TableData = data || [];

      if (this.value !== "") {
        const numericValue = isNaN(Number(this.value)) ? this.value : parseInt(this.value, 10);

        this.TableData = this.TableData.filter(d => {
          const fieldValue = d[this.key as keyof typeof d];
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
}