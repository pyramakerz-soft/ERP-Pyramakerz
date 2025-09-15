import { Component, OnInit } from '@angular/core';
import { Maintenance, MaintenanceCreate, MaintenanceService } from '../../../../Services/Employee/Maintenance/maintenance.services';
import { firstValueFrom, Subscription } from 'rxjs';
import { LanguageService } from '../../../../Services/shared/language.service';
import { ApiService } from '../../../../Services/api.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../../Component/reuse-table/reuse-table.component';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TranslateModule } from '@ngx-translate/core';
import { MaintenanceItem } from '../../../../Models/Maintenance/maintenance-item';
import { MaintenanceCompanies } from '../../../../Models/Maintenance/maintenance-companies';
import { EmployeeGet } from '../../../../Models/Employee/employee-get';
import { MaintenanceCompaniesService } from '../../../../Services/Employee/Maintenance/maintenance-companies.service';
import { MaintenanceEmployeesService } from '../../../../Services/Employee/Maintenance/maintenance-employees.service';
import { MaintenanceItemService } from '../../../../Services/Employee/Maintenance/maintenance-item.service';
import { MaintenanceEmployees } from '../../../../Models/Maintenance/maintenance-employees';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [FormsModule, CommonModule, TableComponent, SearchComponent, TranslateModule],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.css'
})
export class MaintenanceComponent implements OnInit {
  headers: string[] = ['ID', 'Date', 'Item', 'Company', 'Employee', 'Cost', 'Note', 'Actions'];
  keys: string[] = ['id', 'date', 'itemEnglishName' , 'companyEnglishName', 'employeeEnglishName', 'cost', 'note'];
  keysArray: string[] = ['id', 'itemEnglishName', 'companyEnglishName', 'employeeEnglishName', 'note'];
  maintenanceList: Maintenance[] = [];
  isModalVisible = false;
  searchKey: string = 'id';
  searchValue: string = '';
  selectedMaintenance: Maintenance | null = null;
  isRtl: boolean = false;
  subscription!: Subscription;
  
  // Dropdown data
  maintenanceItems: MaintenanceItem[] = [];
  maintenanceCompanies: MaintenanceCompanies[] = [];
  maintenanceEmployees: MaintenanceEmployees[] = [];
  
  // Form model
  maintenanceForm: MaintenanceCreate = {
    date: new Date().toISOString().split('T')[0],
    itemID: 0,
    companyID: 0,
    maintenanceEmployeeID: 0,
    cost: 0,
    note: ''
  };
  
  // Radio button selection
  maintenanceType: 'company' | 'employee' = 'company';
  
  validationErrors: { [key: string]: string } = {};
  isSaving: boolean = false;
  editMode: boolean = false;

  constructor(
    private maintenanceService: MaintenanceService,
    private maintenanceCompaniesService: MaintenanceCompaniesService,
    private maintenanceEmployeesService: MaintenanceEmployeesService,
    private maintenanceItemService: MaintenanceItemService,
    private languageService: LanguageService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.loadMaintenance();
    this.loadDropdownData();
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

  async loadDropdownData() {
    try {
      const domainName = this.apiService.GetHeader();
      
      // Load maintenance items
      this.maintenanceItems = await firstValueFrom(this.maintenanceItemService.Get(domainName));
      
      // Load maintenance companies
      this.maintenanceCompanies = await firstValueFrom(this.maintenanceCompaniesService.Get(domainName));
      
      // Load maintenance employees
      this.maintenanceEmployees = await firstValueFrom(this.maintenanceEmployeesService.Get(domainName));
      console.log(this.maintenanceEmployees)
      console.log('this.maintenanceEmployees')
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  }

  async onSearchEvent(event: { key: string, value: any }) {
    this.searchKey = event.key;
    this.searchValue = event.value;
    await this.loadMaintenance();
    
    if (this.searchValue) {
      this.maintenanceList = this.maintenanceList.filter(item => {
        const fieldValue = item[this.searchKey as keyof typeof item]?.toString().toLowerCase() || '';
        return fieldValue.includes(this.searchValue.toString().toLowerCase());
      });
    }
  }


async loadMaintenance() {
  try {
    const domainName = this.apiService.GetHeader();
    const data = await firstValueFrom(this.maintenanceService.getAll(domainName));
    this.maintenanceList = data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString(),
      companyEnglishName: item.companyEnglishName || '-',
      employeeEnglishName: item.employeeEnglishName || '-',
      actions: { edit: true, delete: true },
    }));

    if (this.searchValue) {
      this.maintenanceList = this.maintenanceList.filter(item => {
        const fieldValue = item[this.searchKey as keyof typeof item]?.toString().toLowerCase() || '';
        return fieldValue.includes(this.searchValue.toString().toLowerCase());
      });
    }
  } catch (error) {
    console.error('Error loading maintenance data:', error);
  }
}

  openModal(item?: Maintenance) {
    this.isModalVisible = true;
    this.editMode = !!item;
    
    if (item) {
      this.selectedMaintenance = item;
      this.maintenanceForm = {
        date: item.date,
        itemID: item.itemID,
        companyID: item.companyID,
        maintenanceEmployeeID: item.maintenanceEmployeeID,
        cost: item.cost,
        note: item.note
      };
      
      // Set maintenance type based on which ID is present
      if (item.companyID > 0) {
        this.maintenanceType = 'company';
      } else if (item.maintenanceEmployeeID > 0) {
        this.maintenanceType = 'employee';
      }
    } else {
      this.resetForm();
    }
  }

  closeModal() {
    this.isModalVisible = false;
    this.selectedMaintenance = null;
    this.resetForm();
    this.validationErrors = {};
  }

validateNumber(event: any, field: string) {
  const input = event.target as HTMLInputElement;
  let value = input.value;
  
  // Remove any non-digit characters
  value = value.replace(/[^0-9]/g, '');
  
  // Update the input value to only contain digits
  input.value = value;
  
  // Update the form value - set to null if empty, otherwise parse as number
  if (field === 'cost') {
    this.maintenanceForm.cost = value ? parseInt(value, 10) : null;
  }
  
  // Clear validation error
  this.clearValidationError(field);
}

// Also update the clearValidationError call for cost input
clearValidationError(field: string) {
  if (this.validationErrors[field]) {
    delete this.validationErrors[field];
  }
}

resetForm() {
  this.maintenanceForm = {
    date: '',
    itemID: 0,
    companyID: 0,
    maintenanceEmployeeID: 0,
    cost: null,
    note: ''
  };
  this.maintenanceType = 'company';
}

  onMaintenanceTypeChange(type: 'company' | 'employee') {
    this.maintenanceType = type;
    // Clear the other field when switching types
    if (type === 'company') {
      this.maintenanceForm.maintenanceEmployeeID = 0;
    } else {
      this.maintenanceForm.companyID = 0;
    }
    this.clearValidationError('maintenanceType');
  }

    isFormValid(): boolean {
      this.validationErrors = {};
      let isValid = true;

      if (!this.maintenanceForm.date || this.maintenanceForm.date.trim() === '') {
        this.validationErrors['date'] = '*Date is required';
        isValid = false;
      }

      if (this.maintenanceForm.itemID <= 0) {
        this.validationErrors['itemID'] = '*Item is required';
        isValid = false;
      }

      if (this.maintenanceType === 'company' && this.maintenanceForm.companyID <= 0) {
        this.validationErrors['companyID'] = '*Company is required';
        isValid = false;
      }

      if (this.maintenanceType === 'employee' && this.maintenanceForm.maintenanceEmployeeID <= 0) {
        this.validationErrors['maintenanceEmployeeID'] = '*Employee is required';
        isValid = false;
      }

      // Update cost validation to handle null values
      if (this.maintenanceForm.cost === null || this.maintenanceForm.cost === undefined) {
        this.validationErrors['cost'] = '*Cost is required';
        isValid = false;
      } else if (this.maintenanceForm.cost <= 0) {
        this.validationErrors['cost'] = '*Cost must be greater than 0';
        isValid = false;
      } else if (isNaN(this.maintenanceForm.cost)) {
        this.validationErrors['cost'] = '*Cost must be a valid number';
        isValid = false;
      }

      return isValid;
    }


async saveMaintenance() {
  if (this.isFormValid()) {
    try {
      this.isSaving = true;
      const domainName = this.apiService.GetHeader();

      // Prepare the data based on selected type - only include the relevant ID
      const submitData: any = {
        date: this.maintenanceForm.date,
        itemID: this.maintenanceForm.itemID,
        cost: this.maintenanceForm.cost,
        note: this.maintenanceForm.note
      };

      // Only include the relevant ID based on maintenance type
      if (this.maintenanceType === 'company') {
        submitData.companyID = this.maintenanceForm.companyID;
        // Don't include maintenanceEmployeeID at all
      } else {
        submitData.maintenanceEmployeeID = this.maintenanceForm.maintenanceEmployeeID;
        // Don't include companyID at all
      }

      if (this.editMode && this.selectedMaintenance) {
        await firstValueFrom(
          this.maintenanceService.update(this.selectedMaintenance.id, submitData, domainName)
        );
        Swal.fire('Success', 'Maintenance record updated successfully!', 'success');
      } else {
        await firstValueFrom(
          this.maintenanceService.create(submitData, domainName)
        );
        Swal.fire('Success', 'Maintenance record created successfully!', 'success');
      }

      this.loadMaintenance();
      this.closeModal();
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      Swal.fire('Error', 'Failed to save maintenance record. Please try again later.', 'error');
    } finally {
      this.isSaving = false;
    }
  }
}

  deleteMaintenance(row: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this maintenance record!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#2E3646',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        const domainName = this.apiService.GetHeader();
        this.maintenanceService.delete(row.id, domainName).subscribe({
          next: () => {
            if (this.maintenanceList.length === 1) {
              this.maintenanceList = [];
            }
            this.loadMaintenance();
            Swal.fire('Deleted!', 'The maintenance record has been deleted.', 'success');
          },
          error: (error) => {
            console.error('Error deleting maintenance record:', error);
            Swal.fire('Error', 'Failed to delete maintenance record. Please try again later.', 'error');
          },
        });
      }
    });
  }
}