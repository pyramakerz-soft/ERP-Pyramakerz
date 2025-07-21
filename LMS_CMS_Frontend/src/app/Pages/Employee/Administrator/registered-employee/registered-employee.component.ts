import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegisteredEmployee } from '../../../../Models/Administrator/registered-employee';
import { TokenData } from '../../../../Models/token-data';
import { RegisteredEmployeeService } from '../../../../Services/Employee/Administration/registered-employee.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { SearchComponent } from '../../../../Component/search/search.component';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registered-employee',
  standalone: true,
  imports: [CommonModule, SearchComponent],
  templateUrl: './registered-employee.component.html',
  styleUrl: './registered-employee.component.css'
})
export class RegisteredEmployeeComponent {  
  DomainName: string = '';
  TableData:RegisteredEmployee[] = []
  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'user_Name', 'en_name', 'ar_name', 'email', 'mobile', 'phone', 'address'];

  constructor(
    private router: Router, 
    public activeRoute: ActivatedRoute, 
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService, 
    public registeredEmployeeService: RegisteredEmployeeService
  ) {}

  ngOnInit() { 
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    }); 

    this.GetAllData();  
  }

  GetAllData(){
    this.TableData = [];
    this.registeredEmployeeService.Get(this.DomainName).subscribe((d) => {
      this.TableData = d;
    });
  } 

  Delete(id: number){
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
        this.registeredEmployeeService.Reject(id, this.DomainName).subscribe((d) => {
          this.GetAllData()
        });
      }
    }); 
  }

  View(id: number){
    this.router.navigateByUrl(`Employee/Registered Employee/${id}`);
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: RegisteredEmployee[] = await firstValueFrom(
        this.registeredEmployeeService.Get(this.DomainName)
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
}
