import { Component } from '@angular/core';
import { Test } from '../../../../Models/Registration/test';
import { Question } from '../../../../Models/Registration/question';
import { TokenData } from '../../../../Models/token-data';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionType } from '../../../../Models/Registration/question-type';
import { TestService } from '../../../../Services/Employee/Registration/test.service';
import { QuestionService } from '../../../../Services/Employee/Registration/question.service';
import { QuestionTypeService } from '../../../../Services/Employee/Registration/question-type.service';
import { QuestionAddEdit } from '../../../../Models/Registration/question-add-edit';
// import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { QuestionOption } from '../../../../Models/Registration/question-option';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';
@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent, TranslateModule],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.css',
})

@InitLoader()
export class QuestionsComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  File: any;
  DomainName: string = '';
  UserID: number = 0;
  path: string = '';

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  mode: string = 'Create';
  isRtl: boolean = false;
  subscription!: Subscription;
  isModalVisible: boolean = false;
  Data: Question[] = [];
  test: Test = new Test();
  question: QuestionAddEdit = new QuestionAddEdit();
  testId: number = 0;
  QuestionTypes: QuestionType[] = [];

  options: QuestionOption[] = [];
  NewOption: string = '';

  validationErrors: { [key in keyof QuestionAddEdit]?: string } = {};
  isLoading = false

  key: string = 'id';
  value: any = '';
  keysArray: string[] = [
    'id',
    'description',
    'questionTypeName',
    'testName',
    'correctAnswerName'
  ];

  private readonly allowedExtensions: string[] = [
    '.jpg', '.jpeg', '.png', '.gif', 
    '.mp4', '.avi', '.mkv', '.mov'
  ];

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    private menuService: MenuService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    public testServ: TestService,
    private translate: TranslateService,
    public QuestionServ: QuestionService,
    public QuestionTypeServ: QuestionTypeService, 
    private languageService: LanguageService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
      this.testId = Number(this.activeRoute.snapshot.paramMap.get('id'));
      this.getTestInfo();
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
    this.GetAllData();
    this.GetQuestionType();
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

  moveToEmployee() {
    this.router.navigateByUrl('Employee/Admission Test');
  }

  GetAllData() {
    this.Data = []
    this.QuestionServ.GetByTestID(this.testId, this.DomainName).subscribe(
      (d: any) => {
        this.Data = d;
      }
    );
  }

  GetByID(id: number) {
    this.question = new QuestionAddEdit();
    this.QuestionServ.GetByID(id, this.DomainName).subscribe(
      (d: any) => {
        this.question = d;
      }
    );
  }

  GetQuestionType() {
    this.QuestionTypeServ.Get(this.DomainName).subscribe((d) => {
      this.QuestionTypes = d;
    });
  }

  getTestInfo() {
    this.testServ.GetByID(this.testId, this.DomainName).subscribe((d) => {
      this.test = d;
    });
  }

  Create() {
    this.mode = 'Create';
    this.question = new QuestionAddEdit();
    this.options = [];
    this.openModal();
  }

  async Delete(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('the') +this.translate.instant('Question') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.QuestionServ.Delete(id, this.DomainName).subscribe((data: any) => {
          this.GetAllData();
        });
      }
    });
  }

  Edit(row: Question) {
    this.mode = 'Edit';
    this.openModal();
    this.GetByID(row.id)
    this.options = row.options
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

  async CreateOREdit() {
    this.question.options = this.options;
    this.question.testID = this.testId;
    if (this.question.questionTypeID == 3) {
      this.question.correctAnswerName = ''
    }
    if (this.isFormValid()) {
      const Swal = await import('sweetalert2').then(m => m.default);

      this.isLoading = true
      if (this.mode == 'Create') {
        this.QuestionServ.Add(this.question, this.DomainName).subscribe(() => {
          this.GetAllData();
          this.closeModal();
          this.isLoading = false
        },
          error => {
            this.isLoading = false
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          });
      }
      if (this.mode == 'Edit') {
        this.QuestionServ.Edit(this.question, this.DomainName).subscribe(() => {
          this.GetAllData();
          this.closeModal();
          this.isLoading = false
        },
          error => {
            this.isLoading = false
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          });
      }
    }
  }

  closeModal() {
    this.isModalVisible = false;
    this.validationErrors = {}
    this.question = new QuestionAddEdit();
    this.options = []
  }

  CorrectAnswer(option: string) {
    this.question.correctAnswerName = option;
    this.validationErrors['correctAnswerName'] = '';
  }

  openModal() {
    this.isModalVisible = true;
  }

  AddOption() {
    if (this.NewOption != "") {
      var existOption = this.options.find(s => s.name == this.NewOption)
      if (existOption) {
        this.validationErrors['options'] = "Option already exists";
        this.NewOption = '';
      } else {
        var option = new QuestionOption()
        option.id = 0;
        option.name = this.NewOption
        this.options.push(option);
        if (this.mode == "Edit") {
          if (!Array.isArray(this.question.newOptions)) {
            this.question.newOptions = [];
          }
          this.question.newOptions.push(this.NewOption);
        }
        this.NewOption = '';
      }
    }
    else {
      this.validationErrors['options'] = "option is required"
    }
  }

  checkOnType() {
    this.question.correctAnswerName = ""
    this.options = [];
    if (this.question.questionTypeID == 1) {
      var option = new QuestionOption()
      option.id = 0;
      option.name = 'True'
      this.options.push(option);
      var option = new QuestionOption()
      option.id = 0;
      option.name = 'False'
      this.options.push(option);
      if (this.mode == "Edit") {
        if (!Array.isArray(this.question.newOptions)) {
          this.question.newOptions = [];
        }
        this.question.newOptions.push('True');
        this.question.newOptions.push('False');
      }
    }
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.question) {
      if (this.question.hasOwnProperty(key)) {
        const field = key as keyof QuestionAddEdit;
        if (!this.question[field]) {
          if (
            field == 'description' ||
            field == 'questionTypeID' ||
            field == 'testID'
          ) {
            this.validationErrors[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        }
      }
    }
    if (
      this.question.questionTypeID == 1 ||
      this.question.questionTypeID == 2
    ) {
      if (!this.question.options || this.question.options.length === 0) {
        this.validationErrors['options'] = `*${this.capitalizeField('options')} is required`;
        isValid = false;
      } else {
        const trimmedOptions = this.question.options.map(opt => opt.name?.trim()).filter(opt => opt !== undefined);
        const hasEmpty = trimmedOptions.some(opt => opt === '');
        if (hasEmpty) {
          this.validationErrors['options'] = `*${this.capitalizeField('options')} cannot contain empty values`;
          isValid = false;
        }
        const lowerCaseOptions = trimmedOptions.map(opt => opt.toLowerCase());
        const hasDuplicates = new Set(lowerCaseOptions).size !== lowerCaseOptions.length;
        if (hasDuplicates) {
          this.validationErrors['options'] = `*Duplicate ${this.capitalizeField('options')} are not allowed`;
          isValid = false;
        }
      }
      if (this.question.correctAnswerName == '' || this.question.correctAnswerName == null) {
        this.validationErrors['correctAnswerName'] = `*${this.capitalizeField(
          'correctAnswerName'
        )} is required`;
        isValid = false;
      }
      const options = this.question.options || [];
      if (!this.question.correctAnswerName || this.question.correctAnswerName.trim() === '') {
        this.validationErrors['correctAnswerName'] = 'Choose correct answer';
        isValid = false;
      } else {
        const normalizedCorrect = this.question.correctAnswerName.trim().toLowerCase();
        const normalizedOptions = options.map(o => o.name?.trim().toLowerCase());
        const exists = normalizedOptions.includes(normalizedCorrect);

        if (!exists) {
          this.validationErrors['correctAnswerName'] = 'Correct answer must match one of the options.';
          isValid = false;
        }
      }
    }
    return isValid;
  }

  capitalizeField(field: keyof QuestionAddEdit): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof QuestionAddEdit; value: any }) {
    const { field, value } = event;
    (this.question as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    } else {
      this.validationErrors[field] = `*${this.capitalizeField(
        field
      )} is required`;
    }
  }

  async onFileUpload(event: any) {
    this.validationErrors['imageFile'] = '';

    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileType = file.type;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      if (file.size > 25 * 1024 * 1024) {
        this.validationErrors['imageFile'] = 'The file size exceeds the maximum limit of 25 MB.';
        this.question.imageFile = null;
        return;
      }

      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!this.allowedExtensions.includes(fileExtension)) {
        const Swal = await import('sweetalert2').then(m => m.default);

        Swal.fire({
          title: 'Invalid file type',
          html: `The file <strong>${file.name}</strong> is not an allowed type. Allowed types are:<br><strong>${this.allowedExtensions.join(', ')}</strong>`,
          icon: 'warning',
          confirmButtonColor: '#089B41',
          confirmButtonText: "OK"
        }); 
        this.question.videoFile = null;
        this.question.imageFile = null;
        return;
      }
      if (fileType.startsWith('image/')) {
        this.question.video = "";
        this.question.videoFile = null;
        this.question.image = file.name;
        this.question.imageFile = file;
      } else if (fileType.startsWith('video/')) {
        this.question.videoFile = file;
        this.question.video = file.name;
        this.question.imageFile = null;
        this.question.image = "";
      } else {
        alert('Invalid file type. Please upload an image or video.');
      }
    }
  }  

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: Question[] = await firstValueFrom(
        this.QuestionServ.GetByTestID(this.testId, this.DomainName)
      );
      this.Data = data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.Data = this.Data.filter((t) => {
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
      this.Data = [];
    }
  }

  onOptionEdit(editedOption: any): void {
    if (!this.question.editedOptions) {
      this.question.editedOptions = [];
    }

    if (this.mode == "Edit" && editedOption.id != 0) {
      const exists = this.question.editedOptions.find(
        (opt: any) => opt.id === editedOption.id
      );

      if (exists) {
        exists.name = editedOption.name;
        exists.id = editedOption.id; // if you also have `order`
      } else {
        // Add new edited entry
        this.question.editedOptions.push({
          id: editedOption.id,
          name: editedOption.name
        });
      }
    }
  }

  deleteOption(index: number): void {
    const removed = this.options.splice(index, 1)[0];
    if (!Array.isArray(this.question.deletedOptions)) {
      this.question.deletedOptions = [];
    }
    if (this.mode === 'Edit' && removed?.id != 0) {
      // Mark as deleted for API if it was already saved
      this.question.deletedOptions.push(removed.id);
    }
  }
}
