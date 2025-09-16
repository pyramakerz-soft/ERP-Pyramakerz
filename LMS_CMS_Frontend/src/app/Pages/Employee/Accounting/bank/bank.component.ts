import { Component } from '@angular/core';
import { Bank } from '../../../../Models/Accounting/bank';
import { BankService } from '../../../../Services/Employee/Accounting/bank.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { AccountingTreeChart } from '../../../../Models/Accounting/accounting-tree-chart';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { AccountingTreeChartService } from '../../../../Services/Employee/Accounting/accounting-tree-chart.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { Employee } from '../../../../Models/Employee/employee';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { BankEmployeeService } from '../../../../Services/Employee/Accounting/bank-employee.service';
import { BankEmployee } from '../../../../Models/Accounting/bank-employee';
@Component({
  selector: 'app-bank',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './bank.component.html',
  styleUrl: './bank.component.css'
})
export class BankComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: Bank[] = [];
  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'name', "iban", "bankName", "bankAccountNumber", "accountNumberName"];

  bank: Bank = new Bank();

  validationErrors: { [key in keyof Bank]?: string } = {};
  AccountNumbers: AccountingTreeChart[] = [];
  isLoading = false

  bankId = 0
  Employees: Employee[] = [];
  BankEmployees: BankEmployee[] = [];

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public BusTypeServ: BusTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public BankServ: BankService,
    public accountServ: AccountingTreeChartService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService,
    private employeeService: EmployeeService,
    private bankEmployeeService: BankEmployeeService
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
    this.GetAllAccount();


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
    this.TableData = []
    this.BankServ.Get(this.DomainName).subscribe((d) => {
      this.TableData = d;
    })
  }

  GetAllAccount() {
    this.accountServ.GetBySubAndFileLinkID(6, this.DomainName).subscribe((d) => {
      this.AccountNumbers = d;
    })
  }

  Create() {
    this.mode = 'Create';
    this.bank = new Bank()
    this.openModal();
    this.validationErrors = {}
  }

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this Bank?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.BankServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData()
        })
      }
    });
  }

  Edit(row: Bank) {
    this.mode = 'Edit';
    this.BankServ.GetById(row.id, this.DomainName).subscribe((d) => {
      this.bank = d
    })
    this.validationErrors = {}
    this.openModal();
  }

  validateNumber(event: any, field: keyof Bank): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.bank[field] === 'string') {
        this.bank[field] = '' as never;
      }
    }
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
      this.isLoading = true

      if (this.mode == 'Create') {
        this.BankServ.Add(this.bank, this.DomainName).subscribe((d) => {
          this.GetAllData()
          this.isLoading = false
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
          });
      }
      if (this.mode == 'Edit') {
        this.BankServ.Edit(this.bank, this.DomainName).subscribe((d) => {
          this.GetAllData()
          this.isLoading = false
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
          });
      }
      this.closeModal()
    }
  }

  closeModal() {
    this.validationErrors = {}
    this.isModalVisible = false;
  }

  openModal() {
    this.isModalVisible = true;
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.bank) {
      if (this.bank.hasOwnProperty(key)) {
        const field = key as keyof Bank;
        if (!this.bank[field]) {
          if (
            field == 'name' ||
            field == 'bankAccountName' ||
            field == 'bankName' ||
            field == 'iban' ||
            field == 'accountOpeningDate' ||
            field == 'accountClosingDate' ||
            field == 'bankAccountNumber' ||
            field == 'accountNumberID'
          ) {
            this.validationErrors[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        }
      }
    }
    const openingDate = new Date(this.bank.accountOpeningDate);
    const closingDate = new Date(this.bank.accountClosingDate);

    if (closingDate < openingDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Dates',
        text: 'Account Closing Date must be after Account Opening Date!',
        confirmButtonText: 'OK',
      });
      isValid = false;
    }

    if (this.bank.name.length > 100) {
      isValid = false;
      this.validationErrors['name'] = 'Name cannot be longer than 100 characters.'
    }

    return isValid;
  }
  capitalizeField(field: keyof Bank): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }
  onInputValueChange(event: { field: keyof Bank; value: any }) {
    const { field, value } = event;
    (this.bank as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: Bank[] = await firstValueFrom(
        this.BankServ.Get(this.DomainName)
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

  getEmployees(){
    this.Employees = [] 
    this.employeeService.Get_Employees(this.DomainName).subscribe(
      data => {
        this.Employees = data
      }
    )
  }

  getBankEmployees(){
    this.BankEmployees = [] 
    this.bankEmployeeService.Get(this.bankId, this.DomainName).subscribe(
      data => {
        this.BankEmployees = data
      }
    )
  }

  AddEmployee(bankId: number) { 
    document.getElementById('Add_Employee')?.classList.remove('hidden');
    document.getElementById('Add_Employee')?.classList.add('flex');

    this.bankId = bankId
    this.getEmployees()
  }

  closeAddModal() {
    document.getElementById('Add_Employee')?.classList.remove('flex');
    document.getElementById('Add_Employee')?.classList.add('hidden'); 
    this.bankId = 0
    this.Employees = [] 
  }

  Save(){

  }
}
