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

@Component({
  selector: 'app-registered-employee-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registered-employee-view.component.html',
  styleUrl: './registered-employee-view.component.css'
})
export class RegisteredEmployeeViewComponent {
  employee:RegisteredEmployee = new RegisteredEmployee()
  DomainName: string = '';
  path: string = '';  
  registereEmployeeID: number = 0;  
  employeeTypes:EmployeeTypeGet[] = []
  roles:Role[] = []
  
  constructor(
    private router: Router, 
    public activeRoute: ActivatedRoute, 
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService, 
    public registeredEmployeeService: RegisteredEmployeeService,
    public employeeTypeService: EmployeeTypeService,
    public roleService: RoleService
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
      title: 'Are you sure you want to Reject This Employee?',
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
          this.registeredEmployeeService.Accept(this.employee, this.DomainName).subscribe((d) => {
            Swal.fire({
              title: 'Employee Accepted!',
              text: 'The employee has been successfully accepted.',
              icon: 'success',
              confirmButtonColor: 'secondaryBg',
            }).then(() => { 
              this.moveToRegisteredEmployee();
            });
          });
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
}
