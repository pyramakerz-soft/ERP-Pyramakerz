import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import { Grade } from '../../../../Models/LMS/grade';
import { Section } from '../../../../Models/LMS/section';
import { TokenData } from '../../../../Models/token-data';
import { SectionService } from '../../../../Services/Employee/LMS/section.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
// import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';
@Component({
  selector: 'app-grade',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './grade.component.html',
  styleUrl: './grade.component.css'
})

@InitLoader()
export class GradeComponent {
  keysArray: string[] = ['id', 'name'];
  key: string = "id";
  value: any = "";
  isRtl: boolean = false;
  subscription!: Subscription;
  gradeData: Grade[] = []
  UpgradeToGrade: Grade[] = []
  grade: Grade = new Grade()
  section: Section = new Section()
  editGrade: boolean = false
  validationErrors: { [key in keyof Grade]?: string } = {};

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = ""

  DomainName: string = "";
  UserID: number = 0;
  sectionId: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  isLoading = false;

  constructor(public account: AccountService,
    private languageService: LanguageService, public sectionService: SectionService, public gradeService: GradeService, public ApiServ: ApiService, public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService, public activeRoute: ActivatedRoute, public router: Router, private translate: TranslateService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });

    this.sectionId = Number(this.activeRoute.snapshot.paramMap.get('Id'))
    this.DomainName = String(this.activeRoute.snapshot.paramMap.get('domainName'))

    this.getSectionData()
    this.getGradeData()

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others
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



  getSectionData() {
    this.sectionService.GetByID(this.sectionId, this.DomainName).subscribe(
      (data) => {
        this.section = data;
      }
    )
  }

  getGradeData() {
    this.gradeData = [] 
    this.gradeService.GetBySectionId(this.sectionId, this.DomainName).subscribe(
      (data) => {
        this.gradeData = data; 
      }
    )
  }

  getUpgradeToGradeData() {
    this.UpgradeToGrade = [] 
    this.gradeService.GetBySchoolId(this.section.schoolID, this.DomainName).subscribe(
      (data) => { 
        this.UpgradeToGrade = data.filter((g: any) => g.id !== this.grade.id);
      }
    )
  }

  GetGradeById(Id: number) {
    this.gradeService.GetByID(Id, this.DomainName).subscribe((data) => {
      this.grade = data;
    });
  }

  openModal(Id?: number) {
    this.getUpgradeToGradeData()
    if (Id) {
      this.editGrade = true;
      this.GetGradeById(Id);
    }

    document.getElementById("Add_Modal")?.classList.remove("hidden");
    document.getElementById("Add_Modal")?.classList.add("flex");
  }

  closeModal() {
    document.getElementById("Add_Modal")?.classList.remove("flex");
    document.getElementById("Add_Modal")?.classList.add("hidden");

    this.grade = new Grade()

    if (this.editGrade) {
      this.editGrade = false
    }
    this.validationErrors = {};
  }

  async onSearchEvent(event: { key: string, value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: Grade[] = await firstValueFrom(this.gradeService.GetBySectionId(this.sectionId, this.DomainName));
      this.gradeData = data || [];

      if (this.value !== "") {
        const numericValue = isNaN(Number(this.value)) ? this.value : parseInt(this.value, 10);

        this.gradeData = this.gradeData.filter(t => {
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
      this.gradeData = [];
    }
  }

  moveToSection() {
    this.router.navigateByUrl("Employee/Section")
  }

  capitalizeField(field: keyof Grade): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.grade) {
      if (this.grade.hasOwnProperty(key)) {
        const field = key as keyof Grade;
        if (!this.grade[field]) {
          if (field == "name" || field == "dateFrom" || field == "dateTo") {
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`
            isValid = false;
          }
        } else {
          if (field == "name") {
            if (this.grade.name.length > 100) {
              this.validationErrors[field] = `*${this.capitalizeField(field)} cannot be longer than 100 characters`
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

  onInputValueChange(event: { field: keyof Grade, value: any }) {
    const { field, value } = event;
    (this.grade as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID, this.UserID, this.AllowDeleteForOthers);
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  async checkFromToDate() {
    let valid = true

    const fromDate: Date = new Date(this.grade.dateFrom);
    const toDate: Date = new Date(this.grade.dateTo);
    const diff: number = toDate.getTime() - fromDate.getTime();

    if (diff < 0) {
      valid = false
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        title: 'From Birthdate Must Be a Date Before To Birthdate',
        icon: 'warning',
        confirmButtonColor: '#089B41',
        confirmButtonText: 'Ok',
      });

      this.isLoading = false;
    }

    return valid
  }

  // validateNumber(event: any, field: keyof Grade): void {
  //   const value = event.target.value;
  //   if (isNaN(value) || value === '') {
  //     event.target.value = '';
  //     if (typeof this.grade[field] === 'string') {
  //       this.grade[field] = null as never;
  //     }
  //   }
  // }

  validateNumber(event: any, field: keyof Grade): void {
    const value = event.target.value;

    if (!/^\d*$/.test(value)) {
      event.target.value = value.replace(/[^\d]/g, ''); // remove invalid chars
    }

    this.grade[field] = event.target.value === '' ? null as never : +event.target.value as never;
  }

  async SaveGrade() {
    if (this.isFormValid()) {
      const Swal = await import('sweetalert2').then(m => m.default);

      this.isLoading = true;
      this.grade.sectionID = this.sectionId
      this.checkFromToDate()
      if (await this.checkFromToDate()) {
        if (this.editGrade == false) {
          this.gradeService.Add(this.grade, this.DomainName).subscribe(
            (result: any) => {
              this.closeModal()
              this.isLoading = false;
              this.getGradeData()
            },
            error => {
              this.isLoading = false;
              Swal.fire({
                icon: 'error',
                text: error.error,
                confirmButtonText: 'Okay',
                customClass: { confirmButton: 'secondaryBg' },
              });
            }
          );
        } else {
          this.gradeService.Edit(this.grade, this.DomainName).subscribe(
            (result: any) => {
              this.closeModal()
              this.getGradeData()
              this.isLoading = false;

            },
            error => {
              this.isLoading = false;
              Swal.fire({
                icon: 'error',
                text: error.error,
                confirmButtonText: 'Okay',
                customClass: { confirmButton: 'secondaryBg' },
              });
            }
          );
        }
      }
    }
  }

  async deleteGrade(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('Grade') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.gradeService.Delete(id, this.DomainName).subscribe(
          (data: any) => {
            this.gradeData = []
            this.getGradeData()
          }
        );
      }
    });
  }
}
