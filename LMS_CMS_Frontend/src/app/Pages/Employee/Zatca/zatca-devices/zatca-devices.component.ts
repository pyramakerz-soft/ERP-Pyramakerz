// zatca-devices.component.ts
import { Component, OnInit } from '@angular/core';
import { SchoolPCsService } from '../../../../Services/Employee/Inventory/school-pcs.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { SearchComponent } from '../../../../Component/search/search.component';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { ZatcaDevice } from '../../../../Models/zatca/zatca-device';
import { School } from '../../../../Models/school';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { ApiService } from '../../../../Services/api.service';
import { ZatcaService } from '../../../../Services/Employee/Zatca/zatca.service';

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
  isCertificateModalVisible: boolean = false;
  mode: string = "";
  isLoading = false;
  
  path: string = "";
  key: string = "id";
  value: any = "";
  keysArray: string[] = ['id', 'pcName', 'serialNumber', 'schoolName'];
  validationErrors: { [key: string]: string } = {};
  
  otp: number|null = null;
  deviceToGenerateID: number = 0;

  constructor( 
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private schoolPCsService: SchoolPCsService,
    private schoolService: SchoolService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    private datePipe: DatePipe,
    private zatcaService: ZatcaService

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
  this.isLoading = true;
  
  this.schoolPCsService.GetById(id, this.DomainName).subscribe({
    next: (device) => {
      console.log('Device loaded for editing:', device);
      this.zatcaDevice = new ZatcaDevice(
        device.id,
        device.pcName,
        device.serialNumber,
        this.getSchoolIdFromName(device.school), // Convert school name to ID
        device.school,
        device.certificateDate
      );
      this.isLoading = false;
      this.openModal();
    },
    error: (error) => {
      console.error('Error loading device:', error);
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load device for editing',
        confirmButtonText: 'Okay'
      });
    }
  });
}

// Helper method to find school ID by name
private getSchoolIdFromName(schoolName: string): number {
  const school = this.schools.find(s => s.name === schoolName);
  return school ? school.id : 0;
}

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
    this.zatcaDevice = new ZatcaDevice();
    this.validationErrors = {};
  }

  openCertificate(devideID:number) {
    this.isCertificateModalVisible = true;
    this.deviceToGenerateID = devideID
  }

  closeCertificateModal() {
    this.isCertificateModalVisible = false;
    this.deviceToGenerateID = 0
    this.otp = null
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

    if (!this.zatcaDevice.schoolId) {
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
  // Create a complete ZatcaDevice object
  const payload = new ZatcaDevice(
    0, // id will be assigned by server
    this.zatcaDevice.pcName,
    this.zatcaDevice.serialNumber,
    Number(this.zatcaDevice.schoolId),
    '', // schoolName can be empty
  ); 
  this.schoolPCsService.Create(payload, this.DomainName).subscribe({
    next: () => {
      this.GetTableData();
      this.closeModal();
      this.isLoading = false;
    },
    error: (error) => { 
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.error?.message || 'Failed to create device',
        confirmButtonText: 'Okay'
      });
    }
  });
}

Save() {
  const selectedSchool = this.schools.find(s => s.id === Number(this.zatcaDevice.schoolId));
  const payload = {
    id: this.zatcaDevice.id,
    pcName: this.zatcaDevice.pcName,
    serialNumber: this.zatcaDevice.serialNumber,
    schoolId: Number(this.zatcaDevice.schoolId),
    school: selectedSchool ? selectedSchool.name : '',
    certificateDate: this.zatcaDevice.certificateDate
  }; 

  this.schoolPCsService.Edit(this.zatcaDevice.id, payload, this.DomainName).subscribe({
    next: () => {
      this.GetTableData();
      this.closeModal();
      this.isLoading = false;
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Device updated successfully',
        confirmButtonText: 'Okay'
      });
    },
    error: (error) => {
      console.error('Update error:', error);
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.error?.message || 'Failed to update device',
        confirmButtonText: 'Okay'
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
      this.isLoading = true;
      this.schoolPCsService.Delete(id, this.DomainName).subscribe({
        next: () => {
          this.GetTableData();
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Device has been deleted.',
            confirmButtonText: 'Okay'
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Delete error details:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to delete device',
            confirmButtonText: 'Okay'
          });
        }
      });
    }
  });
}

  generateCertificate() {
    Swal.fire({
      title: 'Generate Certificate',
      text: 'Are you sure you want to generate a certificate for this device?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FF7519',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Generate',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed && this.otp) {
        this.isLoading = true;
        this.zatcaService.generateCertificate(this.deviceToGenerateID, this.otp, this.DomainName).subscribe({
          next: () => {
            this.isLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Certificate generated successfully',
              confirmButtonText: 'Okay'
            });
            this.GetTableData(); // Refresh table data
          },
          error: (error) => {  
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.error || 'Failed to generate certificate',
              confirmButtonText: 'Okay'
            });
          }
        });
      }
    });
  }

  formatDate(date: string | null): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'MMM d, yyyy') || '';
  }

  validateNumber(event: any): void {
    const value = event.target.value;
    const intValue = parseInt(value, 10);
    if (!/^\d+$/.test(value)) {
      event.target.value = '';
      this.otp = '' as never;
    }
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