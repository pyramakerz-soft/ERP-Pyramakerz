import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PermissionGroupEmployee } from '../../../../Models/Archiving/permission-group-employee';
import { PermissionGroupEmployeeService } from '../../../../Services/Employee/Archiving/permission-group-employee.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PermissionGroup } from '../../../../Models/Archiving/permission-group';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { PermissionGroupService } from '../../../../Services/Employee/Archiving/permission-group.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { firstValueFrom } from 'rxjs';
// import Swal from 'sweetalert2';
import { Employee } from '../../../../Models/Employee/employee';
import { EmployeeService } from '../../../../Services/Employee/employee.service'; 
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-permission-group-employee',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './permission-group-employee.component.html',
  styleUrl: './permission-group-employee.component.css'
})

@InitLoader()
export class PermissionGroupEmployeeComponent {
  TableData:PermissionGroupEmployee[] = []
  employees:Employee[] = []

  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');
 
  AllowDelete: boolean = false; 
  AllowDeleteForOthers: boolean = false;
 
  permissionGroupEmployee:PermissionGroupEmployee = new PermissionGroupEmployee()
  DomainName: string = '';
  UserID: number = 0;
 
  path: string = ''; 
   
  isLoading = false;

  permissionGroupID = 0

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService, 
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public employeeService:EmployeeService, 
    public permissionGroupEmployeeService:PermissionGroupEmployeeService,
    private loadingService: LoadingService 
  ) {}

  ngOnInit() {
    this.permissionGroupID = Number(this.activeRoute.snapshot.paramMap.get('id'));

    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) { 
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others; 
      }
    });

    this.GetAllData() 
  }
 
  GetAllData(){
    this.TableData = []
    this.permissionGroupEmployeeService.ByPermissionGroupID(this.permissionGroupID, this.DomainName).subscribe(
      (data) => { 
        this.TableData = data
      }
    )
  }

  GetEmployees() {
    this.employees = [];
    this.employeeService.Get_Employees(this.DomainName).subscribe(
      (data) => {
        // remove employees who already exist in TableData
        const existingEmployeeIds = this.TableData.map(e => e.employeeID);
        this.employees = data.filter(emp => !existingEmployeeIds.includes(emp.id));
      },
      (error) => {
        console.error('Error loading employees:', error);
      }
    );
  } 
 
  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(
      InsertedByID,
      this.UserID,
      this.AllowDeleteForOthers
    );
    return IsAllow;
  }  

  MoveToPermissionGroup(){
    this.router.navigateByUrl(`Employee/Permissions Groups`)
  }

  openModal() { 
    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');

    this.GetEmployees()
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden'); 
    this.permissionGroupEmployee = new PermissionGroupEmployee();  
  }

  async Save() {   
    if(this.permissionGroupEmployee.employeeID){
      this.isLoading = true;    
      this.permissionGroupEmployee.permissionGroupID = this.permissionGroupID
      this.permissionGroupEmployeeService.Add(this.permissionGroupEmployee, this.DomainName).subscribe(
        (result: any) => {
          this.closeModal();
          this.GetAllData()
          this.isLoading = false;
        },
        async (error) => {
          this.isLoading = false;

          const Swal = await import('sweetalert2').then(m => m.default);

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.error,
            confirmButtonText: 'Okay',
            customClass: { confirmButton: 'secondaryBg' },
          });
        }
      ); 
    } else{
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Select Employee to add',
        confirmButtonText: 'Okay',
        customClass: { confirmButton: 'secondaryBg' },
      });
    }
  }

  async Delete(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);
    
    Swal.fire({
      title: 'Are you sure you want to delete this Employee?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.permissionGroupEmployeeService.Delete(id,this.DomainName).subscribe((D)=>{
          this.GetAllData()
        })
      }
    });
  }
}
