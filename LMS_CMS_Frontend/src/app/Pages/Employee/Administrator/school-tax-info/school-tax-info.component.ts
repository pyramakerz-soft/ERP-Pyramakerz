import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { School } from '../../../../Models/school';
import { TokenData } from '../../../../Models/token-data';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-school-tax-info',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './school-tax-info.component.html',
  styleUrl: './school-tax-info.component.css',
})
export class SchoolTaxInfoComponent {
  schoolData: School[] = [];
  school: School = new School();
  validationErrors: { [key in keyof School]?: string } = {};
  selectedTaxType: string = 'ETA';
  isLoading = false;

  AllowEdit: boolean = false;
  AllowEditForOthers: boolean = false;
  path: string = 'school-tax-info';

  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public schoolService: SchoolService,
    public router: Router
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();

    this.getSchoolData();

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });
  }

  getSchoolData() {
    this.schoolService.Get(this.DomainName).subscribe((data) => {
      this.schoolData = data;
    });
  }

  getTaxTypeDisplay(school: School): string {
    if (school.streetName || school.buildingNumber || school.city || school.crn || school.postalZone) {
      return 'ZATCA';
    } else if (school.vatNumber) {
      return 'ETA';
    }
    return 'Not Set';
  }

  GetSchoolById(schoolId: number) {
    this.schoolService.GetBySchoolId(schoolId, this.DomainName).subscribe((data) => {
      this.school = data;
      this.selectedTaxType = this.getTaxTypeDisplay(data);
    });
  }

  openModal(schoolId: number) {
    this.GetSchoolById(schoolId);
    document.getElementById('Tax_Modal')?.classList.remove('hidden');
    document.getElementById('Tax_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Tax_Modal')?.classList.remove('flex');
    document.getElementById('Tax_Modal')?.classList.add('hidden');
    this.school = new School();
    this.validationErrors = {};
  }

  onTaxTypeChange() {
    if (this.selectedTaxType === 'ETA') {
      // Clear ZATCA fields when switching to ETA
      this.school.streetName = '';
      this.school.buildingNumber = '';
      this.school.citySubdivision = '';
      this.school.city = '';
      this.school.crn = '';
      this.school.postalZone = '';
    } else {
      // Clear ETA fields when switching to ZATCA
      this.school.vatNumber = '';
    }
  }

  onInputValueChange(event: { field: keyof School; value: any }) {
    const { field, value } = event;
    (this.school as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  IsAllowEdit(InsertedByID: number) {
    return this.EditDeleteServ.IsAllowEdit(
      InsertedByID,
      this.UserID,
      this.AllowEditForOthers
    );
  }

  SaveSchool() {
    this.isLoading = true;
    this.schoolService.Edit(this.school, this.DomainName).subscribe(
      (result: any) => {
        this.closeModal();
        this.isLoading = false;
        this.getSchoolData();
      },
      (error) => {
        this.isLoading = false;
        // Handle error
      }
    );
  }
}