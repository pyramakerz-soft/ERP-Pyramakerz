import { Component } from '@angular/core';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { Subject } from '../../../../Models/LMS/subject';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { AddEditSubjectComponent } from '../../../../Component/Employee/LMS/add-edit-subject/add-edit-subject.component';
import { MatDialog } from '@angular/material/dialog';
import { WeightType } from '../../../../Models/LMS/weight-type';
import { SubjectWeight } from '../../../../Models/LMS/subject-weight';
import { SubjectResource } from '../../../../Models/LMS/subject-resource';
import { SubjectWeightService } from '../../../../Services/Employee/LMS/subject-weight.service';
import { SubjectResourceService } from '../../../../Services/Employee/LMS/subject-resource.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { WeightTypeService } from '../../../../Services/Employee/LMS/weight-type.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-subject-view',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './subject-view.component.html',
  styleUrl: './subject-view.component.css'
})
export class SubjectViewComponent {
  subject: Subject = new Subject()
  subjectId = 0;
  DomainName = "";
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  path: string = ""
  SubjectWeights: SubjectWeight[] = []
  subjectWeightElement: SubjectWeight = new SubjectWeight()
  SubjectResourceElement: SubjectResource = new SubjectResource()
  SubjectResources: SubjectResource[] = []
  WeightTypes: WeightType[] = []
  editSubjectWeight: boolean = false;

  validationErrorsForWeights: { [key in keyof SubjectWeight]?: string } = {};
  validationErrorsForResources: { [key in keyof SubjectResource]?: string } = {};

  isLoading = false;
  isWeightPart: boolean = true

  constructor(private languageService: LanguageService, public subjectService: SubjectService, public activeRoute: ActivatedRoute, public router: Router, public EditDeleteServ: DeleteEditPermissionService,
    public account: AccountService, private menuService: MenuService, public dialog: MatDialog, public subjectWeightService: SubjectWeightService,private translate: TranslateService,
    public subjectResourceService: SubjectResourceService, private realTimeService: RealTimeNotificationServiceService, public weightTypeService: WeightTypeService) { }

  async ngOnInit() {
    this.subjectId = await Number(this.activeRoute.snapshot.paramMap.get('SubId'))
    this.DomainName = await String(this.activeRoute.snapshot.paramMap.get('domainName'))

    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.GetSubjectById()
    this.GetSubjectWeightsBySubjectID()
    this.GetSubjectResourcesBySubjectID()

    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
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


  GetSubjectById() {
    this.subjectService.GetByID(this.subjectId, this.DomainName).subscribe((data) => {
      this.subject = data;
    })
  }

  moveToSubjects() {
    this.router.navigateByUrl('Employee/Subject');
  }

  editModal() {
    this.openDialog(this.subject.id, true);
  }

  openDialog(subjectId?: number, editSubject?: boolean): void {
    const dialogRef = this.dialog.open(AddEditSubjectComponent, {
      data: editSubject
        ? {
          subjectId: subjectId,
          editSubject: editSubject
        }
        : {
          editSubject: false
        },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.GetSubjectById()
    });
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID, this.UserID, this.AllowDeleteForOthers);
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  GetSubjectWeightsBySubjectID() {
    this.SubjectWeights = []
    this.subjectWeightService.GetBySubjectId(this.subjectId, this.DomainName).subscribe(
      data => {
        this.SubjectWeights = data
      }
    )
  }

  GetWeightTypes() {
    this.WeightTypes = []
    this.weightTypeService.Get(this.DomainName).subscribe(
      data => {
        this.WeightTypes = data
      }
    )
  }

  GetSubjectResourcesBySubjectID() {
    this.SubjectResources = []
    this.subjectResourceService.GetBySubjectId(this.subjectId, this.DomainName).subscribe(
      data => {
        this.SubjectResources = data
      }
    )
  }

  GetSubjectWeightById(id: number) {
    this.subjectWeightElement = new SubjectWeight()
    this.subjectWeightService.GetByID(id, this.DomainName).subscribe(
      data => {
        this.subjectWeightElement = data
      }
    )
  }

  subjectWeight(id?: number) {
    if (id) {
      this.editSubjectWeight = true;
      this.GetSubjectWeightById(id);
    }

    this.GetWeightTypes()

    document.getElementById("Weight_Modal")?.classList.remove("hidden");
    document.getElementById("Weight_Modal")?.classList.add("flex");
  }

  subjectResource() {
    document.getElementById("Resource_Modal")?.classList.remove("hidden");
    document.getElementById("Resource_Modal")?.classList.add("flex");
  }

  closeSubjectWeight() {
    document.getElementById("Weight_Modal")?.classList.remove("flex");
    document.getElementById("Weight_Modal")?.classList.add("hidden");

    this.subjectWeightElement = new SubjectWeight()

    if (this.editSubjectWeight) {
      this.editSubjectWeight = false
    }
    this.validationErrorsForWeights = {};
  }

  closeSubjectResource() {
    document.getElementById("Resource_Modal")?.classList.remove("flex");
    document.getElementById("Resource_Modal")?.classList.add("hidden");
    this.SubjectResourceElement = new SubjectResource()

    this.validationErrorsForResources = {};
  }

  DeleteSubjectWeight(id: number) {
    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('Weight') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.subjectWeightService.Delete(id, this.DomainName).subscribe(
          (data: any) => {
            this.GetSubjectWeightsBySubjectID()
          }
        );
      }
    });
  }

  DeleteSubjecResource(id: number) {
    Swal.fire({
        title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('Resource') + this.translate.instant('?'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#089B41',
        cancelButtonColor: '#17253E',
        confirmButtonText: this.translate.instant('Delete'),
        cancelButtonText: this.translate.instant('Cancel'),
      }).then((result) => {
      if (result.isConfirmed) {
        this.subjectResourceService.Delete(id, this.DomainName).subscribe(
          (data: any) => {
            this.GetSubjectResourcesBySubjectID()
          }
        );
      }
    });
  }

  downloadFile(fileUrl: string): void {
    fetch(fileUrl)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileUrl.split('/').pop() || 'download';
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Download error:', error));
  }

  capitalizeFieldForSubjectWeight(field: keyof SubjectWeight): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  capitalizeFieldForSubjectResource(field: keyof SubjectResource): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValidForSubjectWeight(): boolean {
    let isValid = true;
    for (const key in this.subjectWeightElement) {
      if (this.subjectWeightElement.hasOwnProperty(key)) {
        const field = key as keyof SubjectWeight;
        if (!this.subjectWeightElement[field]) {
          if (field == "weightTypeID" || field == "weight") {
            this.validationErrorsForWeights[field] = `*${this.capitalizeFieldForSubjectWeight(field)} is required`
            isValid = false;
          }
        } else {
          this.validationErrorsForWeights[field] = '';
        }
      }
    }
    return isValid;
  }

  isFormValidForSubjectResource(): boolean {
    let isValid = true;
    for (const key in this.SubjectResourceElement) {
      if (this.SubjectResourceElement.hasOwnProperty(key)) {
        const field = key as keyof SubjectResource;
        if (!this.SubjectResourceElement[field]) {
          if (field == "file" || field == "englishName" || field == 'arabicName') {
            this.validationErrorsForResources[field] = `*${this.capitalizeFieldForSubjectResource(field)} is required`
            isValid = false;
          }
        } else {
          if (field == "englishName" || field == 'arabicName') {
            if (this.SubjectResourceElement.englishName.length > 100 || this.SubjectResourceElement.arabicName.length > 100) {
              this.validationErrorsForResources[field] = `*${this.capitalizeFieldForSubjectResource(field)} cannot be longer than 100 characters`
              isValid = false;
            } else {
              this.validationErrorsForResources[field] = '';
            }
          } else {
            this.validationErrorsForResources[field] = '';
          }
        }
      }
    }

    return isValid;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;

    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        this.validationErrorsForResources['file'] = 'The file size exceeds the maximum limit of 25 MB.';
        this.SubjectResourceElement.file = null;
        return;
      }
      else {
        this.SubjectResourceElement.file = file
        this.validationErrorsForResources['file'] = '';
        const reader = new FileReader();
        reader.readAsDataURL(file);
      }
    }
    input.value = '';
  }

  onInputValueChangeForSubjectWeight(event: { field: keyof SubjectWeight, value: any }) {
    const { field, value } = event;
    (this.subjectWeightElement as any)[field] = value;
    if (value) {
      this.validationErrorsForWeights[field] = '';
    }
  }

  onInputValueChangeForSubjectResource(event: { field: keyof SubjectResource, value: any }) {
    const { field, value } = event;
    (this.subjectWeightElement as any)[field] = value;
    if (value) {
      this.validationErrorsForResources[field] = '';
    }
  }

  validateNumber(event: any, field: keyof SubjectWeight): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.subjectWeightElement[field] === 'string') {
        this.subjectWeightElement[field] = '' as never;
      }
    }
  }

  SaveSubjectWeight() {
    if (this.isFormValidForSubjectWeight()) {
      this.subjectWeightElement.subjectID = this.subjectId
      this.isLoading = true;
      if (this.editSubjectWeight == false) {
        this.subjectWeightService.Add(this.subjectWeightElement, this.DomainName).subscribe(
          (result: any) => {
            this.closeSubjectWeight()
            this.isLoading = false;
            this.GetSubjectWeightsBySubjectID()
          },
          error => {
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
        this.subjectWeightService.Edit(this.subjectWeightElement, this.DomainName).subscribe(
          (result: any) => {
            this.closeSubjectWeight()
            this.GetSubjectWeightsBySubjectID()
            this.isLoading = false;
          },
          error => {
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

  SaveSubjectResource() {
    if (this.isFormValidForSubjectResource()) {
      this.SubjectResourceElement.subjectID = this.subjectId
      this.isLoading = true;
      this.subjectResourceService.Add(this.SubjectResourceElement, this.DomainName).subscribe(
        (result: any) => {
          this.closeSubjectResource()
          this.isLoading = false;
          this.GetSubjectResourcesBySubjectID()
        },
        error => {
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
