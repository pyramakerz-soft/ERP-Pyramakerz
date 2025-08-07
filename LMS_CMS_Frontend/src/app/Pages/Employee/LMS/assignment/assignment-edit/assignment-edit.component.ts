import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Assignment } from '../../../../../Models/LMS/assignment';
import { AssignmentQuestionService } from '../../../../../Services/Employee/LMS/assignment-question.service';
import { SearchComponent } from '../../../../../Component/search/search.component';
import { TokenData } from '../../../../../Models/token-data';
import { AccountService } from '../../../../../Services/account.service';
import { ApiService } from '../../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../../Services/shared/menu.service';
import { AssignmentQuestion } from '../../../../../Models/LMS/assignment-question';
import { AssignmentQuestionAdd } from '../../../../../Models/LMS/assignment-question-add';
import { LessonService } from '../../../../../Services/Employee/LMS/lesson.service';
import { Lesson } from '../../../../../Models/LMS/lesson';
import { TagsService } from '../../../../../Services/Employee/LMS/tags.service';
import { Tag } from '../../../../../Models/LMS/tag';
import { QuestionAssignmentTypeCount } from '../../../../../Models/LMS/question-assignment-type-count';
import { QuestionBankService } from '../../../../../Services/Employee/LMS/question-bank.service';
import { QuestionBankTypeService } from '../../../../../Services/Employee/LMS/question-bank-type.service';
import { QuestionBankType } from '../../../../../Models/LMS/question-bank-type';
import { QuestionBank } from '../../../../../Models/LMS/question-bank';
import Swal from 'sweetalert2';
import { AssignmentService } from '../../../../../Services/Employee/LMS/assignment.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-assignment-edit',
  standalone: true,
  imports: [FormsModule, CommonModule ,TranslateModule],
  templateUrl: './assignment-edit.component.html',
  styleUrls: ['./assignment-edit.component.css'],
})
export class AssignmentEditComponent {

  assignment: Assignment = new Assignment();
  assignmentQuestion: AssignmentQuestionAdd = new AssignmentQuestionAdd();
  DomainName: string = '';
  UserID: number = 0;
  path: string = '';
  User_Data_After_Login: TokenData = new TokenData(
    '',
    0,
    0,
    0,
    0,
    '',
    '',
    '',
    '',
    ''
  );

  AssignmentId: number = 0;
  keysArray: string[] = [
    'id',
    'name',
    'dateFrom',
    'dateTo',
    'academicYearName',
  ];
  key: string = 'id';
  value: any = '';
  SelectedLessonID: number = 0;
  SelectedTypeID: number = 0;
  SelectedTagsIDs: number[] = [];
  Lessons: Lesson[] = [];
  tags: Tag[] = [];
   isRtl: boolean = false;
    subscription!: Subscription;
  selectedTagsIds: number[] = []; // Array to store selected type IDs
  dropdownOpen = false;
  tagsSelected: Tag[] = [];
  questionTypeCounts: { [key: string]: number } = {};
  QuestionBankType: QuestionBankType[] = [];
  IsTableShown: boolean = true;
  IsQuestionsSelected: boolean = false;
  selectedQuestions: number[] = [];
  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;
  Questions: QuestionBank[] = [];
  isLoading = false;
  validationErrors: { [key: string]: string } = {};

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public router: Router,
    public AssigmentQuestionServ: AssignmentQuestionService,
    public assignmentService: AssignmentService,
    public LessonServ: LessonService,
    public tagServ: TagsService,
    public QuestionBankServ: QuestionBankService,
    public QuestionBankTypeServ: QuestionBankTypeService,
    private languageService: LanguageService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });
    this.AssignmentId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.getAssignmentData();
    this.getLessons();
    this.getTypes();
        this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  getAssignmentData() {
    this.AssigmentQuestionServ.GetById(
      this.AssignmentId,
      this.DomainName
    ).subscribe((d) => {
      this.assignment = d;  
    });
  }

  getLessons() {
    this.LessonServ.Get(this.DomainName).subscribe((d) => [(this.Lessons = d)]);
  }

  getTags() {
    this.tags = [];
    this.tagsSelected = [];
    this.SelectedTagsIDs = [];
    this.validationErrors['Lesson'] = ``;
    this.Questions = [];
    this.tagServ
      .GetByLessonId(this.SelectedLessonID, this.DomainName)
      .subscribe((d) => [(this.tags = d)]);
  }

  getTypes() {
    this.QuestionBankTypeServ.Get(this.DomainName).subscribe((d) => {
      this.QuestionBankType = d;
    });
  }

  GetQuestionBank(pageNumber: number, pageSize: number): void {
    this.selectedTagsIds = this.tagsSelected.map((s) => s.id);
    if (this.SelectedLessonID && this.SelectedTypeID) {
      console.log(21);
      this.Questions = [];
      this.QuestionBankServ.GetByTags(
        this.SelectedLessonID,
        this.SelectedTypeID,
        this.selectedTagsIds,
        this.DomainName,
        pageNumber,
        pageSize
      ).subscribe({
        next: (data) => {
          console.log('✅ Full response from backend:', data);
          this.PageSize = data.pagination.pageSize;
          this.TotalPages = data.pagination.totalPages;
          this.TotalRecords = data.pagination.totalRecords;
          this.Questions = data.data;
          console.log('d', data, this.Questions);
        },
        error: (err) => {
          console.error('❌ Error loading questions:', err);
        },
      });
    } else {
      console.warn(
        '⚠️ SelectedLessonID and SelectedTypeID must be set before calling GetQuestionBank.'
      );
    }
  }

  changeCurrentPage(currentPage: number) {
    this.CurrentPage = currentPage;
    this.GetQuestionBank(this.CurrentPage, this.PageSize);

    this.IsQuestionsSelected = false;
    this.selectedQuestions = [];
  }

  validateNumber(event: any): void {
    const value = event.target.value;
    this.PageSize = 0;
  }

  validatePageSize(event: any) {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
    }
  }

  toggleSelection(QuestionId: number, isChecked?: boolean) {
    this.validationErrors['questionIds'] = ``;
    const question = this.Questions.find((q) => q.id === QuestionId);
    if (!question) return;

    if (isChecked) {
      if (!this.selectedQuestions.includes(QuestionId)) {
        this.selectedQuestions.push(QuestionId);

        if (this.questionTypeCounts[question.questionTypeName]) {
          this.questionTypeCounts[question.questionTypeName]++;
        } else {
          this.questionTypeCounts[question.questionTypeName] = 1;
        }
      }
    } else {
      this.selectedQuestions = this.selectedQuestions.filter(
        (id) => id !== QuestionId
      );

      if (this.questionTypeCounts[question.questionTypeName]) {
        this.questionTypeCounts[question.questionTypeName]--;

        if (this.questionTypeCounts[question.questionTypeName] === 0) {
          delete this.questionTypeCounts[question.questionTypeName];
        }
      }
    }
    this.IsQuestionsSelected = this.selectedQuestions.length > 0;
  }

  onCheckboxChange(event: Event, QuestionId: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.toggleSelection(QuestionId, isChecked);
  }

  isSelected(QuestionId: number): boolean {
    return this.selectedQuestions.includes(QuestionId);
  }

  selectAll(): boolean {
    if (this.Questions.length === 0) return false;
    const currentTypeQuestionIds = this.Questions.map(q => q.id);
    return currentTypeQuestionIds.every(id => this.selectedQuestions.includes(id));
  }

  toggleSelectAll(event: Event): void {
    this.validationErrors['questionIds'] = ``;
    const isChecked = (event.target as HTMLInputElement).checked;
    const typeName = this.QuestionBankType.find(t => t.id == this.SelectedTypeID)?.name;
    console.log(typeName, this.QuestionBankType, this.SelectedTypeID)
    if (!typeName) return;

    const questionsOfCurrentType = this.Questions.map(q => q.id);

    if (isChecked) {
      for (const id of questionsOfCurrentType) {
        if (!this.selectedQuestions.includes(id)) {
          this.selectedQuestions.push(id);
        }
      }

      this.questionTypeCounts[typeName] =
        (this.questionTypeCounts[typeName] || 0) + questionsOfCurrentType.length;

    } else {
      this.selectedQuestions = this.selectedQuestions.filter(id => !questionsOfCurrentType.includes(id));
      delete this.questionTypeCounts[typeName];
    }

    this.IsQuestionsSelected = this.selectedQuestions.length > 0;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectType(Type: Tag): void {
    if (!this.tagsSelected.some((e) => e.id === Type.id)) {
      this.tagsSelected.push(Type);
    }
    if (!this.SelectedTagsIDs.some((e) => e === Type.id)) {
      this.SelectedTagsIDs.push(Type.id);
    }
    this.dropdownOpen = false;
    this.GetQuestionBank(this.CurrentPage, this.PageSize);
    this.validationErrors['tag'] = ``;
  }

  removeSelected(id: number): void {
    this.tagsSelected = this.tagsSelected.filter((e) => e.id !== id);
    this.SelectedTagsIDs = this.SelectedTagsIDs.filter((e) => e !== id);
    this.GetQuestionBank(this.CurrentPage, this.PageSize);
  }

  goBack() {
    this.router.navigateByUrl(`Employee/Assignment`);
  }

  openModal() {
    this.assignmentQuestion = new AssignmentQuestionAdd()
    this.SelectedLessonID = 0
    this.SelectedTypeID = 0
    this.selectedTagsIds = []
    this.tagsSelected = []
    this.Questions = []
    this.selectedQuestions = []
    this.questionTypeCounts = {};
    const modalId = `Add_Modal${this.assignment.assignmentTypeID}`;
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeModal() {
    const modalId = `Add_Modal${this.assignment.assignmentTypeID}`;
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('flex');
      modal.classList.add('hidden');
    }
    this.assignment.fileFile = null;
  }

  getFormattedQuestionTypes(): string {
    return Object.entries(this.questionTypeCounts)
      .map(([type, count]) => `${type}(${count})`)
      .join(' ');
  }


  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      const allowedExtensions = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedExtensions.includes(file.type)) {
        this.validationErrors['file'] = 'Only PDF or Word files are allowed.';
        this.assignment.fileFile = null;
        return; 
      }

      if (file.size > 25 * 1024 * 1024) {
        this.validationErrors['file'] = 'The file size exceeds the maximum limit of 25 MB.';
        this.assignment.fileFile = null;
        return; 
      }
      else{
        this.assignment.fileFile = file;
        this.validationErrors['file'] = ``;
        const reader = new FileReader();
        reader.readAsDataURL(file);
      }
    }

    event.target.value = '';
  } 
  
  addTypeBlock() {
    this.validationErrors['questionAssignmentTypeCountDTO'] = ``;
    this.assignmentQuestion.questionAssignmentTypeCountDTO.push({
      questionTypeId: 0,
      numberOfQuestion: 0,
    });
  }

  removeTypeBlock(index: number) {
    this.assignmentQuestion.questionAssignmentTypeCountDTO.splice(index, 1);
  }

  validateNumberQuestionAssignmentTypeCount(
    event: any,
    index: number,
    field: keyof QuestionAssignmentTypeCount
  ): void {
    const value = event.target.value;

    if (isNaN(value) || value === '') {
      event.target.value = '';

      // Optional: Reset the value in the model
      this.assignmentQuestion.questionAssignmentTypeCountDTO[index][field] =
        0 as never;
    } else {
      // Ensure it's stored as a number
      this.assignmentQuestion.questionAssignmentTypeCountDTO[index][field] =
        +value as never;
    }
  }

  Save() {
    this.assignmentQuestion.assignmentID = this.AssignmentId;
    this.assignmentQuestion.questionIds = this.selectedQuestions;
    this.assignmentQuestion.lessonId = this.SelectedLessonID;
    this.assignmentQuestion.selectedTagsIds = this.selectedTagsIds;
    if (this.isFormValid()) {
      this.isLoading = true; 
      this.AssigmentQuestionServ.Add(
        this.assignmentQuestion,
        this.DomainName
      ).subscribe({
        next: (d) => {
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Questions Added Successfully',
            confirmButtonColor: '#089B41',
          });
          this.closeModal();
          this.getAssignmentData();
        },
        error: (err) => {
          console.error('Error adding questions:', err);
          this.isLoading = false;
          this.closeModal();

          const errorMessage = err?.error || 'Something went wrong while adding questions.';
          if (errorMessage.includes("already exists in this assignment")) {
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: errorMessage, 
              confirmButtonColor: '#d33',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: "Something went wrong while adding questions",
              confirmButtonColor: '#d33',
            });
          }
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  SaveFile() { 
    if (this.isFormValid()) {
      this.isLoading = true; 
      this.assignmentService.FileAssignment(
        this.assignment,
        this.DomainName
      ).subscribe({
        next: (d) => { 
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Added Successfully',
            confirmButtonColor: '#089B41',
          });
          this.closeModal();
          this.getAssignmentData();
        },
        error: (err) => { 
          this.isLoading = false;
          this.closeModal();

          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: err.error,
            confirmButtonColor: '#d33',
          });
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  isFormValid(): boolean { 
    let isValid = true;
    if (this.assignment.assignmentTypeID == 1) {
      if (this.assignment.fileFile == null) {
        this.validationErrors['file'] = `Choose File First`;
        isValid = false;
      }
    } else if (this.assignment.assignmentTypeID != 1) {
      if (this.SelectedLessonID == 0) {
        this.validationErrors['Lesson'] = `Lesson Is Required`;
        isValid = false;
      }
    }
    if (this.assignment.assignmentTypeID == 2) {
      if (this.assignmentQuestion.questionIds.length == 0) {
        this.validationErrors['questionIds'] = 'You Should Select Questions';
        isValid = false;
      }
    }
    if (this.assignment.assignmentTypeID === 3) {
      if (this.assignmentQuestion.questionAssignmentTypeCountDTO.length === 0) {
        this.validationErrors['questionAssignmentTypeCountDTO'] = 'You Should Add At Least One Type';
        isValid = false;
      } else {
        this.assignmentQuestion.questionAssignmentTypeCountDTO.forEach((item, index) => {
          if (!item.questionTypeId || item.questionTypeId === 0) {
            this.validationErrors[`type-${index}`] = 'Select a Question Type';
            isValid = false;
          }
          if (!item.numberOfQuestion || item.numberOfQuestion <= 0) {
            this.validationErrors[`count-${index}`] = 'Enter a valid number > 0';
            isValid = false;
          }
        });
      }
    }
    return isValid;
  }

  capitalizeField(field: keyof AssignmentQuestionAdd): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: string; value: any }) {
    const { field, value } = event;
    console.log(field);
    this.validationErrors[field] = '';
  }

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this Question?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF7519',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.AssigmentQuestionServ.Delete(id, this.DomainName).subscribe({
          next: () => {
            this.getAssignmentData();
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Question has been deleted.',
              confirmButtonText: 'Okay'
            });
          },
          error: (error) => {
            console.error('Delete error details:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete Question',
              confirmButtonText: 'Okay'
            });
          }
        });
      }
    });
  }

  GoToAssignmentStudent() {
    this.router.navigateByUrl(`Employee/Assignment Student/${this.AssignmentId}`)
  }
}
