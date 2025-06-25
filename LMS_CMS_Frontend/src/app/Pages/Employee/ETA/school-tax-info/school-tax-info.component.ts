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
import Swal from 'sweetalert2';
import { TaxIssuerService } from '../../../../Services/Employee/Administration/tax-issuer.service';
import { TaxIssuer } from '../../../../Models/Administrator/tax-issuer.model';

@Component({
  selector: 'app-school-tax-info',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './school-tax-info.component.html',
  styleUrl: './school-tax-info.component.css',
})
export class TaxIssuerComponent {
  // schoolData: School[] = [];
  taxIssuers: TaxIssuer[] = []; // Changed from schoolData to taxIssuers

  school: School = new School();
  taxIssuer: any = {};
  validationErrors: any = {};
  selectedTaxType: string = 'ETA';
  isLoading = false;

  AllowEdit: boolean = false;
  AllowEditForOthers: boolean = false;
  path: string = 'school-tax-info';

  DomainName: string = '';
  UserID: number = 0;
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

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public schoolService: SchoolService,
    public taxIssuerService: TaxIssuerService,
    public router: Router
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();

    // this.getSchoolData();
    this.getTaxIssuers();
    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });
  }

  // getSchoolData() {
  //   this.schoolService.Get(this.DomainName).subscribe((data) => {
  //     this.schoolData = data;
  //   });
  // }

  getTaxIssuers() {
    this.taxIssuerService.getAll(this.DomainName).subscribe({
      next: (data) => {
        console.log(data);
        this.taxIssuers = data;
      },
      error: (error) => {
        console.error('Error loading tax issuers:', error);
      },
    });
  }

  getTaxTypeDisplay(school: School): string {
    if (
      school.streetName ||
      school.buildingNumber ||
      school.city ||
      school.crn ||
      school.postalZone
    ) {
      return 'ZATCA';
    } else if (school.vatNumber) {
      //recheck
      return 'ETA';
    }
    return 'Not Set';
  }

  GetSchoolById(schoolId: number) {
    this.schoolService
      .GetBySchoolId(schoolId, this.DomainName)
      .subscribe((data) => {
        this.school = data;
        this.selectedTaxType = this.getTaxTypeDisplay(data);

        // Load tax issuer data if ETA is selected
        if (this.selectedTaxType === 'ETA' && data.vatNumber) {
          this.getTaxIssuerById(data.vatNumber);
        }
      });
  }

  getTaxIssuerById(id: string) {
    this.taxIssuerService.getById(id, this.DomainName).subscribe(
      (data) => {
        this.taxIssuer = data;
      },
      (error) => {
        // If tax issuer not found, initialize empty object
        this.taxIssuer = {
          id: id,
          type: '',
          name: '',
          activityCode: '',
          branchID: '',
          country: '',
          governate: '',
          regionCity: '',
          street: '',
          buildingNumber: '',
          postalCode: '',
          floor: '',
          room: '',
          landMark: '',
          additionalInfo: '',
        };
      }
    );
  }

  openModal(taxIssuerId: string) {
    this.getTaxIssuerById(taxIssuerId);
    document.getElementById('EditTaxIssuerModal')?.classList.remove('hidden');
    document.getElementById('EditTaxIssuerModal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('EditTaxIssuerModal')?.classList.remove('flex');
    document.getElementById('EditTaxIssuerModal')?.classList.add('hidden');
    this.taxIssuer = {};
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
      this.taxIssuer = {};
    }
  }

  onInputValueChange(
    event: { field: string; value: any },
    model: 'school' | 'taxIssuer' = 'school'
  ) {
    const { field, value } = event;
    if (model === 'school') {
      (this.school as any)[field] = value;
    } else {
      this.taxIssuer[field] = value;
    }
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

    if (this.selectedTaxType === 'ETA') {
      this.saveTaxIssuer();
    } else {
      this.saveZatcaInfo();
    }
  }

  saveTaxIssuer() {
    this.isLoading = true;

    this.taxIssuerService.edit(this.taxIssuer, this.DomainName).subscribe(
      (result: any) => {
        this.closeModal();
        this.isLoading = false;
        this.getTaxIssuers();
        Swal.fire({
          icon: 'success',
          title: 'Saved successfully',
          showConfirmButton: false,
          timer: 1500,
        });
      },
      (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error saving tax issuer',
          text: error.message || 'Please try again',
          confirmButtonText: 'Okay',
          customClass: { confirmButton: 'secondaryBg' },
        });
        console.error('Error details:', error);
      }
    );
  }

  saveZatcaInfo() {
    this.schoolService.Edit(this.school, this.DomainName).subscribe(
      (result: any) => {
        this.closeModal();
        this.isLoading = false;
        // this.getSchoolData();
        this.getTaxIssuers();
        Swal.fire({
          icon: 'success',
          title: 'Saved successfully',
          showConfirmButton: false,
          timer: 1500,
        });
      },
      (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error saving school',
          text: error.message || 'Please try again',
          confirmButtonText: 'Okay',
          customClass: { confirmButton: 'secondaryBg' },
        });
      }
    );
  }

  deleteSchool(schoolId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.schoolService.Delete(schoolId, this.DomainName).subscribe(
          () => {
            this.isLoading = false;
            Swal.fire('Deleted!', 'The school has been deleted.', 'success');
            this.getTaxIssuers();
          },
          (error) => {
            this.isLoading = false;
            Swal.fire(
              'Error!',
              'There was an error deleting the school.',
              'error'
            );
          }
        );
      }
    });
  }
}