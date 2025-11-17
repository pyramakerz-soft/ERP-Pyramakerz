import { Component } from '@angular/core';
import { Floor } from '../../../../Models/LMS/floor';
import { Building } from '../../../../Models/LMS/building';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { BuildingService } from '../../../../Services/Employee/LMS/building.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FloorService } from '../../../../Services/Employee/LMS/floor.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../../Component/search/search.component';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { Employee } from '../../../../Models/Employee/employee';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-floor',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './floor.component.html',
  styleUrl: './floor.component.css',
})
export class FloorComponent {
  keysArray: string[] = ['id', 'name', 'floorMonitorName'];
  key: string = 'id';
  value: any = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  monitorrData: Employee[] = [];
  floorData: Floor[] = [];
  floor: Floor = new Floor();
  building: Building = new Building();
  editFloor: boolean = false;
  validationErrors: { [key in keyof Floor]?: string } = {};

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = '';

  DomainName: string = '';
  UserID: number = 0;
  buildingId: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  isLoading = false;
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
    private translate: TranslateService,
    public floorService: FloorService,
    public employeeService: EmployeeService,
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

    this.buildingId = Number(this.activeRoute.snapshot.paramMap.get('Id'));
    this.DomainName = String(
      this.activeRoute.snapshot.paramMap.get('domainName')
    );

    this.getBuildingData();
    this.getFloorData(this.DomainName, this.CurrentPage, this.PageSize);

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

  getBuildingData() {
    this.buildingService
      .GetByID(this.buildingId, this.DomainName)
      .subscribe((data) => {
        this.building = data;
      });
  }

  // getFloorData() {
  //   this.floorData = [];
  //   this.floorService
  //     .GetByBuildingId(this.buildingId, this.DomainName)
  //     .subscribe((data) => {
  //       this.floorData = data;
  //     });
  // }

  getFloorData(DomainName: string, pageNumber: number, pageSize: number) {
    this.floorData = [];
    this.floorService.GetByBuildingIdWithPaggination(this.buildingId ,DomainName, pageNumber, pageSize).subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage;
        this.PageSize = data.pagination.pageSize;
        this.TotalPages = data.pagination.totalPages;
        this.TotalRecords = data.pagination.totalRecords;
        this.floorData = data.data;
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
              this.getFloorData(this.DomainName, this.CurrentPage, this.PageSize);
            }
          }
        } 
      }
    );
  }


  getMonitorData() {
    this.employeeService.GetWithTypeId(1, this.DomainName).subscribe((data) => {
      this.monitorrData = data;
    });
  }

  GetFloorById(Id: number) {
    this.floorService.GetByID(Id, this.DomainName).subscribe((data) => {
      this.floor = data;
    });
  }

  openModal(floorId?: number) {
    if (floorId) {
      this.editFloor = true;
      this.GetFloorById(floorId);
    }

    this.getMonitorData();

    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');

    this.floor = new Floor();
    this.monitorrData = [];

    if (this.editFloor) {
      this.editFloor = false;
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
      const data: Floor[] = await firstValueFrom(
        this.floorService.GetByBuildingId(this.buildingId, this.DomainName)
      );
      this.floorData = data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.floorData = this.floorData.filter((t) => {
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
      this.floorData = [];
    }
  }

  capitalizeField(field: keyof Floor): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  moveToBuilding() {
    this.router.navigateByUrl('Employee/Building');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.floor) { 
      if (this.floor.hasOwnProperty(key)) {
        const field = key as keyof Floor;
        if (!this.floor[field]) {
          if (field == 'name' || field == 'floorMonitorID') {
            this.validationErrors[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        } else {
          if (field == 'name') {
            if (this.floor.name.length > 100) {
              this.validationErrors[field] = `*${this.capitalizeField(
                field
              )} cannot be longer than 100 characters`;
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

  onInputValueChange(event: { field: keyof Floor; value: any }) {
    const { field, value } = event;
    (this.floor as any)[field] = value;
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

  SaveFloor() { 
    if (this.isFormValid()) {
      this.isLoading = true;
      this.floor.buildingID = this.buildingId;
      if (this.editFloor == false) {
        this.floorService.Add(this.floor, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.getFloorData(this.DomainName, this.CurrentPage, this.PageSize);
            this.isLoading = false;
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
        this.floorService.Edit(this.floor, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.getFloorData(this.DomainName, this.CurrentPage, this.PageSize);
            this.isLoading = false;
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

  deleteFloor(id: number) {
    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " +this.translate.instant('Floor') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.floorService.Delete(id, this.DomainName).subscribe((data: any) => {
          this.floorData = [];
          this.getFloorData(this.DomainName, this.CurrentPage, this.PageSize);
        });
      }
    });
  }

    changeCurrentPage(currentPage: number) {
    this.CurrentPage = currentPage;
    this.getFloorData(this.DomainName, this.CurrentPage, this.PageSize);
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
