import { Component } from '@angular/core';
import { Violation } from '../../../../Models/Violation/violation';
import { ViolationService } from '../../../../Services/Employee/Violation/violation.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { EmployeeTypeService } from '../../../../Services/Employee/employee-type.service';
import { EmployeeTypeGet } from '../../../../Models/Administrator/employee-type-get';
import { ViolationTypeService } from '../../../../Services/Employee/Violation/violation-type.service';
import { Employee } from '../../../../Models/Employee/employee';
import { ViolationType } from '../../../../Models/Violation/violation-type';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
@Component({
  selector: 'app-violation',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './violation.component.html',
  styleUrl: './violation.component.css'
})

@InitLoader()
export class ViolationComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: Violation[] = [];
  empTypes: EmployeeTypeGet[] = [];
  violationType: ViolationType[] = [];
  employees: Employee[] = [];
  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'violationTypeName', 'employeeEnglishName'];

  violation: Violation = new Violation();

  validationErrors: { [key in keyof Violation]?: string } = {};
  isLoading = false;
  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;
  isDeleting: boolean = false;

  private readonly allowedExtensions: string[] = [
    '.jpg', '.jpeg', '.png', '.gif',
    '.pdf', '.doc', '.docx', '.txt',
    '.xls', '.xlsx', '.csv',
    '.mp4', '.avi', '.mkv', '.mov'
  ];
  
  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private translate: TranslateService,
    private languageService: LanguageService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public violationServ: ViolationService,
    public violationTypeServ: ViolationTypeService,
    public EmployeeServ: EmployeeService,
    public EmployeeTypeServ: EmployeeTypeService,  
    private loadingService: LoadingService 
  ) { }
  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });

    this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
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

  // GetAllData() {
  //   this.TableData = [];
  //   this.violationServ.Get(this.DomainName).subscribe((d) => {
  //     this.TableData = d;
  //   });
  // }

  GetAllData(DomainName: string, pageNumber: number, pageSize: number) {
    this.TableData = [];
    this.violationServ.Get(DomainName, pageNumber, pageSize).subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage;
        this.PageSize = data.pagination.pageSize;
        this.TotalPages = data.pagination.totalPages;
        this.TotalRecords = data.pagination.totalRecords;
        this.TableData = data.data;
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
        } 
      }
    );
  }

  GetAllempTypes() {
    this.empTypes = [];
    this.violation.employeeTypeId = 0
    this.EmployeeTypeServ.Get(this.DomainName).subscribe((d) => {
      this.empTypes = d;
    });
  }

  GetAllViolationByType() {
    this.violationType = [];
    this.violation.violationTypeID = 0
    this.violationTypeServ.GetByEmployeeType(this.violation.employeeTypeId, this.DomainName).subscribe((d) => {
      this.violationType = d;
    });
  }

  GetAllEmployeeByType() {
    this.employees = [];
    this.violation.employeeID = 0
    this.EmployeeServ.GetWithTypeId(this.violation.employeeTypeId, this.DomainName).subscribe((d) => {
      this.employees = d;
    });
  }

  onImageFileSelected(event: any) {
    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;

    if (file) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!this.allowedExtensions.includes(fileExtension)) { 
        this.validationErrors['attachFile'] = `The file ${file.name} is not an allowed type. Allowed types are: ${this.allowedExtensions.join(', ')}`;
        this.violation.attachFile = null;
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        this.validationErrors['attachFile'] = 'The file size exceeds the maximum limit of 25 MB.';
        this.violation.attachFile = null;
        return; 
      } else{
        this.violation.attachFile = file;  

        const reader = new FileReader();
        reader.readAsDataURL(file);
      }
    }
    
    input.value = '';
  }   

  Create() {
    this.mode = 'Create';
    this.violation = new Violation();
    this.validationErrors = {};
    this.GetAllempTypes()
    this.openModal();
  }

  removeAttachment(){
    if(this.mode == 'Edit'){
      this.violation.deletedAttach = this.violation.attach
      this.violation.attach = ""
    }
    else{
      this.violation.attachFile = null;
      this.violation.attach = ""
    }
  }

  Delete(id: number) {
    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete')+ " " + this.translate.instant('هذه') + " " + this.translate.instant('the') + this.translate.instant('Violation')+ this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.violationServ.Delete(id, this.DomainName).subscribe(() => {
        this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
        });
      }
    });
  }

  Edit(id: number) {
    this.mode = 'Edit';
    this.violationServ.GetByID(id, this.DomainName).subscribe((d) => {
      this.violation = d;
      this.empTypes = [];
      this.EmployeeTypeServ.Get(this.DomainName).subscribe((d) => {
        this.empTypes = d;
        this.violationType = [];
        this.violationTypeServ.GetByEmployeeType(this.violation.employeeTypeId, this.DomainName).subscribe((d) => {
          this.violationType = d;
          this.employees = [];
          this.EmployeeServ.GetWithTypeId(this.violation.employeeTypeId, this.DomainName).subscribe((d) => {
            this.employees = d;
          });
        });
      });
    });
    this.openModal();
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(
      InsertedByID,
      this.UserID,
      this.AllowDeleteForOthers
    );
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(
      InsertedByID,
      this.UserID,
      this.AllowEditForOthers
    );
    return IsAllow;
  }

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true;
      if (this.mode == 'Create') {
        this.violationServ.Add(this.violation, this.DomainName).subscribe(
          (d) => {
            this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
            this.isLoading = false;
            this.closeModal();
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Created Successfully',
              confirmButtonColor: '#089B41',
            });

          },
          (error) => {
            this.isLoading = false; // Hide spinner
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' }
            });
          }
        );
      }
      if (this.mode == 'Edit') {
        this.violationServ.Edit(this.violation, this.DomainName).subscribe(
          (d) => {
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Updated Successfully',
              confirmButtonColor: '#089B41',
            });
            this.GetAllData(this.DomainName, this.CurrentPage, this.PageSize);
            this.isLoading = false;
            this.closeModal();
          },
          (error) => {
            this.isLoading = false; // Hide spinner
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' }
            });
          }
        );
      }
    }
  }

  closeModal() {
    this.isModalVisible = false;
  }

  openModal() {
    this.validationErrors = {};
    this.isModalVisible = true;
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.violation) {
      if (this.violation.hasOwnProperty(key)) {
        const field = key as keyof Violation;
        if (!this.violation[field]) {
          if (
            field == 'date' ||
            field == 'violationTypeID' ||
            field == 'employeeTypeId' ||
            field == 'employeeID'
          ) {
            const displayName = this.getFieldDisplayName(field);
            this.validationErrors[field] = this.getRequiredErrorMessage(displayName);
            isValid = false;
          }
        }
      }
    }
 if (this.violation.date) {
    const dateValue = new Date(this.violation.date);

    // Invalid date check
    if (isNaN(dateValue.getTime())) {
      this.validationErrors['date'] ='Please enter a valid date';
      isValid = false;
    }

    const dateStr = this.violation.date.toString(); // original input, e.g., "222222-11-09"
      // ✅ Extract year part and check its length
    const yearPart = dateStr.split('-')[0]; // "222222" from "222222-11-09"
    if (yearPart.length > 5 ) {
      this.validationErrors['date'] = 'Please enter a valid date.';
      isValid = false;
    }
  }
    return isValid;
  }

  capitalizeField(field: keyof Violation): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof Violation; value: any }) {
    const { field, value } = event;
    (this.violation as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  validateNumber(event: any, field: keyof Violation): void {
    const value = event.target.value;
    if (field === 'date') {
      const intValue = parseInt(value, 10);
      if (!/^\d+$/.test(value)) {
        event.target.value = '';
        this.violation[field] = '' as never;
      }
    } else {
      const numberValue = parseFloat(value);
      if (isNaN(numberValue)) {
        event.target.value = '';
        this.violation[field] = '' as never;
      }
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.PageSize = this.TotalRecords
    this.CurrentPage = 1
    this.TotalPages = 1
    this.key = event.key;
    this.value = event.value;
    try {
      const data: any = await firstValueFrom(
        this.violationServ.Get(this.DomainName, this.CurrentPage, this.PageSize)
      );
      this.TableData = data.data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.TableData = this.TableData.filter((t) => {
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

  view(Id: number) {
    this.router.navigateByUrl('Employee/violation/' + Id);
  }

  private getFieldDisplayName(field: keyof Violation): string {
    // map technical field names to user-facing labels (these keys will be translated by translate.instant)
    const map: { [key in keyof Violation]?: string } = {
      date: 'Date',
      violationTypeID: 'Violation Type',
      employeeTypeId: 'Employee Type',
      employeeID: 'Employee',
    };
    return map[field] ?? this.capitalizeField(field);
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
}
