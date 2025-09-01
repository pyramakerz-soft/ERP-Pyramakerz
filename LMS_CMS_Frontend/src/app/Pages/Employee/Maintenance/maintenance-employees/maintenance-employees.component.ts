import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { EmployeeGet } from '../../../../Models/Employee/employee-get';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../Services/api.service';
import { MaintenanceEmployeesService } from '../../../../Services/Employee/Maintenance/maintenance-employees.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { AccountService } from '../../../../Services/account.service';

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

  isRtl: boolean = false;
  subscription!: Subscription;
  TableData: any[] = [];        // Employees already linked to maintenance
  employees: EmployeeGet[] = []; // All available employees for dropdown
  selectedEmployeeId: number | null = null; // 👈 FIXED
  keysArray: string[] = ['id', 'en_Name', 'ar_Name'];
  key: string= "id";
  DomainName: string = '';
  EditDeleteServ: any;
  value: any;
  selectedEmployee: EmployeeGet | null = null;
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
      private realTimeService: RealTimeNotificationServiceService){}

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
    if (this.subscription) this.subscription.unsubscribe();
  }



  IsAllowDelete(InsertedByID: number): boolean {
  return this.deleteEditPermissionServ.IsAllowDelete(
    InsertedByID,
    this.UserID,
    this.AllowDeleteForOthers
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


 async onSearchEvent(event: { key: string, value: any }) {
      this.key = event.key;
      this.value = event.value;
      try {
        const data: EmployeeGet[] = await firstValueFrom( this.mainServ.Get(this.DomainName));  
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





openModal() {
    this.selectedEmployeeId = null; // reset
    this.isModalOpen = true;
    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    this.isModalOpen = false;
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');
  }

  async save() {
    if (!this.selectedEmployeeId) {
      Swal.fire('Error', 'Please select an employee first.', 'error');
      return;
    }

    this.isLoading = true;
    try {
      const payload = { employeeId: this.selectedEmployeeId }; // 👈 FIXED
      await firstValueFrom(this.mainServ.Add(payload, this.DomainName));

      Swal.fire('Added!', 'Employee added to maintenance successfully.', 'success');

      this.closeModal();
      this.TableData = await firstValueFrom(this.mainServ.Get(this.DomainName));
    } catch (error) {
      console.error("Save failed:", error);
      Swal.fire('Error', 'Something went wrong.', 'error');
    } finally {
      this.isLoading = false;
    }
  }
}


