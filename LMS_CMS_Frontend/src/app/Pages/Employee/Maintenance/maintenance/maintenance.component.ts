import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

// Services
import { MaintenanceService } from '../../../../Services/Employee/Maintenance/maintenance.services';
import { LanguageService } from '../../../../Services/shared/language.service';
import { ApiService } from '../../../../Services/api.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { AccountService } from '../../../../Services/account.service';

// Components
import { TableComponent } from '../../../../Component/reuse-table/reuse-table.component';
import { SearchComponent } from '../../../../Component/search/search.component';

import { TokenData } from '../../../../Models/token-data';
import { MaintenanceItemService } from '../../../../Services/Employee/Maintenance/maintenance-item.service';
import { MaintenanceCompaniesService } from '../../../../Services/Employee/Maintenance/maintenance-companies.service';
import { MaintenanceEmployeesService } from '../../../../Services/Employee/Maintenance/maintenance-employees.service';
import { MaintenanceItem } from '../../../../Models/Maintenance/maintenance-item';
import { Maintenance } from '../../../../Models/Maintenance/maintenance';
import { MaintenanceCompanies } from '../../../../Models/Maintenance/maintenance-companies';
import { MaintenanceEmployees } from '../../../../Models/Maintenance/maintenance-employees';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [FormsModule, CommonModule, TableComponent, SearchComponent, TranslateModule],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  // Table configuration
  headers: string[] = ['ID', 'Date', 'Item', 'Company', 'Employee', 'Cost', 'Note', 'Actions'];
  keys: string[] = ['id', 'date', 'itemEnglishName', 'companyEnglishName', 'employeeEnglishName', 'cost', 'note'];
  keysArray: string[] = ['id', 'itemEnglishName', 'companyEnglishName', 'employeeEnglishName', 'note'];
  formattedCost: string = '';


  // Data
  maintenanceList: any[] = []; // Changed to any[] to include actions property
  maintenanceItems: MaintenanceItem[] = [];
  maintenanceCompanies: MaintenanceCompanies[] = [];
  maintenanceEmployees: MaintenanceEmployees[] = [];
  
  // Form state
  isModalVisible = false;
  isSaving = false;
  editMode = false;
  searchKey = 'id';
  searchValue = '';
  selectedMaintenance: Maintenance | null = null;
  maintenanceType: 'company' | 'employee' = 'company';
  validationErrors: { [key: string]: string } = {};
  
  // Permissions
  AllowEdit = false;
  AllowDelete = false;
  AllowEditForOthers = false;
  AllowDeleteForOthers = false;
  path = 'maintenance';
  
  // User and language
  isRtl = false;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  UserID = 0;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];
  
  maintenanceForm: Maintenance = new Maintenance();

  constructor(
    private maintenanceService: MaintenanceService,
    private languageService: LanguageService,
    private maintenanceItemService: MaintenanceItemService,
    private maintenanceCompaniesService: MaintenanceCompaniesService,
    private maintenanceEmployeesService: MaintenanceEmployeesService,
    private apiService: ApiService,
    private menuService: MenuService,
    private editDeleteService: DeleteEditPermissionService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.User_Data_After_Login = this.accountService.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    
    this.loadMaintenance();
    this.loadDropdownData();
    this.setupPermissions();
    this.setupLanguage();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupLanguage(): void {
    const langSub = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.subscriptions.push(langSub);
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  private setupPermissions(): void {
    const menuSub = this.menuService.menuItemsForEmployee$.subscribe(items => {
      const maintenancePage = this.menuService.findByPageName(this.path, items);
      if (maintenancePage) {
        this.AllowEdit = maintenancePage.allow_Edit;
        this.AllowDelete = maintenancePage.allow_Delete;
        this.AllowDeleteForOthers = maintenancePage.allow_Delete_For_Others;
        this.AllowEditForOthers = maintenancePage.allow_Edit_For_Others;
      }
    });
    this.subscriptions.push(menuSub);
  }

  async loadDropdownData(): Promise<void> {
    try {
      const domainName = this.apiService.GetHeader();
      const itemsSub = this.maintenanceItemService.Get(domainName).subscribe(
        items => this.maintenanceItems = items
      );
      this.subscriptions.push(itemsSub);

      const companiesSub = this.maintenanceCompaniesService.Get(domainName).subscribe(
        companies => this.maintenanceCompanies = companies
      );
      this.subscriptions.push(companiesSub);

      const employeesSub = this.maintenanceEmployeesService.Get(domainName).subscribe(
        employees => this.maintenanceEmployees = employees
      );
      this.subscriptions.push(employeesSub);

    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  }

async loadMaintenance(): Promise<void> {
  try {
    const domainName = this.apiService.GetHeader();
    const data = await firstValueFrom(this.maintenanceService.getAll(domainName));
    
    this.maintenanceList = data.map(item => {
      // Keep dates as strings for proper binding to HTML date input
      const maintenanceItem: any = {
        ...item,
        // Remove Date object conversion - keep as strings
        date: item.date, // Keep as string for proper date input binding
        fromDate: item.fromDate,
        toDate: item.toDate,
        // Handle null values for display purposes
        companyEnglishName: item.companyEnglishName || '-',
        companyArabicName: item.companyArabicName || '-',
        employeeEnglishName: item.employeeEnglishName || '-',
        employeeArabicName: item.employeeArabicName || '-',
        // Ensure numeric fields have proper values
        cost: item.cost ?? null,
        companyID: item.companyID ?? null,
        maintenanceEmployeeID: item.maintenanceEmployeeID ?? null,
        insertedByUserId: item.insertedByUserId ?? undefined,
        // Add actions property for the table component
        actions: {
          edit: this.IsAllowEdit(item.insertedByUserId || 0),
          delete: this.IsAllowDelete(item.insertedByUserId || 0),
          view: false
        }
      };
      
      return maintenanceItem;
    });

    this.applySearchFilter();
  } catch (error) {
    console.error('Error loading maintenance data:', error);
    Swal.fire('Error', 'Failed to load maintenance records', 'error');
  }
}

  private applySearchFilter(): void {
    if (this.searchValue) {
      this.maintenanceList = this.maintenanceList.filter(item => {
        const fieldValue = item[this.searchKey as keyof Maintenance]?.toString().toLowerCase() || '';
        return fieldValue.includes(this.searchValue.toLowerCase());
      });
    }
  }

  async onSearchEvent(event: { key: string, value: any }): Promise<void> {
    this.searchKey = event.key;
    this.searchValue = event.value;
    await this.loadMaintenance();
  }

openModal(item?: any): void {
  this.isModalVisible = true;
  this.editMode = !!item;
  this.validationErrors = {};
  
  if (item) {
    this.selectedMaintenance = item;
    this.maintenanceForm = {
      id: item.id,
      date: item.date,
      fromDate: item.fromDate,
      toDate: item.toDate,
      itemID: item.itemID,
      itemArabicName: item.itemArabicName,
      itemEnglishName: item.itemEnglishName,
      companyEnglishName: item.companyEnglishName,
      companyArabicName: item.companyArabicName,
      companyID: item.companyID && item.companyID > 0 ? item.companyID : null,
      employeeEnglishName: item.employeeEnglishName,
      employeeArabicName: item.employeeArabicName,
      maintenanceEmployeeID: item.maintenanceEmployeeID && item.maintenanceEmployeeID > 0 ? item.maintenanceEmployeeID : null,
      cost: item.cost,
      costRawString: item.cost ? item.cost.toString() : '', // Initialize costRawString
      note: item.note,
      en_Name: item.en_Name,
      ar_Name: item.ar_Name,
      insertedByUserId: item.insertedByUserId,
    };

    // Set maintenance type based on which ID is present
    if (item.companyID && item.companyID > 0) {
      this.maintenanceType = 'company';
    } else if (item.maintenanceEmployeeID && item.maintenanceEmployeeID > 0) {
      this.maintenanceType = 'employee';
    } else {
      this.maintenanceType = 'company'; // default
    }
  } else {
    this.resetForm();
  }
}

  closeModal(): void {
    this.isModalVisible = false;
    this.selectedMaintenance = null;
    this.resetForm();
    this.validationErrors = {};
  }

  private resetForm(): void {
    this.maintenanceForm = new Maintenance();
    this.maintenanceType = 'company';
  }

  onMaintenanceTypeChange(type: 'company' | 'employee'): void {
    this.maintenanceType = type;
    // Clear the other field
    if (type === 'company') {
      this.maintenanceForm.maintenanceEmployeeID = null;
    } else {
      this.maintenanceForm.companyID = null;
    }
    this.clearValidationError('maintenanceType');
  }

  validateNumber(event: any, field: string): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');
    input.value = value;
    
    if (field === 'cost') {
      this.maintenanceForm.cost = value ? parseInt(value, 10) : null;
    }
    
    this.clearValidationError(field);
  }

  clearValidationError(field: string): void {
    if (this.validationErrors[field]) {
      delete this.validationErrors[field];
    }
  }

isFormValid(): boolean {
  this.validationErrors = {};
  let isValid = true;

  // Check if date is valid
  if (!this.maintenanceForm.date) {
    this.validationErrors['date'] = '*Date is required';
    isValid = false;
  }

  if (!this.maintenanceForm.itemID || this.maintenanceForm.itemID <= 0) {
    this.validationErrors['itemID'] = '*Item is required';
    isValid = false;
  }

  if (this.maintenanceType === 'company' && (!this.maintenanceForm.companyID || this.maintenanceForm.companyID <= 0)) {
    this.validationErrors['companyID'] = '*Company is required';
    isValid = false;
  }

  if (this.maintenanceType === 'employee' && (!this.maintenanceForm.maintenanceEmployeeID || this.maintenanceForm.maintenanceEmployeeID <= 0)) {
    this.validationErrors['maintenanceEmployeeID'] = '*Employee is required';
    isValid = false;
  }

  // Updated cost validation for decimals
  if (this.maintenanceForm.cost === null || this.maintenanceForm.cost === undefined) {
    this.validationErrors['cost'] = '*Cost is required';
    isValid = false;
  } else if (isNaN(this.maintenanceForm.cost)) {
    this.validationErrors['cost'] = '*Cost must be a valid number';
    isValid = false;
  } else if (this.maintenanceForm.cost <= 0) {
    this.validationErrors['cost'] = '*Cost must be greater than 0';
    isValid = false;
  }

  return isValid;
}

async saveMaintenance(): Promise<void> {
  if (!this.isFormValid()) return;

  try {
    this.isSaving = true;
    const domainName = this.apiService.GetHeader();

    // Ensure date is properly formatted as YYYY-MM-DD
    // Since date is always a string in the form, we can use it directly
    const submitData: Maintenance = {
      ...this.maintenanceForm,
      companyID: this.maintenanceType === 'company' ? this.maintenanceForm.companyID : null,
      maintenanceEmployeeID: this.maintenanceType === 'employee' ? this.maintenanceForm.maintenanceEmployeeID : null
    };

    if (this.editMode && this.maintenanceForm.id) {
      await firstValueFrom(this.maintenanceService.update(submitData, domainName));
      Swal.fire('Success', 'Maintenance record updated successfully!', 'success');
    } else {
      await firstValueFrom(this.maintenanceService.create(submitData, domainName));
      Swal.fire('Success', 'Maintenance record created successfully!', 'success');
    }

    this.loadMaintenance();
    this.closeModal();
  } catch (error) {
    console.error('Error saving maintenance record:', error);
    Swal.fire('Error', String(error), 'error');
  } finally {
    this.isSaving = false;
  }
}

validateDecimal(event: any, field: string): void {
  const input = event.target as HTMLInputElement;
  let value = input.value;
  
  // Store cursor position to restore it after manipulation
  const cursorPosition = input.selectionStart;
  
  // Remove any characters that are not digits or decimal points
  value = value.replace(/[^0-9.]/g, '');
  
  // Prevent multiple decimal points
  const decimalCount = (value.match(/\./g) || []).length;
  if (decimalCount > 1) {
    // Remove extra decimal points by keeping only the first one
    const parts = value.split('.');
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Remove scientific notation (e, E, e+, e-, E+, E-)
  value = value.replace(/[eE][+-]?/g, '');
  
  // Update the input value
  input.value = value;
  
  // Restore cursor position (adjust for any removed characters)
  setTimeout(() => {
    input.setSelectionRange(cursorPosition, cursorPosition);
  }, 0);
  
  // Convert to number for the form model
  if (field === 'cost') {
    if (value === '' || value === '.') {
      this.maintenanceForm.cost = null;
      this.maintenanceForm.costRawString = '';
    } else {
      // Parse as float to maintain decimal precision
      this.maintenanceForm.cost = parseFloat(value);
      // Store the raw string to avoid scientific notation issues
      this.maintenanceForm.costRawString = value;
    }
  }
  
  this.clearValidationError(field);
}

// private formatDate(date: Date): string {
//   const year = date.getFullYear();
//   const month = (date.getMonth() + 1).toString().padStart(2, '0');
//   const day = date.getDate().toString().padStart(2, '0');
//   return `${year}-${month}-${day}`;
// }

  deleteMaintenance(row: any): void {
    if (!this.IsAllowDelete(row.insertedByUserId || 0)) {
      Swal.fire('Error', 'You do not have permission to delete this record', 'error');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this maintenance record!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#2E3646',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const domainName = this.apiService.GetHeader();
        this.maintenanceService.delete(row.id, domainName).subscribe({
          next: () => {
            this.loadMaintenance();
            Swal.fire('Deleted!', 'The maintenance record has been deleted.', 'success');
          },
          error: (error) => {
            console.error('Error deleting maintenance record:', error);
            Swal.fire('Error', 'Failed to delete maintenance record', 'error');
          },
        });
      }
    });
  }

  IsAllowDelete(insertedByID: number): boolean {
    return this.editDeleteService.IsAllowDelete(
      insertedByID,
      this.UserID,
      this.AllowDeleteForOthers
    );
  }

  IsAllowEdit(insertedByID: number): boolean {
    return this.editDeleteService.IsAllowEdit(
      insertedByID,
      this.UserID,
      this.AllowEditForOthers
    );
  }
}