import { Component } from '@angular/core';
import { RegisteredEmployee } from '../../../../Models/Administrator/registered-employee';
import { RegisteredEmployeeService } from '../../../../Services/Employee/Administration/registered-employee.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { CommonModule } from '@angular/common';
import { EmployeeTypeService } from '../../../../Services/Employee/employee-type.service';
import { RoleService } from '../../../../Services/Employee/role.service';
import { EmployeeTypeGet } from '../../../../Models/Administrator/employee-type-get';
import { Role } from '../../../../Models/Administrator/role';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-registered-employee-view',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './registered-employee-view.component.html',
  styleUrl: './registered-employee-view.component.css'
})
export class RegisteredEmployeeViewComponent {
  employee:RegisteredEmployee = new RegisteredEmployee()
  DomainName: string = '';
  path: string = '';  
  registereEmployeeID: number = 0;  
  isRtl: boolean = false;
  subscription!: Subscription;
  employeeTypes:EmployeeTypeGet[] = []
  roles:Role[] = []
  employeeToEdit: RegisteredEmployee = new RegisteredEmployee();
  isLoading = false; 
  validationErrors: { [key in keyof RegisteredEmployee]?: string } = {};
  
  constructor(
    private router: Router, 
    public activeRoute: ActivatedRoute, 
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService, 
    public registeredEmployeeService: RegisteredEmployeeService,
    public employeeTypeService: EmployeeTypeService,
    public roleService: RoleService,
    private languageService: LanguageService, 
  ) {}

  ngOnInit() { 
    this.registereEmployeeID = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    }); 

    this.GetRegisteredEmployee();  
    this.GetEmployeeTypes();  
    this.GetRoles(); 
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

  GetRegisteredEmployee(){
    this.employee = new RegisteredEmployee()
    this.registeredEmployeeService.GetById(this.registereEmployeeID, this.DomainName).subscribe((d) => {
      this.employee = d;
      this.employee.roleID = 0
      this.employee.employeeTypeID = 0
    });
  } 

  moveToRegisteredEmployee(){
    this.router.navigateByUrl(`Employee/Registered Employee`);
  }

  reject() {
    Swal.fire({
      title: 'Are you sure you want to Reject And Delete This Employee?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.registeredEmployeeService.Reject(this.employee.id, this.DomainName).subscribe((d) => {
          Swal.fire({
            title: 'Employee Rejected!',
            text: 'The employee has been successfully rejected.',
            icon: 'success',
            confirmButtonColor: 'secondaryBg',
          }).then(() => { 
            this.moveToRegisteredEmployee();
          });
        });
      }
    }); 
  }

  accept() { 
    if(this.employee.roleID == 0){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: "You have to choose Role",
        confirmButtonText: 'Okay',
        customClass: {
          confirmButton: 'secondaryBg'
        }
      });
    } else if(this.employee.employeeTypeID == 0){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: "You have to choose Employee Type",
        confirmButtonText: 'Okay',
        customClass: {
          confirmButton: 'secondaryBg'
        }
      });

    } else{
      Swal.fire({
        title: 'Are you sure you want to Accept This Employee?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#089B41',
        cancelButtonColor: '#17253E',
        confirmButtonText: "Yes, I'm sure",
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.registeredEmployeeService.Accept(this.employee, this.DomainName).subscribe(
            (d) => {
              Swal.fire({
                title: 'Employee Accepted!',
                text: 'The employee has been successfully accepted.',
                icon: 'success',
                confirmButtonText: 'Okay',
                customClass: {
                  confirmButton: 'secondaryBg'
                }
              }).then(() => { 
                this.moveToRegisteredEmployee();
              });
            },
            (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.error || 'An unexpected error occurred',
                confirmButtonColor: '#089B41',
                confirmButtonText: 'Okay',
              });
            }
          );
        }
      });  
    }
  }

  GetEmployeeTypes() {
    this.employeeTypes = []
    this.employeeTypeService.Get(this.DomainName).subscribe(
      data => {
        this.employeeTypes = data
      }
    )
  }

  GetRoles() {
    this.roles = []
    this.roleService.Get_Roles(this.DomainName).subscribe(
      data => {
        this.roles = data
      }
    )
  }

  openEditModal(){
    this.employeeToEdit= new RegisteredEmployee();
    this.employeeToEdit.user_Name = this.employee.user_Name;
    this.employeeToEdit.email = this.employee.email;
    this.employeeToEdit.id = this.employee.id;
    
    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');
    this.validationErrors = {};  
    
    this.employeeToEdit= new RegisteredEmployee();
    this.isLoading = false 
  }

  capitalizeField(field: keyof RegisteredEmployee): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.employeeToEdit) {
      if (this.employeeToEdit.hasOwnProperty(key)) {
        const field = key as keyof RegisteredEmployee;
        if (!this.employeeToEdit[field]) {
          if(field == "email" || field == "user_Name") {
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`
            isValid = false;
          } 
        } else { 
          this.validationErrors[field] = '';
        }
      }
    } 

    return isValid;
  }

  onInputValueChange(event: { field: keyof RegisteredEmployee, value: any }) {
    const { field, value } = event;
    (this.employeeToEdit as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  Save(){ 
    if(this.isFormValid()){ 
      this.isLoading = true; 
      this.registeredEmployeeService.Edit(this.employeeToEdit, this.DomainName).subscribe(
        (result: any) => {
          this.closeModal()
          this.GetRegisteredEmployee()
        },
        error => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error || 'An unexpected error occurred',
            confirmButtonColor: '#089B41',
          });
        }
      );
    }
  }
}
