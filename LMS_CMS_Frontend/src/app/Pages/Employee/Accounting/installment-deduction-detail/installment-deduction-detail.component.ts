import { Component } from '@angular/core';
import { InstallmentDeductionDetail } from '../../../../Models/Accounting/installment-deduction-detail';
import { TokenData } from '../../../../Models/token-data';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { InstallmentDeductionMaster } from '../../../../Models/Accounting/installment-deduction-master';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Employee } from '../../../../Models/Employee/employee';
import { Student } from '../../../../Models/student';
import { StudentService } from '../../../../Services/student.service';
import { InstallmentDeductionDetailService } from '../../../../Services/Employee/Accounting/installment-deduction-detail.service';
import { InstallmentDeductionMasterService } from '../../../../Services/Employee/Accounting/installment-deduction-master.service';
import { TuitionFeesType } from '../../../../Models/Accounting/tuition-fees-type';
import { TuitionFeesTypeService } from '../../../../Services/Employee/Accounting/tuition-fees-type.service';
import Swal from 'sweetalert2';
import { EmployeeStudentService } from '../../../../Services/Employee/Accounting/employee-student.service';
import { EmplyeeStudent } from '../../../../Models/Accounting/emplyee-student';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';


@Component({
  selector: 'app-installment-deduction-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './installment-deduction-detail.component.html',
  styleUrl: './installment-deduction-detail.component.css'
})

@InitLoader()
export class InstallmentDeductionDetailComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  Data: InstallmentDeductionMaster = new InstallmentDeductionMaster();
  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'name', 'accountNumberName'];
  mode: string = "Create"

  employees: Employee[] = []
  emplyeeStudents: EmplyeeStudent[] = []
  FeesType: TuitionFeesType[] = []

  // TableData: InstallmentDeductionDetail[] = []
  Detail: InstallmentDeductionDetail = new InstallmentDeductionDetail()
  MasterId: number = 0;
  editingRowId: any = 0;

  IsOpenToAdd: boolean = false
  isLoading = false
  validationErrors: { [key in keyof InstallmentDeductionMaster]?: string } = {};
  // validationErrorsInstallmentDeductionDetails: { [key in keyof InstallmentDeductionDetail]?: string } = {};
  validationErrorsForDetails: Record<number, Partial<Record<keyof InstallmentDeductionDetail, string>>> = {};

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private translate: TranslateService,
    public BusTypeServ: BusTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public EmployeeServ: EmployeeService,
    public EmployeeStudentServ: EmployeeStudentService,
    public installmentDeductionDetailServ: InstallmentDeductionDetailService,
    public installmentDeductionMasterServ: InstallmentDeductionMasterService,
    public TuitionFeesTypeServ: TuitionFeesTypeService,
    private languageService: LanguageService,
    private loadingService: LoadingService 
  ) { }
  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    this.MasterId = Number(this.activeRoute.snapshot.paramMap.get('id'))

    if (!this.MasterId) {
      this.mode = "Create"
    } else {
      this.GetMasterInfo();
    }

    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
      if (url[1].path == "View") {
        this.mode = "View"
      } else if (url[1].path == "Edit") {
        this.mode = "Edit"
      }
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

    if (this.mode == "Create") {

    }
    this.GetAllEmployees()
    this.GetAllTuitionFeesType()


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


  moveToMaster() {
    this.router.navigateByUrl(`Employee/Installment Deduction`)
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.Data) {
      if (this.Data.hasOwnProperty(key)) {
        const field = key as keyof InstallmentDeductionMaster;
        if (!this.Data[field]) {
          if (
            field == 'docNumber' ||
            field == 'employeeID' ||
            field == 'studentID' ||
            field == 'date'
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

  // isFormValidInstallmentDeductionDetails(row?: InstallmentDeductionDetail): boolean {
  //   let isValid = true;
  //   if (row) {
  //     this.Detail = row
  //   }
  //   for (const key in this.Detail) {
  //     if (this.Detail.hasOwnProperty(key)) {
  //       const field = key as keyof InstallmentDeductionDetail;
  //       if (!this.Detail[field]) {
  //         if (
  //           field == 'feeTypeID' ||
  //           field == 'date'
  //         ) {
  //           this.validationErrorsInstallmentDeductionDetails[field] = `*${this.capitalizeFieldDetails(
  //             field
  //           )} is required`;
  //           isValid = false;
  //         }
  //       }
  //     }
  //   }
  //   return isValid;
  // }

  capitalizeField(field: keyof InstallmentDeductionMaster): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  capitalizeFieldDetails(field: keyof InstallmentDeductionDetail): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof InstallmentDeductionMaster; value: any }) {
    const { field, value } = event;
    (this.Data as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  onInputValueChangeDetails(row :InstallmentDeductionDetail ,event: { field: keyof InstallmentDeductionDetail; value: any }) {
    const { field, value } = event;
    (this.Detail as any)[field] = value;
    if (value) {
    if (this.validationErrorsForDetails[row.id]) {
      this.validationErrorsForDetails[row.id][field] = '';
    }
  }
  }

  validateNumberEditDetails(row:InstallmentDeductionDetail ,event: any, field: keyof InstallmentDeductionDetail): void { // 
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof row[field] === 'string') {
        row[field] = '' as never;
      }
    }
  }

  isDetailsFormValid(): boolean {
    let isValid = true;

    // Reset validation errors
    this.validationErrorsForDetails = {};

    this.Data.installmentDeductionDetails.forEach((detail) => {
      // Ensure detail has an ID
      const id = detail.id;
      if (!id) return; // skip if no ID

      // Prepare error object for this row
      if (!this.validationErrorsForDetails[id]) {
        this.validationErrorsForDetails[id] = {};
      }

      const errors = this.validationErrorsForDetails[id];

      // Validate only these fields
      const requiredFields: (keyof InstallmentDeductionDetail)[] = [
        'date',
        'feeTypeID',
      ];

      requiredFields.forEach((field) => {
        const value = detail[field];
        if (!value || value == 0 || value == '') {
          errors[field] = this.getRequiredErrorMessage(
            this.DetailsCapitalizeField(field)
          );
          console.log(errors)
          isValid = false;
        } else {
          errors[field] = ''; 
        }
      });
    });

    if(this.Data.newDetails && this.Data.newDetails.length > 0){
      this.Data.newDetails.forEach((detail) => {
        // Ensure detail has an ID
        const id = detail.id;
        if (!id) return; // skip if no ID

        // Prepare error object for this row
        if (!this.validationErrorsForDetails[id]) {
          this.validationErrorsForDetails[id] = {};
        }

        const errors = this.validationErrorsForDetails[id];

        // Validate only these fields
        const requiredFields: (keyof InstallmentDeductionDetail)[] = [
          'date',
          'feeTypeID',
        ];

        requiredFields.forEach((field) => {
          const value = detail[field];
          if (!value || value == 0 || value == '') {
            errors[field] = this.getRequiredErrorMessage(
              this.DetailsCapitalizeField(field)
            );
            console.log(errors)
            isValid = false;
          } else {
            errors[field] = ''; 
          }
        });
      });
    }
    return isValid;
  }
  
  DetailsCapitalizeField(field: keyof InstallmentDeductionDetail): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
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

  Save() {
    if (this.mode == "Create") {
        if (this.isFormValid()) {
          this.isLoading = true
        this.installmentDeductionMasterServ.Add(this.Data, this.DomainName).subscribe((d) => {
          this.MasterId = d
          this.isLoading = false
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Done Successfully',
            confirmButtonColor: '#089B41',
          });

          this.router.navigateByUrl(`Employee/Installment Deduction/Edit/${this.MasterId}`)
        },
          error => {
            this.isLoading = false
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          })
        }
      }
      else if (this.mode == "Edit") {
        if(this.isDetailsFormValid()){
          this.installmentDeductionMasterServ.Edit(this.Data, this.DomainName).subscribe((d) => {
            this.GetMasterInfo()
            this.isLoading = false
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Done Successfully',
              confirmButtonColor: '#089B41',
            });
          },
            error => {
              console.log(error)
              this.isLoading = false
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.error,
                confirmButtonText: 'Okay',
                customClass: { confirmButton: 'secondaryBg' },
              });
            })
        }
      }
  }
  onEmployeeChange() {
    this.emplyeeStudents = []
    this.Data.studentID = 0

    if (this.Data.employeeID) {
      this.GetAllStudents();
    }
  }

  GetAllEmployees() {
    this.EmployeeServ.Get_Employees(this.DomainName).subscribe((d) => {
      this.employees = d
    })
  }

  GetAllStudents() {
    this.emplyeeStudents = []
    this.EmployeeStudentServ.Get(this.Data.employeeID, this.DomainName).subscribe((d) => {
      this.emplyeeStudents = d
    })
  }

  GetMasterInfo() {
    this.installmentDeductionMasterServ.GetById(this.MasterId, this.DomainName).subscribe((d) => {
      this.Data = d
      this.GetAllStudents()
    })
  }

  AddDetail() {
    var NewDetail = new InstallmentDeductionDetail()
    NewDetail.id = Date.now() + Math.floor(Math.random() * 10000);
    NewDetail.installmentDeductionMasterID = this.MasterId
    this.Data.newDetails=this.Data.newDetails || []
    this.Data.newDetails.push(NewDetail);
  }

  // Edit(id: number) {
  //   this.Detail = new InstallmentDeductionDetail()
  //   this.validationErrorsInstallmentDeductionDetails = {}
  //   this.editingRowId = id
  // }

  Delete(id: number) {
     Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete')+ " " + this.translate.instant('Installment Deduction Detail')+ this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.installmentDeductionDetailServ.Delete(id, this.DomainName).subscribe((D) => {
        this.Data.installmentDeductionDetails = this.Data.installmentDeductionDetails.filter(s=>s.id != id)
        this.Data.installmentDeductionDetails = this.Data.installmentDeductionDetails || []
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Installment Deduction Details Deleted Successfully',
            confirmButtonColor: '#089B41',
          });
        })
      }
    });
  }

  DeleteNew(id: number) {
     Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete')+ " " + this.translate.instant('Installment Deduction Details')+ this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.Data.newDetails = this.Data.newDetails.filter(s=>s.id != id)
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

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(
      InsertedByID,
      this.UserID,
      this.AllowEditForOthers
    );
    return IsAllow;
  }

  GetAllTuitionFeesType() {
    this.TuitionFeesTypeServ.Get(this.DomainName).subscribe((d) => {
      this.FeesType = d
    })
  }

  CancelAdd() {
    this.IsOpenToAdd = false
  }

  validateNumber(event: any, field: keyof InstallmentDeductionMaster): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.Data[field] === 'string') {
        this.Data[field] = '' as never;
      }
    }
  }
}
