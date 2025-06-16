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

@Component({
  selector: 'app-assignment-edit',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent],
  templateUrl: './assignment-edit.component.html',
  styleUrls: ['./assignment-edit.component.css']
})
export class AssignmentEditComponent {
  assignment: Assignment = new Assignment()
  assignmentQuestion: AssignmentQuestionAdd = new AssignmentQuestionAdd()
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

  AssignmentId: number = 0
  keysArray: string[] = ['id', 'name', 'dateFrom', 'dateTo', 'academicYearName'];
  key: string = "id";
  value: any = "";
  SelectedLessonID: number = 0
  SelectedTypeID: number = 0
  SelectedTagsIDs: number[] = []
  Lessons: Lesson[] = []
  tags: Tag[] = []
  selectedTagsIds: number[] = []; // Array to store selected type IDs
  dropdownOpen = false;
  tagsSelected: Tag[] = [];
  NumberOfQuestions: QuestionAssignmentTypeCount[] = []
  QuestionBankType: QuestionBankType[] = []
  IsTableShown: boolean = true;
  IsQuestionsSelected: boolean = false;
  selectedQuestions: number[] = [];
  CurrentPage: number = 1
  PageSize: number = 10
  TotalPages: number = 1
  TotalRecords: number = 0
  Questions: QuestionBank[] = [];

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public router: Router,
    public AssigmentQuestionServ: AssignmentQuestionService,
    public LessonServ: LessonService,
    public tagServ: TagsService,
    public QuestionBankServ: QuestionBankService,
    public QuestionBankTypeServ: QuestionBankTypeService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });
    this.AssignmentId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.getAssignmentData()
    this.getLessons()
    this.getTypes()
  }

  getAssignmentData() {
    this.AssigmentQuestionServ.GetById(this.AssignmentId, this.DomainName).subscribe((d) => {
      this.assignment = d
      console.log(d, this.assignment)
    })
  }

  getLessons() {
    this.LessonServ.Get(this.DomainName).subscribe((d) => [
      this.Lessons = d
    ])
  }

  getTags() {
    this.tags = []
    this.tagsSelected = []
    this.SelectedTagsIDs = []
    this.Questions = []
    this.tagServ.GetByLessonId(this.SelectedLessonID, this.DomainName).subscribe((d) => [
      this.tags = d
    ])
  }

  getTypes() {
    this.QuestionBankTypeServ.Get(this.DomainName).subscribe((d) => {
      this.QuestionBankType = d
    })
  }

  GetQuestionBank(pageNumber: number, pageSize: number): void {
    this.selectedTagsIds = this.tagsSelected.map(s => s.id);
    if (this.SelectedLessonID && this.SelectedTypeID) {
      console.log(21)
      this.Questions = []
      this.QuestionBankServ.GetByTags(this.SelectedLessonID, this.SelectedTypeID, this.selectedTagsIds, this.DomainName, pageNumber, pageSize).subscribe({
        next: (data) => {
          console.log('✅ Full response from backend:', data);
          this.PageSize = data.pagination.pageSize
          this.TotalPages = data.pagination.totalPages
          this.TotalRecords = data.pagination.totalRecords
          this.Questions = data.data
          console.log("d",data,this.Questions)
        },
        error: (err) => {
          console.error('❌ Error loading questions:', err);
        }
      });
    } else {
      console.warn('⚠️ SelectedLessonID and SelectedTypeID must be set before calling GetQuestionBank.');
    }
  }

  changeCurrentPage(currentPage: number) {
    this.CurrentPage = currentPage
    this.GetQuestionBank(this.CurrentPage, this.PageSize)

    this.IsQuestionsSelected = false
    this.selectedQuestions = []
  }

  validateNumber(event: any): void {
    const value = event.target.value;
    this.PageSize = 0
  }

  validatePageSize(event: any) {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
    }
  }

  toggleSelection(QuestionId: number, isChecked?: boolean) {
    if (isChecked) {
      if (!this.selectedQuestions.includes(QuestionId)) {
        this.selectedQuestions.push(QuestionId);
      }
    } else {
      this.selectedQuestions = this.selectedQuestions.filter(id => id !== QuestionId);
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
    return this.Questions.length > 0 && this.selectedQuestions.length === this.Questions.length;
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedQuestions = this.Questions.map(s => s.id);
    } else {
      this.selectedQuestions = [];
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
    this.GetQuestionBank(this.CurrentPage, this.PageSize)
  }


  removeSelected(id: number): void {
    this.tagsSelected = this.tagsSelected.filter((e) => e.id !== id);
    this.SelectedTagsIDs =this.SelectedTagsIDs.filter((e) => e!== id);
    this.GetQuestionBank(this.CurrentPage, this.PageSize)
  }

  goBack() {
    this.router.navigateByUrl(`Employee/Assignment Details`);
  }

  openModal() {
    const modalId = `Add_Modal${this.assignment.assignmentTypeID}`;
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  closeModal() {
    const modalId = `Add_Modal${this.assignment.assignmentTypeID}`;
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("flex");
      modal.classList.add("hidden");
    }
  }

  async onSearchEvent(event: { key: string, value: any }) {
    // this.key = event.key;
    // this.value = event.value;
    // try {
    //   const data: Semester[] = await firstValueFrom(this.semesterService.GetByAcademicYearId(this.academicYearId, this.DomainName));
    //   this.semesterData = data || [];

    //   if (this.value !== "") {
    //     const numericValue = isNaN(Number(this.value)) ? this.value : parseInt(this.value, 10);

    //     this.semesterData = this.semesterData.filter(t => {
    //       const fieldValue = t[this.key as keyof typeof t];
    //       if (typeof fieldValue === 'string') {
    //         return fieldValue.toLowerCase().includes(this.value.toLowerCase());
    //       }
    //       if (typeof fieldValue === 'number') {
    //         return fieldValue.toString().includes(numericValue.toString())
    //       }
    //       return fieldValue == this.value;
    //     });
    //   }
    // } catch (error) {
    //   this.semesterData = [];
    // }
  }

  onImageFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      this.assignmentQuestion.file = file;
    }
  }

  Save(){
    this.assignmentQuestion.assignmentID=this.AssignmentId
    this.assignmentQuestion.questionIds=this.selectedQuestions
    console.log(this.AssignmentId ,this.assignmentQuestion.assignmentID)
    this.AssigmentQuestionServ.Add(this.assignmentQuestion, this.DomainName).subscribe((d)=>{
      console.log(d)
    })

  }
}