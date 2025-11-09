import { ChangeDetectorRef, Component } from '@angular/core';
import { RemedialTimeTable } from '../../../../Models/LMS/remedial-time-table';
import { RemedialTimeTableService } from '../../../../Services/Employee/LMS/remedial-time-table.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchComponent } from '../../../../Component/search/search.component';
import { School } from '../../../../Models/school';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import Swal from 'sweetalert2';
import { TimeTable } from '../../../../Models/LMS/time-table';
import { firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-remedial-time-table',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './remedial-time-table.component.html',
  styleUrl: './remedial-time-table.component.css'
})
export class RemedialTimeTableComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  DomainName: string = '';
  UserID: number = 0;
  mode: string = '';
  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'name'];
   isRtl: boolean = false;
  subscription!: Subscription;
  SelectedSchoolId: number = 0;
  TableData: RemedialTimeTable[] = [];
  schools: School[] = [];
  remedialTimeTable: RemedialTimeTable = new RemedialTimeTable();
  validationErrors: { [key in keyof RemedialTimeTable]?: string } = {};
  isLoading = false;

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public SchoolServ: SchoolService,
    public RemedialTimeTableServ: RemedialTimeTableService,
    private cdRef: ChangeDetectorRef,    
    private languageService: LanguageService,
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
    this.GetAllSchools();
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

  GetAllSchools() {
    this.TableData = [];
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schools = d;
    });
  }

  GetAllData() {
    this.TableData = [];
    this.RemedialTimeTableServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
      this.TableData = d;
    });
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

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: RemedialTimeTable[] = await firstValueFrom(
        this.RemedialTimeTableServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName)
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
            return fieldValue.toString().includes(numericValue.toString());
          }
          return fieldValue == this.value;
        });
      }
    } catch (error) {
      this.TableData = [];
    }
  }

openModal() {
  if (this.SelectedSchoolId == 0) {
    this.validationErrors["schoolID"] = this.getRequiredErrorMessage('School');
  } else {
    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
    this.remedialTimeTable = new RemedialTimeTable();
  }
}

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');
  }

  EditFavourite(id: number, isFav: boolean) {
    this.RemedialTimeTableServ.EditIsFavourite(id, isFav, this.DomainName).subscribe((d) => {
      this.GetAllData()
    })
  }

isFormValid(): boolean {
  let isValid = true;
  this.validationErrors = {}; // Clear previous errors
  
  // Validate required fields with translation
  if (!this.remedialTimeTable.name) {
    this.validationErrors['name'] = this.getRequiredErrorMessage('Name');
    isValid = false;
  }

  // Validate field length
  if (this.remedialTimeTable.name && this.remedialTimeTable.name.length > 100) {
    this.validationErrors['name'] = `*Name cannot be longer than 100 characters`;
    isValid = false;
  }

  return isValid;
}

  capitalizeField(field: keyof TimeTable): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof TimeTable; value: any }) {
    const { field, value } = event;
    if (field == 'name' || field == 'schoolID') {
      (this.remedialTimeTable as any)[field] = value;
      if (value) {
        this.validationErrors[field] = '';
      }
    }
  }

Generate() {
  this.remedialTimeTable.schoolID = this.SelectedSchoolId;
  if (this.isFormValid()) {
    this.isLoading = true
    this.RemedialTimeTableServ.Add(this.remedialTimeTable, this.DomainName).subscribe((d) => {
      this.showSuccessAlert(this.translate.instant('Generated successfully'));
      this.closeModal();
      this.GetAllData();
      this.isLoading = false
    }, error => {
      const errorMessage = error.error || this.translate.instant('An unexpected error occurred');
      this.showErrorAlert(errorMessage);
      this.isLoading = false
    });
  }
}

  delete(id: number) {
    Swal.fire({
        title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " +  this.translate.instant('Remedial Time Table') + this.translate.instant('?'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#089B41',
        cancelButtonColor: '#17253E',
        confirmButtonText: this.translate.instant('Delete'),
        cancelButtonText: this.translate.instant('Cancel'),
      }).then((result) => {
      if (result.isConfirmed) {
        this.RemedialTimeTableServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData();
        });
      }
    });
  }

  View(id: number) {
    this.router.navigateByUrl('Employee/Remedial TimeTable/' + id);
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

private showErrorAlert(errorMessage: string) {
  const translatedTitle = this.translate.instant('Error');
  const translatedButton = this.translate.instant('Okay');

  Swal.fire({
    icon: 'error',
    title: translatedTitle,
    text: errorMessage,
    confirmButtonText: translatedButton,
    customClass: { confirmButton: 'secondaryBg' },
  });
}

private showSuccessAlert(message: string) {
  const translatedTitle = this.translate.instant('Success');
  const translatedButton = this.translate.instant('Okay');

  Swal.fire({
    icon: 'success',
    title: translatedTitle,
    text: message,
    confirmButtonText: translatedButton,
    customClass: { confirmButton: 'secondaryBg' },
  });
}
}
