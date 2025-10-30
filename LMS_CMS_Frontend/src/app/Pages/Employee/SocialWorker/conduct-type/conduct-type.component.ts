import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ConductType } from '../../../../Models/SocialWorker/conduct-type';
import { ConductService } from '../../../../Services/Employee/SocialWorker/conduct.service';
import { ConductTypeService } from '../../../../Services/Employee/SocialWorker/conduct-type.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { School } from '../../../../Models/school';
import { Section } from '../../../../Models/LMS/section';
import { ConductLevel } from '../../../../Models/SocialWorker/conduct-level';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { SectionService } from '../../../../Services/Employee/LMS/section.service';
import { ConductLevelService } from '../../../../Services/Employee/SocialWorker/conduct-level.service';
import { ConductTypeSection } from '../../../../Models/SocialWorker/conduct-type-section';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-conduct-type',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent , TranslateModule],
  templateUrl: './conduct-type.component.html',
  styleUrl: './conduct-type.component.css'
})
export class ConductTypeComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  SelectedSchoolId: number = 0;
  TableData: ConductType[] = [];
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'ar_name' ,'en_name'];

  conductType: ConductType = new ConductType();

  validationErrors: { [key in keyof ConductType]?: string } = {};
  isLoading = false;

  schools: School[] = [];
  sections: Section[] = [];
  conductLevels: ConductLevel[] = [];
  dropdownOpen = false;
  @ViewChild('classDropdown') classDropdown!: ElementRef;

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    private languageService: LanguageService,
    public account: AccountService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public SchoolServ: SchoolService,
    public ConductLevelServ: ConductLevelService,
    public SectionServ: SectionService,
    public ConductTypeServ: ConductTypeService,
    private realTimeService: RealTimeNotificationServiceService,
    private translate: TranslateService,
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

    // this.GetAllData();
    this.GetSchools();
        this.subscription = this.languageService.language$.subscribe(direction => {
    this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

   ngOnDestroy(): void {
      this.realTimeService.stopConnection(); 
       if (this.subscription) {
        this.subscription.unsubscribe();
      }
  }

  GetAllData() {
    this.TableData = [];
    this.ConductTypeServ.GetBySchool(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
      this.TableData = d;
    });
  }

  GetSchools() {
    this.schools = []
    this.sections = []
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schools = d
    })
  }

  GetConductLevels() {
    this.conductLevels = []
    this.ConductLevelServ.Get(this.DomainName).subscribe((d) => {
      this.conductLevels = d
    })
  }

  GetSectionsBySchool() {
    this.sections = []
    this.conductType.sectiondids = []
    this.conductType.conductTypeSections = []
    this.SectionServ.GetBySchoolId(this.conductType.schoolID, this.DomainName).subscribe((d) => {
      this.sections = d
    })
  }

  toggleDropdown(event?: MouseEvent) {
    // prevent this click from propagating to the document listener
    if (event) {
      event.stopPropagation();
    }
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectSection(section: Section): void {
    this.validationErrors["sectiondids"] = ``;

    if (!this.conductType.conductTypeSections.some((e) => e.sectionID === section.id)) {
      const conductTypeService = new ConductTypeSection()
      conductTypeService.sectionID = section.id
      conductTypeService.sectionName = section.name
      this.conductType.conductTypeSections.push(conductTypeService);
    }

    if (!this.conductType.sectiondids.some((e) => e === section.id)) {
      this.conductType.sectiondids.push(section.id);
    }

    this.dropdownOpen = false; // Close dropdown after selection
  }

  removeSelected(id: number): void {
    console.log(id)
    this.conductType.conductTypeSections = this.conductType.conductTypeSections.filter((e) => e.sectionID !== id);
    this.conductType.sectiondids = this.conductType.sectiondids.filter(
      (i) => i !== id
    );
  }

  Create() {
    this.mode = 'Create';
    this.conductType = new ConductType();
    this.validationErrors = {};
    this.sections = []
    this.GetConductLevels()
    this.openModal();
  }

  Delete(id: number) {
    Swal.fire({
        title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('Type') + this.translate.instant('?'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#089B41',
        cancelButtonColor: '#17253E',
        confirmButtonText: this.translate.instant('Delete'),
        cancelButtonText: this.translate.instant('Cancel'),
      }).then((result) => {
      if (result.isConfirmed) {
        this.ConductTypeServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData();
        });
      }
    });
  }

  Edit(id: number) {
    this.mode = 'Edit';
    this.ConductTypeServ.GetByID(id, this.DomainName).subscribe((d) => {
      this.conductType = d;
      this.conductType.sectiondids = this.conductType.conductTypeSections.map(s => s.sectionID);
      this.GetConductLevels();
      this.sections = []
      this.SectionServ.GetBySchoolId(this.conductType.schoolID, this.DomainName).subscribe((d) => {
        this.sections = d
      })
    });
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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.dropdownOpen) {
      // if dropdown reference exists
      const clickedInside = this.classDropdown?.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.dropdownOpen = false;
      }
    }
  }

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true;
      if (this.mode == 'Create') {
        this.ConductTypeServ.Add(this.conductType, this.DomainName).subscribe(
          (d) => {
            this.GetAllData();
            this.isLoading = false;
            this.closeModal();
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Created Successfully',
              confirmButtonColor: '#089B41',
            });
          },
          (error) => {
            this.isLoading = false; // Hide spinner
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' }
            });
          }
        );
      }
      if (this.mode == 'Edit') {
        this.ConductTypeServ.Edit(this.conductType, this.DomainName).subscribe(
          (d) => {
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Updated Successfully',
              confirmButtonColor: '#089B41',
            });
            this.GetAllData();
            this.isLoading = false;
            this.closeModal();
          },
          (error) => {
            console.log(error)
            this.isLoading = false; // Hide spinner
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' }
            });
          }
        );
      }
    }
  }

  closeModal() {
    this.isModalVisible = false;
  }

  openModal() {
    this.validationErrors = {};
    this.isModalVisible = true;
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.conductType) {
      if (this.conductType.hasOwnProperty(key)) {
        const field = key as keyof ConductType;
        if (!this.conductType[field]) {
          if (
            field == 'en_name' ||
            field == 'ar_name' ||
            field == 'conductLevelID' ||
            field == 'schoolID' ||
            field == 'sectiondids'
          ) {
            this.validationErrors[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        }
        if (this.conductType.sectiondids.length == 0) {
          this.validationErrors["sectiondids"] = `Section Id is required`;
          isValid = false;
        }
      }
    }
    return isValid;
  }

  capitalizeField(field: keyof ConductType): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof ConductType; value: any }) {
    const { field, value } = event;
    (this.conductType as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: ConductType[] = await firstValueFrom(
        this.ConductTypeServ.GetBySchool(this.SelectedSchoolId, this.DomainName)
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
