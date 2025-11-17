import { Component } from '@angular/core';
import { TokenData } from '../../../../Models/token-data';
import { LessonActivity } from '../../../../Models/LMS/lesson-activity';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { LessonActivityService } from '../../../../Services/Employee/LMS/lesson-activity.service';
import { LessonService } from '../../../../Services/Employee/LMS/lesson.service';
import { Lesson } from '../../../../Models/LMS/lesson';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LessonActivityType } from '../../../../Models/LMS/lesson-activity-type';
import { LessonActivityTypeService } from '../../../../Services/Employee/LMS/lesson-activity-type.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-lesson-activity',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './lesson-activity.component.html',
  styleUrl: './lesson-activity.component.css'
})
export class LessonActivityComponent {
  keysArray: string[] = ['id', 'englishTitle', 'arabicTitle', 'lessonEnglishTitle', 'lessonArabicTitle'];
  key: string = 'id';
  value: any = '';

  LessonActivityData: LessonActivity[] = [];
  lessonActivity: LessonActivity = new LessonActivity();
  lesson: Lesson = new Lesson();
  editLessonActivity: boolean = false;
  validationErrors: { [key in keyof LessonActivity]?: string } = {};
  isRtl: boolean = false;
  subscription!: Subscription;
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = '';

  DomainName: string = '';
  UserID: number = 0;
  lessonId: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  isLoading = false;

  safeDetailsHtml: SafeHtml | null = null;

  LessonActivityTypes: LessonActivityType[] = []
  selectedAttachmentType: 'file' | 'text' | null = null;

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService,
    private translate: TranslateService,
    public activeRoute: ActivatedRoute,
    public router: Router,
    public lessonActivityService: LessonActivityService,
    public lessonService: LessonService,
    private sanitizer: DomSanitizer,
    public lessonActivityTypeService: LessonActivityTypeService,
    private languageService: LanguageService, 
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    this.lessonId = Number(this.activeRoute.snapshot.paramMap.get('id'));

    this.GetLessonActivityByLessonId()
    this.GetLessonById()

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

  GetLessonActivityByLessonId() {
    this.LessonActivityData = [];
    this.lessonActivityService.GetByLessonId(this.lessonId, this.DomainName).subscribe((data) => {
      this.LessonActivityData = data;
    });
  }

  GetLessonById() {
    this.lessonService.GetByID(this.lessonId, this.DomainName).subscribe((data) => {
      this.lesson = data
      this.safeDetailsHtml = this.sanitizer.bypassSecurityTrustHtml(this.lesson.details);
    });
  }

  GetLessonActivityById(id: number) {
    this.lessonActivityService.GetByID(id, this.DomainName).subscribe((data) => {
      this.lessonActivity = data;
      if (this.lessonActivity.attachmentLink != null && this.lessonActivity.attachmentLink != '') {
        if (this.lessonActivity.attachmentLink?.includes('LMS/LessonActivity')) {
          this.selectedAttachmentType = 'file'
        } else {
          this.selectedAttachmentType = 'text'
        }
      }
    });
  }

  GetLessonActivityTypes() {
    this.LessonActivityTypes = []
    this.lessonActivityTypeService.Get(this.DomainName).subscribe((data) => {
      this.LessonActivityTypes = data;
    });
  }

  openModal(lessonActivityId?: number) {
    if (lessonActivityId) {
      this.editLessonActivity = true;
      this.GetLessonActivityById(lessonActivityId);
    }

    this.GetLessonActivityTypes();

    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');

    this.lessonActivity = new LessonActivity();

    this.selectedAttachmentType = null
    this.LessonActivityTypes = []

    if (this.editLessonActivity) {
      this.editLessonActivity = false;
    }
    this.validationErrors = {};
  }

  capitalizeField(field: keyof LessonActivity): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.lessonActivity) {
      if (this.lessonActivity.hasOwnProperty(key)) {
        const field = key as keyof LessonActivity;
        if (!this.lessonActivity[field]) {
          if (field == 'englishTitle' || field == 'arabicTitle' || field == 'order' || field == 'lessonActivityTypeID') {
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
            isValid = false;
          }
        } else {
          if (field == 'englishTitle' || field == 'arabicTitle') {
            if (this.lessonActivity.englishTitle.length > 100 || this.lessonActivity.arabicTitle.length > 100) {
              this.validationErrors[field] = `*${this.capitalizeField(field)} cannot be longer than 100 characters`;
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

  validateNumber(event: any, field: keyof LessonActivity): void {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '')
    event.target.value = value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.lessonActivity[field] === 'string') {
        this.lessonActivity[field] = '' as never;
      }
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;

    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        this.validationErrors['attachmentFile'] = 'The file size exceeds the maximum limit of 25 MB.';
        this.lessonActivity.attachmentFile = null;
        return;
      }
      else {
        this.lessonActivity.attachmentFile = file;
        this.lessonActivity.attachmentLink = '';
        this.validationErrors['attachmentFile'] = '';

        const reader = new FileReader();
        reader.readAsDataURL(file);
      }
    }
    event.target.value = '';
    input.value = '';
  }

  onInputValueChange(event: { field: keyof LessonActivity; value: any }) {
    const { field, value } = event;
    (this.lessonActivity as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  handleAttachmentTypeToggle(type: 'file' | 'text') {
    if (this.selectedAttachmentType === type) {
      this.clearAttachmentType();
    } else {
      this.selectedAttachmentType = type;
      this.lessonActivity.attachmentLink = '';
      this.lessonActivity.attachmentFile = null;
    }
  }

  clearAttachmentType() {
    this.selectedAttachmentType = null;
    this.lessonActivity.attachmentLink = '';
    this.lessonActivity.attachmentFile = null;
  }

  Save() {
    this.lessonActivity.lessonID = this.lessonId
    if (this.isFormValid()) {
      this.isLoading = true;

      if (this.editLessonActivity == false) {
        this.lessonActivityService.Add(this.lessonActivity, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetLessonActivityByLessonId();
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
        this.lessonActivityService.Edit(this.lessonActivity, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetLessonActivityByLessonId();
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

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: LessonActivity[] = await firstValueFrom(
        this.lessonActivityService.GetByLessonId(this.lessonId, this.DomainName)
      );
      this.LessonActivityData = data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.LessonActivityData = this.LessonActivityData.filter((t) => {
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
      this.LessonActivityData = [];
    }
  }

  Delete(id: number) {
    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('the') + this.translate.instant('Activity') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.lessonActivityService.Delete(id, this.DomainName).subscribe((data: any) => {
          this.GetLessonActivityByLessonId();
        });
      }
    });
  }

  moveToLesson() {
    this.router.navigateByUrl('Employee/Lessons')
  }
}
