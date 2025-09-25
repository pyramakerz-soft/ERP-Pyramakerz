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
@Component({
  selector: 'app-violation',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './violation.component.html',
  styleUrl: './violation.component.css'
})
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
    private realTimeService: RealTimeNotificationServiceService,
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

    this.GetAllData();
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

  GetAllData() {
    this.TableData = [];
    this.violationServ.Get(this.DomainName).subscribe((d) => {
      this.TableData = d;
    });
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
    this.violation.attach = '';
    this.violation.attachFile = null;

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'image/jpeg',
      'image/png'
    ];

    if (file) {
      // Check size
      if (file.size > 25 * 1024 * 1024) {
        this.validationErrors['attachFile'] = 'The file size exceeds the maximum limit of 25 MB.';
        return;
      }

      // Check type
      if (allowedMimeTypes.includes(file.type)) {
        this.violation.attachFile = file;
        this.validationErrors['attachFile'] = '';

        const reader = new FileReader();
        reader.readAsDataURL(file);
      } else {
        this.validationErrors['attachFile'] = 'Invalid file type. Only PDF, DOC, DOCX, JPEG, and PNG are allowed.';
        return;
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
          this.GetAllData();
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
            this.GetAllData();
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
              text: 'Updatedd Successfully',
              confirmButtonColor: '#089B41',
            });
            this.GetAllData();
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
            this.validationErrors[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        }
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
    this.key = event.key;
    this.value = event.value;
    try {
      const data: Violation[] = await firstValueFrom(
        this.violationServ.Get(this.DomainName)
      );
      this.TableData = data || [];

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
}
