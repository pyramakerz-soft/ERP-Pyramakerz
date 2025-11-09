import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { QuestionBank } from '../../../../Models/LMS/question-bank';
import { QuestionBankService } from '../../../../Services/Employee/LMS/question-bank.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { Lesson } from '../../../../Models/LMS/lesson';
import { Tag } from '../../../../Models/LMS/tag';
import { BloomLevel } from '../../../../Models/LMS/bloom-level';
import { DokLevel } from '../../../../Models/LMS/dok-level';
import { QuestionBankType } from '../../../../Models/LMS/question-bank-type';
import { Subject } from '../../../../Models/LMS/subject';
import { LessonService } from '../../../../Services/Employee/LMS/lesson.service';
import { TagsService } from '../../../../Services/Employee/LMS/tags.service';
import { BloomLevelService } from '../../../../Services/Employee/LMS/bloom-level.service';
import { DokLevelService } from '../../../../Services/Employee/LMS/dok-level.service';
import { QuestionBankTypeService } from '../../../../Services/Employee/LMS/question-bank-type.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { QuillEditorComponent, QuillModule } from 'ngx-quill';
import { FormsModule } from '@angular/forms';
import { QuestionBankOption } from '../../../../Models/LMS/question-bank-option';
import { SubBankQuestion } from '../../../../Models/LMS/sub-bank-question';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { School } from '../../../../Models/school';
import { Grade } from '../../../../Models/LMS/grade';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-question-bank',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, QuillModule, TranslateModule],
  templateUrl: './question-bank.component.html',
  styleUrl: './question-bank.component.css'
})
export class QuestionBankComponent {
  @ViewChild('dropdownContainer') dropdownRef!: ElementRef;

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: QuestionBank[] = [];
  Data: QuestionBank[] = [];
  lesson: Lesson[] = [];
  tag: Tag[] = [];
  bloomLevel: BloomLevel[] = [];
  dokLevel: DokLevel[] = [];
  questionBankType: QuestionBankType[] = [];

  DomainName: string = '';
  UserID: number = 0;
  isRtl: boolean = false;
  subscription!: Subscription;
  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'lessonName', 'mark', 'difficultyLevel', 'questionTypeName'];

  CurrentPage: number = 1
  PageSize: number = 10
  TotalPages: number = 1
  TotalRecords: number = 0
  isDeleting: boolean = false;
  validationErrors: { [key in keyof QuestionBank]?: string } = {};
  isLoading = false;
  isAddSubQuestion = false;
  questionBank: QuestionBank = new QuestionBank()
  NewOption: string = ""
  TagsSelected: Tag[] = [];
  dropdownOpen = false;

  SelectedSchoolId: number = 0;
  SelectedGradeId: number = 0;
  SelectedSubjectId: number = 0;
  schools: School[] = []
  Grades: Grade[] = []
  subjects: Subject[] = [];
  IsView: boolean = false

  schoolsForCreate: School[] = []
  GradesForCreate: Grade[] = []
  subjectsForCreate: Subject[] = [];

  @ViewChild('quillEditor') quillEditorComponent!: QuillEditorComponent;
  quillInstance: any;

  editorModules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: () => this.customImageHandler(),
        video: () => this.customVideoHandler()
      }
    }
  };

  constructor(
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public BusTypeServ: BusTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public QuestionBankServ: QuestionBankService,
    public SubjectServ: SubjectService,
    public LessonServ: LessonService,
    public TagServ: TagsService,
    private SchoolServ: SchoolService,
    private GradeServ: GradeService,
    public BloomLevelServ: BloomLevelService,
    public DokLevelServ: DokLevelService,
    public QuestionBankTypeServ: QuestionBankTypeService,
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

    this.getAllSchools()
    this.GetAllDokLevel()
    this.GetAllQuestionBankType()
    this.GetAllBloomLevel()
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

  getAllGradesBySchoolId() {
    this.IsView = false
    this.Grades = []
    this.SelectedGradeId = 0
    this.subjects = []
    this.SelectedSubjectId = 0
    this.GradeServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
      this.Grades = d
    })
  }

  getAllSchools() {
    this.schools = []
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schools = d
    })
  }

  getAllSubject() {
    this.subjects = []
    this.IsView = false
    this.SelectedSubjectId = 0
    this.SubjectServ.GetByGradeId(this.SelectedGradeId, this.DomainName).subscribe((d) => {
      this.subjects = d
    })
  }

  SubjectChanged() {
    this.IsView = false
  }

  viewTable() {
    this.IsView = true
    this.GetAllData(this.CurrentPage, this.PageSize)
  }


  onEditorCreated(quill: any) {
    this.quillInstance = quill;
  }

  customImageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          const { value: formValues } = await Swal.fire({
            title: 'Set Image Size',
            // html:
            //   `<input id="swal-input1" class="swal2-input" placeholder="Width (px)">` +
            //   `<input id="swal-input2" class="swal2-input" placeholder="Height (px)">`,
            html: `
              <input id="swal-input1" class="swal2-input" placeholder="Width (px)" 
                type="number" min="1" step="1" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
              <input id="swal-input2" class="swal2-input" placeholder="Height (px)" 
                type="number" min="1" step="1" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
            `,
            focusConfirm: false,
            preConfirm: () => {
              const width = (document.getElementById('swal-input1') as HTMLInputElement).value;
              const height = (document.getElementById('swal-input2') as HTMLInputElement).value;
              if (!width || !height || isNaN(+width) || isNaN(+height) || Number(width) < 1 || Number(height) < 1) {
                Swal.showValidationMessage('Please enter numeric values.');
                return null;
              }
              return { width: +width, height: +height };
            }
          });

          if (formValues) {
            const range = this.quillInstance.getSelection(true);
            this.quillInstance.insertEmbed(range.index, 'image', e.target.result, 'user');

            setTimeout(() => {
              const imgElements = this.quillInstance.root.querySelectorAll('img');
              const lastImg = imgElements[imgElements.length - 1];
              if (lastImg) {
                lastImg.setAttribute('width', formValues.width + '');
                lastImg.setAttribute('height', formValues.height + '');
                lastImg.setAttribute('style', `width:${formValues.width}px; height:${formValues.height}px`);

                // Optional: update the model directly if needed
                this.questionBank.description = this.quillInstance.root.innerHTML;
              }
            }, 100);
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }

  customVideoHandler() {
    Swal.fire({
      title: 'Enter video URL',
      input: 'url',
      inputPlaceholder: 'https://www.youtube.com/embed/...',
      showCancelButton: true,
      preConfirm: (url) => {
        if (!url) {
          Swal.showValidationMessage('Please enter a valid URL');
        }
        return url;
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const url = result.value;

        const { value: formValues } = await Swal.fire({
          title: 'Set Video Size',
          // html:
          //   `<input id="swal-input1" class="swal2-input" placeholder="Width (px)">` +
          //   `<input id="swal-input2" class="swal2-input" placeholder="Height (px)">`,
          html: `
            <input id="swal-input1" class="swal2-input" placeholder="Width (px)" 
              type="number" min="1" step="1" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
            <input id="swal-input2" class="swal2-input" placeholder="Height (px)" 
              type="number" min="1" step="1" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
          `, 
          focusConfirm: false,
          preConfirm: () => {
            const width = (document.getElementById('swal-input1') as HTMLInputElement).value;
            const height = (document.getElementById('swal-input2') as HTMLInputElement).value;
            if (!width || !height || isNaN(+width) || isNaN(+height)) {
              Swal.showValidationMessage('Please enter numeric values.');
              return null;
            }
            return { width: +width, height: +height };
          }
        });

        if (formValues) {
          const range = this.quillInstance.getSelection(true);
          this.quillInstance.insertEmbed(range.index, 'video', url, 'user');

          setTimeout(() => {
            const videoElements = this.quillInstance.root.querySelectorAll('iframe, video');
            const lastVideo = videoElements[videoElements.length - 1]; // ✅ fixed here
            if (lastVideo) {
              lastVideo.style.width = formValues.width + 'px';
              lastVideo.style.height = formValues.height + 'px';
            }
          }, 100);
        }
      }
    });
  }

  Delete(id: number) {
    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('Question Bank') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.QuestionBankServ.Delete(id, this.DomainName).subscribe((D) => {
          this.GetAllData(this.CurrentPage, this.PageSize)
        })
      }
    });
  }

  GetAllSubject() {
    this.SubjectServ.Get(this.DomainName).subscribe((d) => {
      this.subjectsForCreate = d
    })
  }

  GetAllQuestionBankType() {
    this.QuestionBankTypeServ.Get(this.DomainName).subscribe((d) => {
      this.questionBankType = d
    })
  }

  GetAllLesson() {
    this.lesson = []
    this.LessonServ.GetBySubjectID(this.questionBank.subjectID, this.DomainName).subscribe((d) => {
      this.lesson = d
    })
  }

  onSubjectChange() {
    this.questionBank.lessonID = 0
    this.tag = []
    this.TagsSelected = []
    this.questionBank.deletedQuestionBankTagsDTO = []
    this.GetAllLesson()
  }

  GetAllBloomLevel() {
    this.BloomLevelServ.Get(this.DomainName).subscribe((d) => {
      this.bloomLevel = d
    })
  }
  GetAllDokLevel() {
    this.DokLevelServ.Get(this.DomainName).subscribe((d) => {
      this.dokLevel = d
    })
  }

  GetAllTag() {
    this.tag = []
    this.TagsSelected = []
    this.questionBank.deletedQuestionBankTagsDTO = []
    this.TagServ.GetByLessonId(this.questionBank.lessonID, this.DomainName).subscribe((d) => {
      this.tag = d
    })
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
    this.PageSize = this.TotalRecords
    this.CurrentPage = 1
    this.TotalPages = 1
    this.key = event.key;
    this.value = event.value;
    try {
      const data: any = await firstValueFrom(
        this.QuestionBankServ.Get(this.DomainName, this.CurrentPage, this.PageSize)
      );
      this.TableData = data.data || [];

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

  GetAllData(pageNumber: number, pageSize: number) {
    this.TableData = []
    this.CurrentPage = 1
    this.PageSize = 10
    this.TotalPages = 1
    this.TotalRecords = 0
    this.QuestionBankServ.GetBySubjectIdWithPaggination(this.SelectedSubjectId, this.DomainName, pageNumber, pageSize).subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage
        this.PageSize = data.pagination.pageSize
        this.TotalPages = data.pagination.totalPages
        this.TotalRecords = data.pagination.totalRecords
        this.TableData = data.data
      },
      (error) => {
        if (error.status == 404) {
          if (this.TotalRecords != 0) {
            let lastPage = this.TotalRecords / this.PageSize
            if (lastPage >= 1) {
              if (this.isDeleting) {
                this.CurrentPage = Math.floor(lastPage)
                this.isDeleting = false
              } else {
                this.CurrentPage = Math.ceil(lastPage)
              }
              this.GetAllData(this.CurrentPage, this.PageSize)
            }
          }
        }
      }
    )
  }

  changeCurrentPage(currentPage: number) {
    this.CurrentPage = currentPage
    this.GetAllData(this.CurrentPage, this.PageSize)
  }

  validatePageSize(event: any) {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
    }
  }

  validatePageNumber(event: any): void {
    const value = event.target.value;
    this.PageSize = 0
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

  CreateOREdit() {
    this.questionBank.questionBankTagsDTO = this.TagsSelected.map(s => s.id)
    if (this.isFormValid()) {
      this.isLoading = true;
      if (this.mode == 'Create') {
        this.QuestionBankServ.Add(
          this.questionBank,
          this.DomainName
        ).subscribe(
          (d) => {
            this.GetAllData(this.CurrentPage, this.PageSize)
            this.isLoading = false;
            this.closeModal();
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
        if (this.questionBank.questionTypeID == 5) {
          this.questionBank.newQuestionBankOptionsDTO = this.questionBank.questionBankOptionsDTO.filter(s => s.id == 0)
        }
        if (this.questionBank.questionTypeID == 4) {
          this.questionBank.newSubBankQuestionsDTO = this.questionBank.subBankQuestionsDTO.filter(s => s.id == 0)
        }
        this.QuestionBankServ.Edit(
          this.questionBank,
          this.DomainName
        ).subscribe(
          (d) => {
            this.GetAllData(this.CurrentPage, this.PageSize)
            this.isLoading = false;
            this.closeModal();
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
    }
  }

  capitalizeField(field: keyof QuestionBank): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.questionBank) {
      if (this.questionBank.hasOwnProperty(key)) {
        const field = key as keyof QuestionBank;
        if (!this.questionBank[field]) {
          if (
            field == 'gradeID' ||
            field == 'schoolID' ||
            field == 'subjectID' ||
            field == 'lessonID' ||
            field == 'questionTypeID'
          ) {
            const displayName = this.getFieldDisplayName(field);
            this.validationErrors[field] = this.getRequiredErrorMessage(displayName);
            isValid = false;
          }
        } else {
          this.validationErrors[field] = '';
        }
      }
    }
    if (this.questionBank.questionTypeID == 1 || this.questionBank.questionTypeID == 2 || this.questionBank.questionTypeID == 3) { // MCQ , TF
      const options = this.questionBank.questionBankOptionsDTO || [];

      if (options.length === 0) {
        this.validationErrors['questionBankOptionsDTO'] = 'Options are required';
        isValid = false;
        return isValid;
      } else {
        // Check for empty option values
        const anyEmpty = options.some(o => !o.option || o.option.trim() === '');
        if (anyEmpty) {
          this.validationErrors['questionBankOptionsDTO'] = 'All options must have non-empty values.';
          isValid = false;
        }

        // Check for duplicate options
        const normalizedOptions = options
          .map(o => o.option?.trim().toLowerCase())
          .filter(o => !!o); // filter out undefined/null

        const hasDuplicates = normalizedOptions.length !== new Set(normalizedOptions).size;
        if (hasDuplicates) {
          this.validationErrors['questionBankOptionsDTO'] = 'All options must be unique.';
          isValid = false;
        }
      }
      // Correct answer check
      if (this.questionBank.questionTypeID == 1 || this.questionBank.questionTypeID == 2) {
        if (!this.questionBank.correctAnswerName || this.questionBank.correctAnswerName.trim() === '') {
          this.validationErrors['correctAnswerName'] = 'Choose correct answer';
          isValid = false;
        } else {
          const normalizedCorrect = this.questionBank.correctAnswerName.trim().toLowerCase();
          const normalizedOptions = options.map(o => o.option?.trim().toLowerCase());
          const exists = normalizedOptions.includes(normalizedCorrect);

          if (!exists) {
            this.validationErrors['correctAnswerName'] = 'Correct answer must match one of the options.';
            isValid = false;
          }
        }
      }
    }
    if (this.questionBank.questionTypeID == 3) { // MCQ , TF
      if (this.questionBank.questionBankOptionsDTO.length == 0) {
        this.validationErrors['questionBankOptionsDTO'] = 'Options Is Required';
        isValid = false;
        return isValid;
      }
    }
    if (this.questionBank.questionTypeID == 4) { // Drag & Drop
      const subQuestions = this.questionBank.subBankQuestionsDTO;

      if (!subQuestions || subQuestions.length === 0) {
        this.validationErrors['subBankQuestionsDTO'] = 'Questions are required';
        isValid = false;
      } else {
        // 1. Check if any question or answer is empty
        const anyEmpty = subQuestions.some(q =>
          !q.description?.trim() || !q.answer?.trim()
        );

        if (anyEmpty) {
          this.validationErrors['subBankQuestionsDTO'] = 'Please fill in both the question and answer for all rows';
          isValid = false;
        }

        // 2. Check for duplicate descriptions (case-insensitive)
        const normalizedDescriptions = subQuestions.map(q => q.description?.trim().toLowerCase());
        const hasDuplicateDescriptions = normalizedDescriptions.length !== new Set(normalizedDescriptions).size;

        if (hasDuplicateDescriptions) {
          this.validationErrors['subBankQuestionsDTO'] = 'Each question must have a unique description';
          isValid = false;
        }
      }
    }
    if (this.questionBank.questionTypeID == 5) { // Order - Sequencing
      const options = this.questionBank.questionBankOptionsDTO;

      if (!options || options.length === 0) {
        this.validationErrors['questionBankOptionsDTO'] = 'Options are required.';
        isValid = false;
      } else {
        // Check all options have non-empty 'option' and 'order'
        const anyInvalid = options.some(opt =>
          !opt.option?.trim() || opt.order == null || opt.order.toString().trim() === ''
        );

        if (anyInvalid) {
          this.validationErrors['questionBankOptionsDTO'] = 'Each option must have both an option text and an order.';
          isValid = false;
        }

        // Check all order values are unique
        const orderValues = options.map(opt => opt.order?.toString().trim()).filter(order => order !== '');
        const uniqueOrders = new Set(orderValues);

        if (orderValues.length !== uniqueOrders.size) {
          this.validationErrors['questionBankOptionsDTO'] = 'Order numbers must be unique for each option.';
          isValid = false;
        }
      }
    }
    return isValid;
  }

  private getFieldDisplayName(field: keyof QuestionBank): string {
    const map: { [key in keyof QuestionBank]?: string } = {
      gradeID: 'Grade',
      schoolID: 'School',
      subjectID: 'Subject',
      lessonID: 'Lesson',
      questionTypeID: 'Question Type'
    };
    return map[field] ?? this.capitalizeField(field);
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

  onInputValueChange(event: { field: keyof QuestionBank; value: any }) {
    const { field, value } = event;
    if (
      field == 'lessonID' ||
      field == 'gradeID' ||
      field == 'schoolID' ||
      field == 'subjectID' ||
      field == 'description' ||
      field == 'questionTypeID' ||
      field == 'difficultyLevel'
    ) {
      (this.questionBank as any)[field] = value;
      if (value) {
        this.validationErrors[field] = '';
      }
    }
    if (field == "questionBankOptionsDTO") {
      this.validationErrors['questionBankOptionsDTO'] = '';
    }
    if (field == "subBankQuestionsDTO") {
      this.validationErrors['subBankQuestionsDTO'] = '';
    }
  }

  Edit(row: QuestionBank) {
    this.mode = 'Edit';
    this.TagsSelected = [];

    this.QuestionBankServ.GetById(row.id, this.DomainName).subscribe((d) => {
      this.questionBank = d;
      this.GetAllLesson();
      if (this.questionBank.questionTypeID == 1) {
        this.questionBank.questionBankOptionsDTO = []
        var opt = new QuestionBankOption()
        opt.questionBankID = 0
        opt.option = "True"
        opt.questionBankID = 0
        this.questionBank.questionBankOptionsDTO.push(opt);
        var opt = new QuestionBankOption()
        opt.questionBankID = 0
        opt.option = "False"
        opt.questionBankID = 0
        this.questionBank.questionBankOptionsDTO.push(opt);
      }
      this.schoolsForCreate = []
      this.SchoolServ.Get(this.DomainName).subscribe((d) => {
        this.schoolsForCreate = d
        this.GradesForCreate = []
        this.GradeServ.GetBySchoolId(this.questionBank.schoolID, this.DomainName).subscribe((d) => {
          this.GradesForCreate = d
          this.subjectsForCreate = []
          this.SubjectServ.GetByGradeId(this.questionBank.gradeID, this.DomainName).subscribe((d) => {
            this.subjectsForCreate = d
          })
        })
      })
      this.TagsSelected = this.tag.filter(s => this.questionBank.questionBankTagsDTO.includes(s.id));
    });

    this.openModal();
  }


  Create() {
    this.mode = 'Create';
    this.questionBank = new QuestionBank();
    this.validationErrors = {};
    this.TagsSelected = []
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schoolsForCreate = d
    })
    this.openModal();
  }

  getAllGradesForCreateBySchoolId() {
    this.lesson = []
    this.GradesForCreate = []
    this.questionBank.gradeID = 0
    this.subjectsForCreate = []
    this.questionBank.subjectID = 0
    this.questionBank.lessonID = 0
    this.tag = []
    this.TagsSelected = []
    this.questionBank.deletedQuestionBankTagsDTO = []
    this.GradeServ.GetBySchoolId(this.questionBank.schoolID, this.DomainName).subscribe((d) => {
      this.GradesForCreate = d
    })
  }

  getAllSubjectForCreateByGradeId() {
    this.lesson = []
    this.subjectsForCreate = []
    this.questionBank.lessonID = 0
    this.questionBank.subjectID = 0
    this.tag = []
    this.TagsSelected = []
    this.questionBank.deletedQuestionBankTagsDTO = []
    this.SubjectServ.GetByGradeId(this.questionBank.gradeID, this.DomainName).subscribe((d) => {
      this.subjectsForCreate = d
    })
  }

  closeModal() {
    this.questionBank = new QuestionBank()
    this.isModalVisible = false;
  }

  openModal() {
    this.validationErrors = {};
    this.isModalVisible = true;
  }

  onImageFileSelected(event: any) {
    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;

    this.questionBank.image = ""
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        this.validationErrors['imageForm'] = 'The file size exceeds the maximum limit of 25 MB.';
        this.questionBank.imageForm = null;
        return;
      }
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        this.questionBank.imageForm = file;
        this.validationErrors['imageForm'] = '';

        const reader = new FileReader();
        reader.readAsDataURL(file);
      } else {
        this.validationErrors['imageForm'] = 'Invalid file type. Only JPEG, JPG and PNG are allowed.';
        this.questionBank.imageForm = null;
        return;
      }
    }
    input.value = '';
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.dropdownRef?.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.dropdownOpen = false;
    }
  }

  selectType(Type: Tag): void {
    if (!this.TagsSelected.some((e) => e.id === Type.id)) {
      this.TagsSelected.push(Type);
    }
    if (this.mode == "Edit") {
      if (!Array.isArray(this.questionBank.newQuestionBankTagsDTO)) {
        this.questionBank.newQuestionBankTagsDTO = [];
      }
      this.questionBank.newQuestionBankTagsDTO.push(Type.id);
    }
    this.dropdownOpen = false;
  }

  removeSelected(id: number): void {
    const index = this.TagsSelected.findIndex(tag => tag.id === id);
    if (index === -1) return; // Tag not found
    const removed = this.TagsSelected.splice(index, 1)[0];
    if (this.mode === 'Edit' && removed?.id !== 0) {
      this.questionBank.deletedQuestionBankTagsDTO = this.questionBank.deletedQuestionBankTagsDTO || [];
      this.questionBank.deletedQuestionBankTagsDTO.push(removed.id);
    }
  }

  CorrectAnswer(option: string) {
    this.questionBank.correctAnswerName = option;
    this.validationErrors['correctAnswerName'] = '';
  }

  AddOption() {
    if (!Array.isArray(this.questionBank.questionBankOptionsDTO)) {
      console.warn("questionBankOptionsDTO was invalid, initializing to []");
      this.questionBank.questionBankOptionsDTO = [];
    } else {
      if (this.NewOption != "") {
        const exist = this.questionBank.questionBankOptionsDTO.find(s => s.option == this.NewOption)
        if (exist) {
          this.validationErrors['questionBankOptionsDTO'] = 'This Option already exist';
        } else {
          var opt = new QuestionBankOption()
          opt.questionBankID = 0
          opt.option = this.NewOption
          this.questionBank.questionBankOptionsDTO.push(opt);
          this.NewOption = '';
          if (this.mode == "Edit") {
            if (!Array.isArray(this.questionBank.newQuestionBankOptionsDTO)) {
              this.questionBank.newQuestionBankOptionsDTO = [];
            }
            this.questionBank.newQuestionBankOptionsDTO.push(opt);
          }
        }
      }
      // else {
      //   this.validationErrors['questionBankOptionsDTO'] = 'This Option is required';
      // }
    }

  }

  onOptionEdit(editedOption: any): void {
    if (!this.questionBank.editedQuestionBankOptionsDTO) {
      this.questionBank.editedQuestionBankOptionsDTO = [];
    }

    if (this.mode == "Edit" && editedOption.id != 0) {
      const exists = this.questionBank.editedQuestionBankOptionsDTO.find(
        (opt: any) => opt.id === editedOption.id
      );

      if (exists) {
        // Update existing entry
        exists.option = editedOption.option;
        exists.order = editedOption.order; // if you also have `order`
      } else {
        // Add new edited entry
        this.questionBank.editedQuestionBankOptionsDTO.push({
          id: editedOption.id,
          option: editedOption.option,
          order: editedOption.order,
          questionBankID: editedOption.questionBankID,
        });
      }
    }
  }

  onsubQuestionEdit(editedsubQuestion: any): void {
    if (!this.questionBank.editedSubBankQuestionsDTO) {
      this.questionBank.editedSubBankQuestionsDTO = [];
    }

    if (this.mode == "Edit" && editedsubQuestion.id != 0) {
      const exists = this.questionBank.editedSubBankQuestionsDTO.find(
        (opt: any) => opt.id === editedsubQuestion.id
      );

      if (exists) {
        // Update existing entry
        exists.answer = editedsubQuestion.answer;
        exists.description = editedsubQuestion.description; // if you also have `order`
      } else {
        // Add new edited entry
        this.questionBank.editedSubBankQuestionsDTO.push({
          id: editedsubQuestion.id,
          description: editedsubQuestion.description,
          answer: editedsubQuestion.answer,
          questionBankID: editedsubQuestion.questionBankID,
        });
      }
    }
  }

  checkOnType() {
    this.questionBank.correctAnswerName = ""
    this.questionBank.questionBankOptionsDTO = [];
    this.questionBank.subBankQuestionsDTO = [];
    if (this.questionBank.questionTypeID == 1) {
      var opt = new QuestionBankOption()
      opt.questionBankID = 0
      opt.option = "True"
      opt.questionBankID = 0
      this.questionBank.questionBankOptionsDTO.push(opt);
      var opt = new QuestionBankOption()
      opt.questionBankID = 0
      opt.option = "False"
      opt.questionBankID = 0
      this.questionBank.questionBankOptionsDTO.push(opt);
    }
  }

  addSubQuestion(): void {
    const last = this.questionBank.subBankQuestionsDTO[this.questionBank.subBankQuestionsDTO.length - 1];

    if (this.questionBank.subBankQuestionsDTO.length > 0) {
      if (!last || (!last.description?.trim() || !last.answer?.trim())) {
        // You can show a validation message here if needed
        this.validationErrors['subBankQuestionsDTO'] = 'Please fill in both the question and answer before adding a new one.';
        return;
      }
    }

    this.questionBank.subBankQuestionsDTO.push(new SubBankQuestion());
    if (this.mode == "Edit") {
      this.questionBank.newSubBankQuestionsDTO.push(new SubBankQuestion());
    }
  }

  addOptionOrder(): void {
    const options = this.questionBank.questionBankOptionsDTO;
    const last = options[options.length - 1];

    if (this.questionBank.questionBankOptionsDTO.length > 0) {
      if (!last || !last.option?.trim() || !last.order?.toString().trim()) {
        this.validationErrors['questionBankOptionsDTO'] = 'Please fill in both the option and order before adding a new one.';
        return;
      }
    }
    const orderValues = options.map(opt => opt.order);
    const orderSet = new Set(orderValues);
    if (orderValues.length !== orderSet.size) {
      this.validationErrors['questionBankOptionsDTO'] = 'Order numbers must be unique for each option.';
      return;
    }
    options.push(new QuestionBankOption());
  }

  validateNumber(event: any, field: keyof QuestionBank): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.questionBank[field] === 'string') {
        this.questionBank[field] = '' as never;
      }
    }
  }

  validateQuestionBankOptionNumber(event: any, field: keyof QuestionBankOption, option: QuestionBankOption): void {
    const value = event.target.value;
    const existedOption = this.questionBank.questionBankOptionsDTO.find(s => s === option);
    if (existedOption)
      if (isNaN(value) || value === '') {
        event.target.value = '';
        if (typeof existedOption[field] === 'string') {
          existedOption[field] = '' as never;
        }
      }
  }

  deleteOption(index: number): void {
    const removed = this.questionBank.questionBankOptionsDTO.splice(index, 1)[0];
    if (!Array.isArray(this.questionBank.deletedQuestionBankOptionsDTO)) {
      this.questionBank.deletedQuestionBankOptionsDTO = [];
    }
    if (this.mode === 'Edit' && removed?.id != 0) {
      // Mark as deleted for API if it was already saved
      this.questionBank.deletedQuestionBankOptionsDTO.push(removed.id);
    }
  }

  deleteSubQuestion(index: number): void {
    const removed = this.questionBank.subBankQuestionsDTO.splice(index, 1)[0];
    if (!Array.isArray(this.questionBank.deletedSubBankQuestionsDTO)) {
      this.questionBank.deletedSubBankQuestionsDTO = [];
    }
    if (this.mode === 'Edit' && removed?.id != 0) {
      this.questionBank.deletedSubBankQuestionsDTO.push(removed.id);
    }
  }
}