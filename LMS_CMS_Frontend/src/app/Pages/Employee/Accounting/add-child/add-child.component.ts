import { Component } from '@angular/core';
import { EmployeeStudentService } from '../../../../Services/Employee/Accounting/employee-student.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { EmplyeeStudent } from '../../../../Models/Accounting/emplyee-student';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { Student } from '../../../../Models/student';
import { StudentService } from '../../../../Services/student.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-add-child',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './add-child.component.html',
  styleUrl: './add-child.component.css',
})
export class AddChildComponent {
  User_Data_After_Login: TokenData = new TokenData(
    '',
    0,
    0,
    0,
    0,
    '',
    '',
    '',
    '',
    ''
  );

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: EmplyeeStudent[] = [];

  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'studentName'];
  NationalID: string = '';
  Student: Student = new Student();
  emplyeeStudent: EmplyeeStudent = new EmplyeeStudent();
  isRtl: boolean = false;
  subscription!: Subscription;
  validationErrors: { [key in keyof EmplyeeStudent]?: string } = {};
  IsNationalIsEmpty: string = '';

  constructor(
    private router: Router,
    private menuService: MenuService,
    private languageService: LanguageService,
    private translate: TranslateService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public BusTypeServ: BusTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public EmplyeeStudentServ: EmployeeStudentService,
    public StudentServ: StudentService
  ) {}
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

    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
    this.isRtl = document.documentElement.dir === 'rtl';

    this.GetAllData();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  GetAllData() {
    this.TableData = [];
    this.EmplyeeStudentServ.Get(this.UserID, this.DomainName).subscribe((d) => {
      this.TableData = d;
    });
  }

  Create() {
    this.mode = 'Create';
    this.Student = new Student();
    this.NationalID = '';
    this.emplyeeStudent = new EmplyeeStudent();
    this.openModal();
  }

  Delete(id: number) {
    Swal.fire({
      title:
        this.translate.instant('Are you sure you want to') +
        ' ' +
        this.translate.instant('delete') +
        ' ' +
        this.translate.instant('هذا') +
        ' ' +
        this.translate.instant('Child'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.EmplyeeStudentServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData();
        });
      }
    });
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(
      InsertedByID,
      this.UserID,
      this.AllowDeleteForOthers
    );
    return IsAllow;
  }

  CreateOREdit() {
    if (this.NationalID == '') {
      this.IsNationalIsEmpty = this.getRequiredErrorMessage('National Id');
      return;
    }
    if (this.emplyeeStudent.studentID != 0) {
      this.EmplyeeStudentServ.Add(
        this.emplyeeStudent,
        this.DomainName
      ).subscribe(
        (d) => {
          this.GetAllData();
          this.closeModal();
        },
        (error) => {
          if (error.error == 'Student Already Assigned To This Employee') {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Student Already Assigned To This Employee',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        }
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'There is no student with this National Id',
        confirmButtonColor: '#089B41',
      });
    }
  }

  closeModal() {
    this.isModalVisible = false;
    this.IsNationalIsEmpty = '';
  }

  openModal() {
    this.isModalVisible = true;
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.emplyeeStudent) {
      if (this.emplyeeStudent.hasOwnProperty(key)) {
        const field = key as keyof EmplyeeStudent;
        if (!this.emplyeeStudent[field]) {
          if (field == 'employeeID' || field == 'studentID') {
            this.validationErrors[field] = this.getRequiredErrorMessage(
              this.capitalizeField(field)
            );
            isValid = false;
          }
        }
      }
    }
    return isValid;
  }

  capitalizeField(field: keyof EmplyeeStudent): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }
  onInputValueChange(event: { field: keyof EmplyeeStudent; value: any }) {
    const { field, value } = event;
    (this.emplyeeStudent as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  SelectChild(nationalId: string) {
    this.IsNationalIsEmpty = '';
    this.validationErrors = {};

    this.Student = new Student();
    this.emplyeeStudent = new EmplyeeStudent();
    this.StudentServ.GetByNationalID(nationalId, this.DomainName).subscribe(
      (d) => {
        this.Student = d;
        this.emplyeeStudent.studentID = d.id;
        this.emplyeeStudent.employeeID = this.UserID;
      }
    );
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: EmplyeeStudent[] = await firstValueFrom(
        this.EmplyeeStudentServ.Get(this.UserID, this.DomainName)
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
            return fieldValue.toString().includes(numericValue.toString());
          }
          return fieldValue == this.value;
        });
      }
    } catch (error) {
      this.TableData = [];
    }
  }

  validateNumberOnly(event: any): void {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '');
    event.target.value = value;

    if (isNaN(Number(value)) || value === '') {
      event.target.value = '';
    } else {
      this.NationalID = value;
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
