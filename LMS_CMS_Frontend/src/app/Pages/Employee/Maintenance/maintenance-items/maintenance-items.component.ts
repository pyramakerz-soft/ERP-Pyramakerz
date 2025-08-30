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
import { MaintenanceItem } from '../../../../Models/Maintenance/maintenance-item';
import { MaintenanceItemService } from '../../../../Services/Employee/Maintenance/maintenance-item.service';
import { ApiService } from '../../../../Services/api.service';

@Component({
  selector: 'app-maintenance-items',
  standalone: true,
  imports: [TranslateModule,SearchComponent,CommonModule, FormsModule ,],
  templateUrl: './maintenance-items.component.html',
  styleUrl: './maintenance-items.component.css'
})
export class MaintenanceItemsComponent {

  isRtl: boolean = false;
  subscription!: Subscription;
  TableData: MaintenanceItem[] = []
  keysArray: string[] = ['id', 'en_Name', 'ar_Name'];
  key: string= "id";
  DomainName: string = '';
  EditDeleteServ: any;
  value: any;
  selectedItem: MaintenanceItem | null = null;
  isLoading = false;
  isModalOpen= false;
  constructor(    
      private languageService: LanguageService,
      private router: Router,
      private apiService: ApiService, 
      public mainServ: MaintenanceItemService,
      private realTimeService: RealTimeNotificationServiceService){}

    ngOnInit() {
      this.DomainName = this.apiService.GetHeader();
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
  const Item = this.TableData.find((row: any) => row.id === id);

  if (Item) {
    this.selectedItem = { ...Item };  
    this.openModal(false);                  
  } else {
    console.error("Item not found with id:", id);
  }
}


  Delete(id: number) {
   if( confirm("are you sure delete this item")){
     this.mainServ.Delete(id, this.DomainName).subscribe({
      next: () => {
        this.TableData = this.TableData.filter(c => c.id !== id);
      },
      error: (err:any) => {
        console.error('Error deleting Item:', err);
      }
    });}
  }





 async onSearchEvent(event: { key: string, value: any }) {
      this.key = event.key;
      this.value = event.value;
      try {
        const data: MaintenanceItem[] = await firstValueFrom( this.mainServ.Get(this.DomainName));  
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
  this.selectedItem = new MaintenanceItem(0, '', '');
  }
  this.isModalOpen = true;

  document.getElementById('Add_Modal')?.classList.remove('hidden');
  document.getElementById('Add_Modal')?.classList.add('flex');
}



 closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');   
  }

async save() {
  this.isLoading = true;
  try {
    if (this.selectedItem?.id && this.selectedItem.id !== 0) {
      await firstValueFrom(this.mainServ.Edit(this.selectedItem, this.DomainName));
      Swal.fire('Updated!', 'Item updated successfully.', 'success');
    } else {
      await firstValueFrom(this.mainServ.Add(this.selectedItem!, this.DomainName));
      Swal.fire('Added!', 'Item added successfully.', 'success');
    }

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
