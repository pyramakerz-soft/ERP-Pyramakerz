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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';

@Component({
  selector: 'app-zatca-devices',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent , TranslateModule],
  templateUrl: './zatca-devices.component.html',
  styleUrls: ['./zatca-devices.component.css'],
  providers: [DatePipe]
})

@InitLoader()
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
  isRtl: boolean = false;
  subscription!: Subscription;
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
  
  otp: number| null = null;
  deviceToGenerateID: number = 0;

  constructor( 
    private menuService: MenuService,
    private languageService: LanguageService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private schoolPCsService: SchoolPCsService,
    private schoolService: SchoolService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    private datePipe: DatePipe,
    private zatcaService: ZatcaService, 
    private translate: TranslateService,
    private loadingService: LoadingService 
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
        this.isLoading = false;
        const errorMessage = error.error?.message || this.translate.instant('Failed to load device for editing');
        this.showErrorAlert(errorMessage);
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
    this.deviceToGenerateID = devideID;
  }

  closeCertificateModal() {
    this.isCertificateModalVisible = false;
    this.deviceToGenerateID = 0;
    this.otp = null;
  }

  isFormValid(): boolean {
    this.validationErrors = {};
    let isValid = true;

    if (!this.zatcaDevice.pcName) {
      this.validationErrors['pcName'] = this.translate.instant('PC Name is required');
      isValid = false;
    }

    if (!this.zatcaDevice.serialNumber) {
      this.validationErrors['serialNumber'] = this.translate.instant('Serial Number is required');
      isValid = false;
    }

    if (!this.zatcaDevice.schoolId) {
      this.validationErrors['schoolId'] = this.translate.instant('School is required');
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
        this.showSuccessAlert(this.translate.instant('Device created successfully'));
      },
      error: (error) => { 
        this.isLoading = false;
        const errorMessage = error.error?.message || this.translate.instant('Failed to create device');
        this.showErrorAlert(errorMessage);
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
        this.showSuccessAlert(this.translate.instant('Device updated successfully'));
      },
      error: (error) => {
        console.error('Update error:', error);
        this.isLoading = false;
        const errorMessage = error.error?.message || this.translate.instant('Failed to update device');
        this.showErrorAlert(errorMessage);
      }
    });
  }

  Delete(id: number) {
    const deleteTitle = this.translate.instant('Are you sure you want to delete this device?');
    const deleteButton = this.translate.instant('Delete');
    const cancelButton = this.translate.instant('Cancel');
    
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
        this.isLoading = true;
        this.schoolPCsService.Delete(id, this.DomainName).subscribe({
          next: () => {
            this.GetTableData();
            this.isLoading = false;
            this.showSuccessAlert(this.translate.instant('Device deleted successfully'));
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Delete error details:', error);
            const errorMessage = error.error?.message || this.translate.instant('Failed to delete device');
            this.showErrorAlert(errorMessage);
          }
        });
      }
    });
  }

  generateCertificate() {
    const generateTitle = this.translate.instant('Generate Certificate');
    const generateText = this.translate.instant('Are you sure you want to generate a certificate for this device?');
    const generateButton = this.translate.instant('Generate');
    const cancelButton = this.translate.instant('Cancel');
    
    Swal.fire({
      title: generateTitle,
      text: generateText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FF7519',
      cancelButtonColor: '#17253E',
      confirmButtonText: generateButton,
      cancelButtonText: cancelButton
    }).then((result) => {
      if (result.isConfirmed && this.otp) {
        this.isLoading = true;
        this.zatcaService.generateCertificate(this.deviceToGenerateID, this.otp, this.DomainName).subscribe({
          next: () => {
            this.isLoading = false;
            this.showSuccessAlert(this.translate.instant('Certificate generated successfully'));
            this.GetTableData(); // Refresh table data
            this.closeCertificateModal();
          },
          error: (error) => {  
            this.isLoading = false;
            const errorMessage = error.error?.message || this.translate.instant('Failed to generate certificate');
            this.showErrorAlert(errorMessage);
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