import { Component } from '@angular/core';
import { Saves } from '../../../../Models/Accounting/saves';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { Credit } from '../../../../Models/Accounting/credit';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { AccountingTreeChart } from '../../../../Models/Accounting/accounting-tree-chart';
import { SaveService } from '../../../../Services/Employee/Accounting/save.service';
import { firstValueFrom } from 'rxjs';
import { AccountingTreeChartService } from '../../../../Services/Employee/Accounting/accounting-tree-chart.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { SafeEmployee } from '../../../../Models/Accounting/safe-employee';
import { Employee } from '../../../../Models/Employee/employee';
import { SafeEmployeeService } from '../../../../Services/Employee/Accounting/safe-employee.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';

@Component({
  selector: 'app-saves',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './saves.component.html',
  styleUrl: './saves.component.css'
})
export class SavesComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: Saves[] = [];

  DomainName: string = '';
  UserID: number = 0;
 isRtl: boolean = false;
  subscription!: Subscription;
  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'name', 'accountNumberName'];

  save: Saves = new Saves();

  validationErrors: { [key in keyof Saves]?: string } = {};

  AccountNumbers: AccountingTreeChart[] = [];
  isLoading = false

  safeId = 0
  Employees: Employee[] = [];
  safeEmployees: SafeEmployee[] = [];
  selectedEmployees: any[] = [];

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
    public SaveServ: SaveService,
    public accountServ: AccountingTreeChartService,
    private languageService: LanguageService, 
    private employeeService: EmployeeService,
    private safeEmployeeService: SafeEmployeeService
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
    this.GetAllAccount()
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



  GetAllData() {
    this.TableData = []
    this.SaveServ.Get(this.DomainName).subscribe((d) => {
      this.TableData = d
    })
  }
  GetAllAccount() {
    this.accountServ.GetBySubAndFileLinkID(5, this.DomainName).subscribe((d) => {
      this.AccountNumbers = d;
    })
  }

  Create() {
    this.mode = 'Create';
    this.save = new Saves();
    this.validationErrors = {}
    this.openModal();
  }

  Delete(id: number) {
    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete')+ " " + this.translate.instant('هذه') + " " +  this.translate.instant('Safe')+ this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.SaveServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData()
        })
      }
    });
  }

  Edit(id: number) {
    this.mode = 'Edit';
    this.SaveServ.GetById(id, this.DomainName).subscribe((d) => {
      this.save = d
    })
    this.validationErrors = {}
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
      this.isLoading = true
      if (this.mode == 'Create') {
        this.SaveServ.Add(this.save, this.DomainName).subscribe((d) => {
          this.closeModal();
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
          })
      }
      if (this.mode == 'Edit') {
        this.SaveServ.Edit(this.save, this.DomainName).subscribe((d) => {
          this.closeModal();
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
          })
      }
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
    for (const key in this.save) {
      if (this.save.hasOwnProperty(key)) {
        const field = key as keyof Saves;
        if (!this.save[field]) {
          if (
            field == 'name' ||
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

    if (this.save.name.length > 100) {
      isValid = false;
      this.validationErrors['name']='Name cannot be longer than 100 characters.'
    }
    return isValid;
  }
  capitalizeField(field: keyof Saves): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }
  onInputValueChange(event: { field: keyof Saves; value: any }) {
    const { field, value } = event;
    (this.save as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: Saves[] = await firstValueFrom(
        this.SaveServ.Get(this.DomainName)
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
    this.safeEmployees = [] 
    this.safeEmployeeService.Get(this.safeId, this.DomainName).subscribe(
      data => {
        this.safeEmployees = data 

        this.selectedEmployees = this.safeEmployees.map(emp => ({
          employeeID: emp.employeeID,
          employeeEnglishName: emp.employeeEnglishName,
          employeeArabicName: emp.employeeArabicName
        }));
      }
    )
  }

  AddEmployee(safeId: number) { 
    document.getElementById('Add_Employee')?.classList.remove('hidden');
    document.getElementById('Add_Employee')?.classList.add('flex');

    this.safeId = safeId
    this.getEmployees()
    this.getBankEmployees()
  }

  closeAddModal() {
    document.getElementById('Add_Employee')?.classList.remove('flex');
    document.getElementById('Add_Employee')?.classList.add('hidden'); 
    this.safeId = 0
    this.Employees = [] 
    this.selectedEmployees = [] 
  }
 
  onEmployeeSelect(event: any) {
    const selectedId = +event.target.value;
    const emp = this.Employees.find(e => e.id === selectedId); 
    
    if (emp && !this.selectedEmployees.some(e => e.employeeID === emp.id)) {
      const newEmp = {
        employeeID: emp.id,
        employeeEnglishName: emp.en_name,
        employeeArabicName: emp.ar_name
      };
      this.selectedEmployees.push(newEmp);
    }
 
    event.target.value = "";
  }

  removeEmployee(emp: any) {
    this.selectedEmployees = this.selectedEmployees.filter(e => e.employeeID !== emp.employeeID);
  }

  Save() {
    this.isLoading = true;
    
    let safeEmp = new SafeEmployee()
    safeEmp.saveID = this.safeId
    safeEmp.employeeIDs = this.selectedEmployees.map(e => e.employeeID)
    
    this.safeEmployeeService.Add(safeEmp, this.DomainName).subscribe(
      data =>{
        this.isLoading = false;
        this.closeAddModal()
      }
    ) 
  }
}
