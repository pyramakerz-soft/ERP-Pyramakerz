import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../Services/api.service';
import { MaintenanceEmployeesService } from '../../../../Services/Employee/Maintenance/maintenance-employees.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { AccountService } from '../../../../Services/account.service';
import { MaintenanceEmployees } from '../../../../Models/Maintenance/maintenance-employees';
import { Employee } from '../../../../Models/Employee/employee';

@Component({
  selector: 'app-maintenance-employees',
  standalone: true,
  imports: [TranslateModule,SearchComponent,CommonModule, FormsModule],
  templateUrl: './maintenance-employees.component.html',
  styleUrl: './maintenance-employees.component.css'
})
export class MaintenanceEmployeesComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  UserID: number = 0;
  AllowDeleteForOthers: boolean = false;
  AllowDelete: boolean = true;
  validationErrors: { [key in keyof MaintenanceEmployees]?: string } = {};
  isRtl: boolean = false;
  subscription!: Subscription;
  TableData: MaintenanceEmployees[] = [];       
  employees: Employee[] = []; 
  selectedEmployeeId: number=0;
  keysArray: string[] = ['id', 'en_Name'];
  key: string= "id";
  DomainName: string = '';
  EditDeleteServ: any;
  value: any;
  selectedEmployee: MaintenanceEmployees | null = null;
  isLoading = false;
  isModalOpen= false;
  path: string = "";
  IsChoosenDomain: boolean = false;

  constructor(    
      private languageService: LanguageService,
      private router: Router,
      private apiService: ApiService, 
      public mainServ: MaintenanceEmployeesService,
      private deleteEditPermissionServ: DeleteEditPermissionService,
      public account: AccountService,
      public EmpServ: EmployeeService,
      private activeRoute: ActivatedRoute,
      private realTimeService: RealTimeNotificationServiceService,
        private translate: TranslateService
){}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    if (this.User_Data_After_Login.type === "employee") {
      this.IsChoosenDomain = true;
      this.DomainName = this.apiService.GetHeader();
      
      this.activeRoute.url.subscribe(url => {
        this.path = url[0].path;
      });
    this.GetTableData()
    }
    this.GetSelectData()

    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
    this.realTimeService.stopConnection();
    if (this.subscription) this.subscription.unsubscribe();
  }

  IsAllowDelete(InsertedByID: number): boolean {
    return this.deleteEditPermissionServ.IsAllowDelete(
      InsertedByID,
      this.UserID,
      this.AllowDeleteForOthers
    );
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
    const data = await firstValueFrom(this.mainServ.Get(this.DomainName)); 
    this.TableData = data;
    
    // Refresh the employees list to exclude those already in maintenance
    this.refreshFilteredEmployees();
  } catch (error) {
    this.TableData = [];
  }
}

refreshFilteredEmployees() {
  if (this.employees.length > 0) {
    this.employees = this.employees.filter(emp => 
      !this.TableData.some(maintenanceEmp => maintenanceEmp.id === emp.id)
    );
  }
}

async GetSelectData() {
  this.employees = [];
  try {
    const data = await firstValueFrom(this.EmpServ.Get_Employees(this.DomainName)); 
    // Filter out employees that are already in maintenance
    this.employees = data.filter(emp => 
      !this.TableData.some(maintenanceEmp => maintenanceEmp.id === emp.id)
    );
  } catch (error) {
    this.employees = [];
  }
}

Delete(id: number) {
  const deleteTitle = this.translate.instant('Are you sure you want to delete this employee from maintenance?');
  const deleteButton = this.translate.instant('Delete');
  const cancelButton = this.translate.instant('Cancel');
  
  Swal.fire({
    title: deleteTitle,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#089B41',
    cancelButtonColor: '#17253E',
    confirmButtonText: deleteButton,
    cancelButtonText: cancelButton
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;
      this.mainServ.Delete(id, this.DomainName).subscribe({
        next: () => {
          this.GetTableData();
          this.isLoading = false;
          this.showSuccessAlert(this.translate.instant('Employee removed from maintenance successfully'));
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || this.translate.instant('Failed to remove employee from maintenance');
          this.showErrorAlert(errorMessage);
        }
      });
    }
  });
}


isFormValid(): boolean {
  let isValid = true;
  this.validationErrors = {};
  if (!this.selectedEmployeeId || this.selectedEmployeeId === 0) {
    this.validationErrors['id'] = this.translate.instant('Employee is required');
    isValid = false;
  }

  return isValid;
}



 async onSearchEvent(event: { key: string, value: any }) {
      this.key = event.key;
      this.value = event.value;
      try {
        const data: MaintenanceEmployees[] = await firstValueFrom( this.mainServ.Get(this.DomainName));  
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

  onInputValueChange(event: { field: keyof MaintenanceEmployees; value: any }) {
    const { field, value } = event;
    
    if (field === 'id') {
      this.selectedEmployeeId = value;
    }
    
    if (value && value !== 0) {
      this.validationErrors[field] = '';
    }
  }
  capitalizeField(field: keyof MaintenanceEmployees): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }
  
  openModal() {
    this.selectedEmployeeId = 0; 
    this.validationErrors = {};
    this.isModalOpen = true;
    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    this.isModalOpen = false;
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');
    this.validationErrors = {};
  }

Save() {  
  if (this.isFormValid()) {
    if (this.selectedEmployeeId) {   
      this.isLoading = true;    

      const payload = { employeeId: this.selectedEmployeeId }; 
      this.mainServ.Add(payload, this.DomainName).subscribe(
        (result: any) => {
          this.closeModal();
          this.GetTableData();
          this.isLoading = false;
          this.showSuccessAlert(this.translate.instant('Employee added to maintenance successfully'));
        },
        (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || this.translate.instant('Failed to add employee to maintenance');
          this.showErrorAlert(errorMessage);
        }
      );
    } 
  }
}

}


