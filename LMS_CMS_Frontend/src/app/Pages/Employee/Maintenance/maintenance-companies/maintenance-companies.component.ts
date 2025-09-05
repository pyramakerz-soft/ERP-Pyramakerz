import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { EmployeeGet } from '../../../../Models/Employee/employee-get';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { AccountService } from '../../../../Services/account.service';
import { TokenData } from '../../../../Models/token-data';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaintenanceCompanies } from '../../../../Models/Maintenance/maintenance-companies';
import { MaintenanceCompaniesService } from '../../../../Services/Employee/Maintenance/maintenance-companies.service';
import { ApiService } from '../../../../Services/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-maintenance-companies',
  standalone: true,
  imports: [TranslateModule,SearchComponent,CommonModule, FormsModule ,],
  templateUrl: './maintenance-companies.component.html',
  styleUrl: './maintenance-companies.component.css'
})
export class MaintenanceCompaniesComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  UserID: number = 0;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  AllowEdit: boolean = true;
  AllowDelete: boolean = true;
  editCompany: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  TableData: MaintenanceCompanies[] = [] 
  keysArray: string[] = ['id', 'en_Name', 'ar_Name'];
  key: string= "id";
  DomainName: string = '';
  value: any;
  IsChoosenDomain: boolean = false;
  selectedCompany: MaintenanceCompanies | null = null;
  isLoading = false;
  isModalOpen= false;
  // validationErrors: { [key: string]: string } = {};
  validationErrors: { [key in keyof MaintenanceCompanies]?: string } = {}; 
  academicDegree: MaintenanceCompanies = new MaintenanceCompanies(0,'','');
  mode: string = "";
  isEditMode = false;
  path: string = "";
constructor(    
  private languageService: LanguageService,
  private router: Router,
  private apiService: ApiService,
  public account: AccountService, 
  private mainServ: MaintenanceCompaniesService,
  private deleteEditPermissionServ: DeleteEditPermissionService,
  private realTimeService: RealTimeNotificationServiceService,
  private activeRoute: ActivatedRoute
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
      this.mainServ.Get(this.DomainName).subscribe({
      next: (data:any) => {
        this.TableData = data;
        console.log(this.TableData)
      },
      error: (err:any) => {
        console.error('Error fetching companies:', err);
      }
    });}

      this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }



  ngOnDestroy(): void {
    this.realTimeService.stopConnection(); 
     if (this.subscription) {
      this.subscription.unsubscribe();
    }
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




  async GetTableData() {
    this.TableData = [];
    try {
      const data = await firstValueFrom(this.mainServ.Get(this.DomainName)); 
      this.TableData = data;
    } catch (error) {
      this.TableData = [];
    }
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
      this.mainServ.Delete(id, this.DomainName).subscribe({
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



  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.selectedCompany) { 
      if (this.selectedCompany.hasOwnProperty(key)) {
        const field = key as keyof MaintenanceCompanies;
        if (!this.selectedCompany[field]) {
          if (field == 'en_Name'||field == 'ar_Name' ) {
            this.validationErrors[field] = `*${this.capitalizeField( field )} is required`;
            isValid = false;
          }
        } else { 
          this.validationErrors[field] = '';
        }
      }
    } 
    return isValid;
  }



  onInputValueChange(event: { field: keyof MaintenanceCompanies; value: any }) {
    const { field, value } = event;
    (this.selectedCompany as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    } 
  }
    capitalizeField(field: keyof MaintenanceCompanies): string {
      return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
    }


Edit(id: number) {
  const Item = this.TableData.find((row: any) => row.id === id);

  if (Item) {
    this.isEditMode = true;             // 👈 explicitly set edit mode
    this.selectedCompany = { ...Item }; // clone to avoid mutating the table row
    this.openModal(false);              // false = editing
  } else {
    console.error("Item not found with id:", id);
  }
}



 async onSearchEvent(event: { key: string, value: any }) {
      this.key = event.key;
      this.value = event.value;
      try {
        const data: MaintenanceCompanies[] = await firstValueFrom( this.mainServ.Get(this.DomainName));  
        this.TableData = data || [];
    
        if (this.value !== "") {
          const numericValue = isNaN(Number(this.value)) ? this.value : parseInt(this.value, 10);
    
          this.TableData = this.TableData.filter(t => {
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




openModal(forNew: boolean = true) {
  if (forNew) {
    this.isEditMode = false;
    this.selectedCompany = new MaintenanceCompanies(0, '', '');
  }
  this.isModalOpen = true;

  document.getElementById('Add_Modal')?.classList.remove('hidden');
  document.getElementById('Add_Modal')?.classList.add('flex');
}



 closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');   
    this.validationErrors = {};
  }


  Save() {  
    if (this.isFormValid()) {
      this.isLoading = true;    
      if (this.selectedCompany?.id == 0) { 
        this.mainServ.Add(this.selectedCompany!, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetTableData();
            this.isLoading = false;
          },
          (error) => {
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
      } else {
        this.mainServ.Edit(this.selectedCompany!, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetTableData();
            this.isLoading = false;
          },
          (error) => {
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



}






