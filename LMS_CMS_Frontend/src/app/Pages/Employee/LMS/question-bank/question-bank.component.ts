import { Component, ElementRef, ViewChild } from '@angular/core';
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
import { QuillModule } from 'ngx-quill';
import { FormsModule } from '@angular/forms';
import { QuestionBankOption } from '../../../../Models/LMS/question-bank-option';

@Component({
  selector: 'app-question-bank',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, QuillModule],
  templateUrl: './question-bank.component.html',
  styleUrl: './question-bank.component.css'
})
export class QuestionBankComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: QuestionBank[] = [];
  Data: QuestionBank[] = [];
  subject: Subject[] = [];
  lesson: Lesson[] = [];
  tag: Tag[] = [];
  bloomLevel: BloomLevel[] = [];
  dokLevel: DokLevel[] = [];
  questionBankType: QuestionBankType[] = [];

  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'docNumber', 'employeeName', 'studentName'];

  CurrentPage: number = 1
  PageSize: number = 10
  TotalPages: number = 1
  TotalRecords: number = 0
  isDeleting: boolean = false;
  validationErrors: { [key in keyof QuestionBank]?: string } = {};
  isLoading = false;
  questionBank: QuestionBank = new QuestionBank()
  NewOption: string = ""
  SelectedSubjectId: number = 0
  TagsSelected: Tag[] = [];
  dropdownOpen = false;
  @ViewChild('quillEditor') quillEditor!: ElementRef;
  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };
  constructor(
    private router: Router,
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
    public BloomLevelServ: BloomLevelService,
    public DokLevelServ: DokLevelService,
    public QuestionBankTypeServ: QuestionBankTypeService,
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

    this.GetAllData(this.CurrentPage, this.PageSize)
    this.GetAllDokLevel()
    this.GetAllQuestionBankType()
    this.GetAllBloomLevel()
    this.GetAllSubject()
    this.GetAllTag()
  }

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this Question Bank?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF7519',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // this.QuestionBankServ.Delete(id,this.DomainName).subscribe((D)=>{
        //   this.GetAllData(this.CurrentPage, this.PageSize)
        // })
      }
    });
  }

  GetAllSubject() {
    this.SubjectServ.Get(this.DomainName).subscribe((d) => {
      this.subject = d
    })
  }

  GetAllQuestionBankType() {
    this.QuestionBankTypeServ.Get(this.DomainName).subscribe((d) => {
      this.questionBankType = d
      console.log(this.questionBankType)
    })
  }

  GetAllLesson() {
    this.LessonServ.GetBySubjectID(this.SelectedSubjectId, this.DomainName).subscribe((d) => {
      this.lesson = d
    })
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
    this.TagServ.Get(this.DomainName).subscribe((d) => {
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
    this.QuestionBankServ.Get(this.DomainName, pageNumber, pageSize).subscribe(
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

  validateNumber(event: any): void {
    const value = event.target.value;
    this.PageSize = 0
  }

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true;
      if (this.mode == 'Create') {
        // this.medalServ.Add(
        //   this.medal,
        //   this.DomainName
        // ).subscribe(
        //   (d) => {
        //     this.GetAllData();
        //     this.isLoading = false;
        //     this.closeModal();
        //   },
        //   (error) => {
        //     this.isLoading = false; // Hide spinner
        //     Swal.fire({
        //       icon: 'error',
        //       title: 'Oops...',
        //       text: 'Try Again Later!',
        //       confirmButtonText: 'Okay',
        //       customClass: { confirmButton: 'secondaryBg' }
        //     });
        //   }
        // );
      }
      if (this.mode == 'Edit') {
        // this.medalServ.Edit(
        //   this.medal,
        //   this.DomainName
        // ).subscribe(
        //   (d) => {
        //     this.GetAllData();
        //     this.isLoading = false;
        //     this.closeModal();
        //   },
        //   (error) => {
        //     this.isLoading = false; // Hide spinner
        //     Swal.fire({
        //       icon: 'error',
        //       title: 'Oops...',
        //       text: 'Try Again Later!',
        //       confirmButtonText: 'Okay',
        //       customClass: { confirmButton: 'secondaryBg' }
        //     });
        //   }
        // );
      }
    }
    this.GetAllData(this.CurrentPage, this.PageSize)
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
            field == 'lessonID' ||
            field == 'bloomLevelID' ||
            field == 'dokLevelID' ||
            field == 'questionTypeID' ||
            field == 'difficultyLevel'
          ) {
            this.validationErrors[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        } else {
          this.validationErrors[field] = '';
        }
      }
    }
    return isValid;
  }

  onInputValueChange(event: { field: keyof QuestionBank; value: any }) {
    const { field, value } = event;
    if (
      field == 'lessonID' ||
      field == 'bloomLevelID' ||
      field == 'dokLevelID' ||
      field == 'questionTypeID' ||
      field == 'difficultyLevel'
    ) {
      (this.questionBank as any)[field] = value;
      if (value) {
        this.validationErrors[field] = '';
      }
    }
  }

  Edit(row: QuestionBank) {
    this.mode = 'Edit';
    this.QuestionBankServ.GetById(row.id, this.DomainName).subscribe((d) => {
      this.questionBank = d;
    });
    this.openModal();
  }

  Create() {
    this.mode = 'Create';
    this.questionBank = new QuestionBank();
    this.validationErrors = {};
    this.openModal();
  }

  closeModal() {
    this.isModalVisible = false;
  }

  openModal() {
    this.validationErrors = {};
    this.isModalVisible = true;
  }

  onImageFileSelected(event: any) {
    const file: File = event.target.files[0];
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
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectType(Type: Tag): void {
    if (!this.TagsSelected.some((e) => e.id === Type.id)) {
      this.TagsSelected.push(Type);
    }
    this.dropdownOpen = false;
  }

  removeSelected(id: number): void {
    this.TagsSelected = this.TagsSelected.filter((e) => e.id !== id);
  }

  CorrectAnswer(option: string) {
    this.questionBank.correctAnswerName = option;
    this.validationErrors['correctAnswerName'] = '';
  }

  AddOption() {
    if (this.NewOption != "") {
      var opt = new QuestionBankOption()
      opt.questionBankID = 0
      opt.option = this.NewOption
      opt.questionBankID = 0
      this.questionBank.questionBankOptionsDTO.push(opt);
      this.NewOption = '';
    }
  }

  checkOnType() {
    console.log(this.questionBank.questionTypeID)
    this.questionBank.correctAnswerName = ""
    this.questionBank.questionBankOptionsDTO = [];
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

}
