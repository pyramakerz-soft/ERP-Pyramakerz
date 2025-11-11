import { Component } from '@angular/core';
import { Building } from '../../../../Models/LMS/building';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { BuildingService } from '../../../../Services/Employee/LMS/building.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../../Component/search/search.component';
import { School } from '../../../../Models/school';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-building',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent , TranslateModule],
  templateUrl: './building.component.html',
  styleUrl: './building.component.css',
})
export class BuildingComponent {
  keysArray: string[] = ['id', 'name', 'schoolName'];
  key: string = 'id';
  value: any = '';

  buildingData: Building[] = [];
  building: Building = new Building();
  editBuilding: boolean = false;
  validationErrors: { [key in keyof Building]?: string } = {};
  isRtl: boolean = false;
  subscription!: Subscription;
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = '';

  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  isLoading = false;

  Schools: School[] = [];
  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;
  isDeleting: boolean = false;

  constructor(
    public account: AccountService,
    public buildingService: BuildingService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public schoolService: SchoolService,
    private translate: TranslateService,
    public router: Router,
    private languageService: LanguageService, 
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    this.getBuildingData(this.DomainName, this.CurrentPage, this.PageSize);

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });

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

  // getBuildingData() {
  //   this.buildingData = [];
  //   this.buildingService.Get(this.DomainName).subscribe((data) => {
  //     this.buildingData = data;
  //   });
  // }

  getBuildingData(DomainName: string, pageNumber: number, pageSize: number) {
    this.buildingData = [];
    this.buildingService.GetWithPaggination(DomainName, pageNumber, pageSize).subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage;
        this.PageSize = data.pagination.pageSize;
        this.TotalPages = data.pagination.totalPages;
        this.TotalRecords = data.pagination.totalRecords;
        this.buildingData = data.data;
      },
      (error) => {
        if (error.status == 404) {
          if (this.TotalRecords != 0) {
            let lastPage;
            if (this.isDeleting) {
              lastPage = (this.TotalRecords - 1) / this.PageSize;
            } else {
              lastPage = this.TotalRecords / this.PageSize;
            }
            if (lastPage >= 1) {
              if (this.isDeleting) {
                this.CurrentPage = Math.floor(lastPage);
                this.isDeleting = false;
              } else {
                this.CurrentPage = Math.ceil(lastPage);
              }
              this.getBuildingData(this.DomainName, this.CurrentPage, this.PageSize);
            }
          }
        } 
      }
    );
  }

  getSchoolData() { 
    this.schoolService.Get(this.DomainName).subscribe((data) => {  
      this.Schools = data;
    });
  }

  GetBuildingById(buildingId: number) {
    this.buildingService
      .GetByID(buildingId, this.DomainName)
      .subscribe((data) => {
        this.building = data;
      });
  }

  openModal(buildingId?: number) {
    if (buildingId) {
      this.editBuilding = true;
      this.GetBuildingById(buildingId);
    }

    this.getSchoolData();

    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');

    this.building = new Building();
    this.Schools = [];

    if (this.editBuilding) {
      this.editBuilding = false;
    }
    this.validationErrors = {};
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.PageSize = this.TotalRecords
    this.CurrentPage = 1
    this.TotalPages = 1
    this.key = event.key;
    this.value = event.value;
    try {
      const data: any = await firstValueFrom(
        this.buildingService.GetWithPaggination(this.DomainName, this.CurrentPage, this.PageSize)
      );
      this.buildingData = data.data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.buildingData = this.buildingData.filter((t) => {
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
      this.buildingData = [];
    }
  }

  capitalizeField(field: keyof Building): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.building) {
      if (this.building.hasOwnProperty(key)) {
        const field = key as keyof Building;
        if (!this.building[field]) {
          if (field == 'name' || field == 'schoolID') {
            this.validationErrors[field] = `*${this.getRequiredErrorMessage(
              field as string
            )}`;
            isValid = false;
          }
        } else {
          if (field == 'name') {
            if (this.building.name.length > 100) {
              const fieldTranslated = this.translate.instant(field as string);
              const lengthMsg = this.translate.instant(
                'cannot be longer than 100 characters'
              );
              this.validationErrors[field] = `*${fieldTranslated} ${lengthMsg}`;
              isValid = false;
            }
          } else {
            this.validationErrors[field] = '';
          }
        }
      }
    }
    return isValid;
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

  onInputValueChange(event: { field: keyof Building; value: any }) {
    const { field, value } = event;

    (this.building as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
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

  SaveBuilding() {
    if (this.isFormValid()) {
      this.isLoading = true;
      if (this.editBuilding == false) {
        this.buildingService.Add(this.building, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.isLoading = false;
            this.getBuildingData(this.DomainName, this.CurrentPage, this.PageSize);
          },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        );
      } else {
        this.buildingService.Edit(this.building, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.isLoading = false;
            this.getBuildingData(this.DomainName, this.CurrentPage, this.PageSize);
          },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        );
      }
    }
  }

  deleteBuilding(id: number) {
   Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('the') +this.translate.instant('Building') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.buildingService
          .Delete(id, this.DomainName)
          .subscribe((data: any) => {
            this.buildingData = [];
            this.getBuildingData(this.DomainName, this.CurrentPage, this.PageSize);
          });
      }
    });
  }

  moveToFloors(Id: number) {
    this.router.navigateByUrl('Employee/Floor/' + this.DomainName + '/' + Id);
  }

  changeCurrentPage(currentPage: number) {
    this.CurrentPage = currentPage;
    this.getBuildingData(this.DomainName, this.CurrentPage, this.PageSize);
  }

  validatePageSize(event: any) {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
    }
  }

  get visiblePages(): number[] {
    const total = this.TotalPages;
    const current = this.CurrentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = current - half;
    let end = current + half;

    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  validateNumberPage(event: any): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      this.PageSize = 0;
    }
  }    
}
