import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { EmployeeGet } from '../../../../Models/Employee/employee-get';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaintenanceCompanies } from '../../../../Models/Maintenance/maintenance-companies';
import { MaintenanceCompaniesService } from '../../../../Services/Employee/Maintenance/maintenance-companies.service';
@Component({
  selector: 'app-maintenance-companies',
  standalone: true,
  imports: [TranslateModule,SearchComponent,CommonModule, FormsModule ,],
  templateUrl: './maintenance-companies.component.html',
  styleUrl: './maintenance-companies.component.css'
})
export class MaintenanceCompaniesComponent {
  isRtl: boolean = false;
  subscription!: Subscription;
  TableData: MaintenanceCompanies[] = []
  keysArray: string[] = ['id', 'en_Name', 'ar_Name'];
  key: string= "id";
  DomainName:any='try';
  EditDeleteServ: any;
  value: any;
  selectedCompany: MaintenanceCompanies | null = null;
  isLoading = false;
  isModalOpen= false;
  constructor(    
      private languageService: LanguageService,
      private router: Router, 
      public mainServ: MaintenanceCompaniesService,
      private realTimeService: RealTimeNotificationServiceService){}

    ngOnInit() {

      this.mainServ.Get(this.DomainName).subscribe({
      next: (data:any) => {
        this.TableData = data;
        console.log(this.TableData)
      },
      error: (err:any) => {
        console.error('Error fetching companies:', err);
      }
    });

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






Edit(id: number) {
  const company = this.TableData.find((row: any) => row.id === id);

  if (company) {
    this.selectedCompany = { ...company };  // keep company data
    this.openModal(false);                  // open modal in "edit mode"
  } else {
    console.error("Company not found with id:", id);
  }
}


  Delete(id: number) {
     this.mainServ.Delete(id, this.DomainName).subscribe({
      next: () => {
        this.TableData = this.TableData.filter(c => c.id !== id);
      },
      error: (err:any) => {
        console.error('Error deleting company:', err);
      }
    });
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
    // Only reset when creating a new company
    this.selectedCompany = new MaintenanceCompanies(0, '', '');
  }
  this.isModalOpen = true;

  document.getElementById('Add_Modal')?.classList.remove('hidden');
  document.getElementById('Add_Modal')?.classList.add('flex');
}


// openModal() {
//   this.selectedCompany = new MaintenanceCompanies(0, '', '');
//   this.isModalOpen = true;

//      document.getElementById('Add_Modal')?.classList.remove('hidden');
//      document.getElementById('Add_Modal')?.classList.add('flex');
// }

 closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');   
  }

async save() {
  this.isLoading = true;
  try {
    if (this.selectedCompany?.id && this.selectedCompany.id !== 0) {
      // Update existing
      await firstValueFrom(this.mainServ.Edit(this.selectedCompany, this.DomainName));
      Swal.fire('Updated!', 'Company updated successfully.', 'success');
    } else {
      // Add new
      await firstValueFrom(this.mainServ.Add(this.selectedCompany!, this.DomainName));
      Swal.fire('Added!', 'Company added successfully.', 'success');
    }

    this.closeModal();

    // Refresh table
    this.TableData = await firstValueFrom(this.mainServ.Get(this.DomainName));
  } catch (error) {
    console.error("Save failed:", error);
    Swal.fire('Error', 'Something went wrong.', 'error');
  } finally {
    this.isLoading = false;
  }
}
}


// async save() {
//   this.isLoading = true;
//   try {
//     if (this.selectedCompany?.id && this.selectedCompany.id !== 0) {
//       // Edit
//       await firstValueFrom(this.mainServ.Edit(this.selectedCompany, this.DomainName));
//       Swal.fire('Updated!', 'Company updated successfully.', 'success');
//     } else {
//       // Add
//       await firstValueFrom(this.mainServ.Add(this.selectedCompany!, this.DomainName));
//       Swal.fire('Added!', 'Company added successfully.', 'success');
//     }

//     this.closeModal();

//     // Refresh table
//     this.TableData = await firstValueFrom(this.mainServ.Get(this.DomainName));
//   } catch (error) {
//     console.error("Save failed:", error);
//     Swal.fire('Error', 'Something went wrong.', 'error');
//   } finally {
//     this.isLoading = false;
//   }
// }



