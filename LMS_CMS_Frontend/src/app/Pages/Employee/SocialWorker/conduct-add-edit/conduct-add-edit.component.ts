import { Component } from '@angular/core';
import { Conduct } from '../../../../Models/SocialWorker/conduct';
import { ConductService } from '../../../../Services/Employee/SocialWorker/conduct.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusCompanyService } from '../../../../Services/Employee/Bus/bus-company.service';
import { EmployeeTypeService } from '../../../../Services/Employee/employee-type.service';
import { RoleService } from '../../../../Services/Employee/role.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { Student } from '../../../../Models/student';
import { School } from '../../../../Models/school';
import { Grade } from '../../../../Models/LMS/grade';
import { ConductType } from '../../../../Models/SocialWorker/conduct-type';
import { ProcedureType } from '../../../../Models/SocialWorker/procedure-type';

@Component({
  selector: 'app-conduct-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './conduct-add-edit.component.html',
  styleUrl: './conduct-add-edit.component.css'
})
export class ConductAddEditComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  DomainName: string = '';
  UserID: number = 0;
  path: string = '';
  ConductID: number = 0;
  Data: Conduct = new Conduct();
  mode: string = '';
  validationErrors: { [key in keyof Conduct]?: string } = {};
  isLoading = false;
  schools: School[] = [];
  grades: Grade[] = [];
  students: Student[] = [];
  conductTypes: ConductType[] = [];
  proceduresType: ProcedureType[] = [];

  constructor(
    public RoleServ: RoleService,
    public empTypeServ: EmployeeTypeService,
    public BusCompanyServ: BusCompanyService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    private menuService: MenuService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    private ConductServ: ConductService,
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    if (this.User_Data_After_Login.type === 'employee') {
      this.DomainName = this.ApiServ.GetHeader();
      this.activeRoute.url.subscribe((url: { path: string; }[]) => {
        this.path = url[0].path;

        if (this.path == 'Employee Create') {
          this.mode = 'Create';
        } else if (this.path == 'Employee Edit') {
          this.mode = 'Edit';
          this.ConductID = Number(this.activeRoute.snapshot.paramMap.get('id'));
          this.ConductServ.GetByID(this.ConductID, this.DomainName).subscribe(async (data) => {
            this.Data = data;
          });
        }
      });
    }
  }

  moveToConduct() {

  }

  Save() {

  }

  capitalizeField(field: keyof Conduct): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof Conduct; value: any }) {
    const { field, value } = event;
    (this.Data as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

}
