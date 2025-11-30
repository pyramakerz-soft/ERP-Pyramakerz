import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Subscription } from 'rxjs';
// import Swal from 'sweetalert2';

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
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [FormsModule, CommonModule, TableComponent, SearchComponent, TranslateModule],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})

@InitLoader()
export class MaintenanceComponent implements OnInit, OnDestroy {
  // Table configuration
  headers: string[] = ['ID', 'Date', 'Item', 'Company', 'Employee', 'Cost', 'Note', 'Actions'];
  keys: string[] = ['id', 'date', 'itemEnglishName', 'companyEnglishName', 'employeeEnglishName', 'cost', 'note'];
  keysArray: string[] = ['id', 'itemEnglishName', 'companyEnglishName', 'employeeEnglishName', 'note'];
  formattedCost: string = '';

  // Data
  maintenanceList: any[] = []; // Changed to any[] to include actions property
  TableData: any[] = []; // Changed to any[] to include actions property
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
  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;
  isDeleting: boolean = false;
  DomainName: string = '';
  
  constructor(
    private maintenanceService: MaintenanceService,
    private languageService: LanguageService,
    private maintenanceItemService: MaintenanceItemService,
    private maintenanceCompaniesService: MaintenanceCompaniesService,
    private maintenanceEmployeesService: MaintenanceEmployeesService,
    private apiService: ApiService,
    private menuService: MenuService,
    private editDeleteService: DeleteEditPermissionService,
    private accountService: AccountService,
    private translate: TranslateService,
    private loadingService: LoadingService 
  ) {}

  ngOnInit(): void {
    this.User_Data_After_Login = this.accountService.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.apiService.GetHeader();

    this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
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

  GetAllData(DomainName: string, pageNumber: number, pageSize: number) {
    this.maintenanceList = [];
    this.TableData = [];
    this.maintenanceService.getAllWithPaggination(DomainName, pageNumber, pageSize).subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage;
        this.PageSize = data.pagination.pageSize;
        this.TotalPages = data.pagination.totalPages;
        this.TotalRecords = data.pagination.totalRecords;
        this.TableData = data.data;
        this.loadMaintenance()
      },
      (error) => {
        if (error.status == 404) {
          if (this.TotalRecords != 0) {
            let lastPage;
            if (this.isDeleting) {
              lastPage = (this.TotalRecords - 1) / this.PageSize;
            } else {
              lastPage = this.TotalRecords / this.PageSize;
            }
            if (lastPage >= 1) {
              if (this.isDeleting) {
                this.CurrentPage = Math.floor(lastPage);
                this.isDeleting = false;
              } else {
                this.CurrentPage = Math.ceil(lastPage);
              }
              this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
            }
          }
        } else {
          const errorMessage =
            error.error?.message ||
            this.translate.instant('Failed to load Data');
          this.showErrorAlert(errorMessage);
        }
      }
    );
  }

  async loadMaintenance(): Promise<void> {
    try {
      const domainName = this.apiService.GetHeader();
      this.maintenanceList = this.TableData.map(item => {
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
    await this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
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
      this.validationErrors['date'] = this.translate.instant('Date is required');
      isValid = false;
    }

    if (!this.maintenanceForm.itemID || this.maintenanceForm.itemID <= 0) {
      this.validationErrors['itemID'] = this.translate.instant('Item is required');
      isValid = false;
    }

    if (this.maintenanceType === 'company' && (!this.maintenanceForm.companyID || this.maintenanceForm.companyID <= 0)) {
      this.validationErrors['companyID'] = this.translate.instant('Company is required');
      isValid = false;
    }

    if (this.maintenanceType === 'employee' && (!this.maintenanceForm.maintenanceEmployeeID || this.maintenanceForm.maintenanceEmployeeID <= 0)) {
      this.validationErrors['maintenanceEmployeeID'] = this.translate.instant('Employee is required');
      isValid = false;
    }

    // Updated cost validation for decimals
    if (this.maintenanceForm.cost === null || this.maintenanceForm.cost === undefined) {
      this.validationErrors['cost'] = this.translate.instant('Cost is required');
      isValid = false;
    } else if (isNaN(this.maintenanceForm.cost)) {
      this.validationErrors['cost'] = this.translate.instant('Cost must be a valid number');
      isValid = false;
    } else if (this.maintenanceForm.cost <= 0) {
      this.validationErrors['cost'] = this.translate.instant('Cost must be greater than 0');
      isValid = false;
    }

    return isValid;
  }

  private async showErrorAlert(errorMessage: string) {
    const Swal = await import('sweetalert2').then(m => m.default);
  
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

  private async showSuccessAlert(message: string) {
    const translatedTitle = this.translate.instant('Success');
    const translatedButton = this.translate.instant('Okay');
    
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      icon: 'success',
      title: translatedTitle,
      text: message,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

async saveMaintenance(): Promise<void> {
  if (!this.isFormValid()) return;

  try {
    this.isSaving = true;
    const domainName = this.apiService.GetHeader();

    // Ensure date is properly formatted as YYYY-MM-DD
    const submitData: Maintenance = {
      ...this.maintenanceForm,
      companyID: this.maintenanceType === 'company' ? this.maintenanceForm.companyID : null,
      maintenanceEmployeeID: this.maintenanceType === 'employee' ? this.maintenanceForm.maintenanceEmployeeID : null
    };

    if (this.editMode && this.maintenanceForm.id) {
      await firstValueFrom(this.maintenanceService.update(submitData, domainName));
      this.showSuccessAlert(this.translate.instant('Maintenance record updated successfully'));
    } else {
      await firstValueFrom(this.maintenanceService.create(submitData, domainName));
      this.showSuccessAlert(this.translate.instant('Maintenance record created successfully'));
    }

    this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
    this.closeModal();
  } catch (error: any) {
    console.error('Error saving maintenance record:', error);
    
    // Extract backend error message
    let errorMessage = this.translate.instant('Failed to save maintenance record');
    
    if (error.error) {
      // Try to get the error message from different possible properties
      errorMessage = error.error.message || 
                    error.error.error || 
                    error.error.title ||
                    error.error.Message ||
                    error.error.Error ||
                    this.getErrorMessageFromResponse(error);
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 404) {
      errorMessage = this.translate.instant('Resource not found');
    } else if (error.status === 400) {
      errorMessage = this.translate.instant('Bad request - please check your input');
    } else if (error.status === 500) {
      errorMessage = this.translate.instant('Server error - please try again later');
    }
    
    this.showErrorAlert(errorMessage);
  } finally {
    this.isSaving = false;
  }
}

// Helper method to extract error message from different response formats
private getErrorMessageFromResponse(error: any): string {
  try {
    // If the error is a string, try to parse it as JSON
    if (typeof error.error === 'string') {
      const parsedError = JSON.parse(error.error);
      return parsedError.message || parsedError.error || parsedError.title || String(error.error);
    }
    
    // If error has a statusText, use it
    if (error.statusText) {
      return error.statusText;
    }
    
    return String(error);
  } catch (parseError) {
    // If parsing fails, return the original error as string
    return String(error.error || error);
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

  async deleteMaintenance(row: any) {
    if (!this.IsAllowDelete(row.insertedByUserId || 0)) {
      const errorMessage = this.translate.instant('You do not have permission to delete this record');
      this.showErrorAlert(errorMessage);
      return;
    }

    const deleteTitle = this.translate.instant('Are you sure you want to delete this maintenance record?');
    const deleteText = this.translate.instant('You will not be able to recover this maintenance record');
    const confirmButton = this.translate.instant('Delete');
    const cancelButton = this.translate.instant('Cancel');

    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: deleteTitle,
      text: deleteText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#2E3646',
      confirmButtonText: confirmButton,
      cancelButtonText: cancelButton,
    }).then((result) => {
      if (result.isConfirmed) {
        const domainName = this.apiService.GetHeader();
        this.maintenanceService.delete(row.id, domainName).subscribe({
          next: () => {
            this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
            this.showSuccessAlert(this.translate.instant('Maintenance record deleted successfully'));
          },
          error: (error) => {
            console.error('Error deleting maintenance record:', error);
            const errorMessage = error.error?.message || this.translate.instant('Failed to delete maintenance record');
            this.showErrorAlert(errorMessage);
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

  changeCurrentPage(currentPage: number) {
    this.CurrentPage = currentPage;
    this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
  }

  validatePageSize(event: any) {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
    }
  }

  get visiblePages(): number[] {
    const total = this.TotalPages;
    const current = this.CurrentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = current - half;
    let end = current + half;

    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  validateNumberPage(event: any): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      this.PageSize = 0;
    }
  }

  private getRequiredErrorMessage(fieldName: string): string {
  const fieldTranslated = this.translate.instant(fieldName);
  const requiredTranslated = this.translate.instant('Is Required');
  
  if (this.isRtl) {
    return `${requiredTranslated} ${fieldTranslated}`;
  } else {
    return `${fieldTranslated} ${requiredTranslated}`;
  }
}
}