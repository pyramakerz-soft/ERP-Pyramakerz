import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AssignmentStudent } from '../../../../Models/LMS/assignment-student';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { AssignmentStudentService } from '../../../../Services/Employee/LMS/assignment-student.service';
import { AssignmentService } from '../../../../Services/Employee/LMS/assignment.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { Assignment } from '../../../../Models/LMS/assignment';
import { AssignmentStudentQuestion } from '../../../../Models/LMS/assignment-student-question';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { SubBankQuestion } from '../../../../Models/LMS/sub-bank-question';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';

@Component({
  selector: 'app-assignment-student',
  standalone: true,
  imports: [FormsModule, CommonModule, DragDropModule, TranslateModule],
  templateUrl: './assignment-student.component.html',
  styleUrl: './assignment-student.component.css'
})
export class AssignmentStudentComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  TableData: AssignmentStudent[] = [];

  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  CurrentPage: number = 1
  PageSize: number = 10
  TotalPages: number = 1
  TotalRecords: number = 0
  isDeleting: boolean = false;
  AssignmentId: number = 0;
  ClassId: number = 0;
  IsShowTabls: boolean = false
  assignment: Assignment = new Assignment()
  assignmentStudent: AssignmentStudent = new AssignmentStudent()
  isLoading: boolean = false
  validationErrors: { [key in keyof AssignmentStudent]?: string } = {};
  questionValidationErrors: { [index: number]: string } = {};
  emptyStringList: string[] = [];

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private languageService: LanguageService,
    public BusTypeServ: BusTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public assignmentStudentServ: AssignmentStudentService,
    public assignmentServ: AssignmentService
  ) { }
  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });
    this.AssignmentId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.GetAssignment()
        this.subscription = this.languageService.language$.subscribe(direction => {
    this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  GetAssignment() {
    this.assignmentStudentServ.GetByAssignmentId(this.AssignmentId, this.DomainName).subscribe((d) => {
      this.assignment = d;
      this.assignmentStudent.assignmentID = this.AssignmentId;
      this.assignmentStudent.studentID = this.UserID;

      this.assignmentStudent.assignmentStudentQuestions = this.assignment.assignmentQuestions.map(q => {
        const question = q.questionBank;
        const subQuestions = question.subBankQuestionsDTO || [];

        const base: AssignmentStudentQuestion = {
          id: 0,
          mark: 0,
          questionMark: question.mark ?? 0,
          answer: '', // For True/False
          assignmentStudentID: 0,
          questionBankID: question.id,
          questionDesc: question.description || '',
          questionImage: question.image || '',
          questionTypeID: question.questionTypeID,
          questionTypeName: question.questionTypeName,
          answerOptionID: 0, // For MCQ
          questionBankOptions: JSON.parse(JSON.stringify(question.questionBankOptionsDTO || [])),
          subBankQuestion: [],
          assignmentStudentQuestionAnswerOption: this.generateAnswerOptions(question),
          answerPool: []
        };
        if (question.questionTypeID === 4) {
          const answers = subQuestions.map((sub: SubBankQuestion) => sub.answer);
          const shuffled = [...answers].sort(() => Math.random() - 0.5);
          base.answerPool = shuffled;
          base.subBankQuestion = subQuestions.map(sub => ({ ...sub, answer: '' }));
        }
        return base;
      });
    });
  }

  onDrop(list: any[], event: CdkDragDrop<any[]>) {
    moveItemInArray(list, event.previousIndex, event.currentIndex);

    // Recalculate order after drop
    list.forEach((item, index) => {
      item.order = index + 1; // or index if you start from 0
    });
  }

  generateAnswerOptions(question: any) {
    const type = question.questionTypeID;

    if (type === 5) {
      // Fill in the blank or Order – generate multiple answer fields (1 field per option, if known)
      return (question.questionBankOptionsDTO || []).map((opt: any, index: any) => ({
        id: 0,
        order: index,
        answer: opt.option,
        assignmentStudentQuestionID: 0,
        selectedOpionID: null,
        subBankQuestionID: null
      }));
    }

    if (type === 3) {
      // Fill in the blank or Order – generate multiple answer fields (1 field per option, if known)
      return (question.questionBankOptionsDTO || []).map((opt: any, index: any) => ({
        id: 0,
        order: index,
        answer: '',
        assignmentStudentQuestionID: 0,
        selectedOpionID: null,
        subBankQuestionID: null
      }));
    }

    if (type === 4) {
      // Drag & Drop – match sub-questions
      return (question.subBankQuestionsDTO || []).map((sub: SubBankQuestion) => ({
        id: 0,
        order: 0,
        answer: '',
        assignmentStudentQuestionID: null,
        selectedOpionID: null,
        subBankQuestionID: sub.id
      }));
    }

    // Default case for Essay, MCQ, True/False
    return [{
      id: 0,
      order: 0,
      answer: '',
      assignmentStudentQuestionID: 0,
      selectedOpionID: null,
      subBankQuestionID: null
    }];
  }

  moveToAssignment() {
    this.router.navigateByUrl(`Student/SubjectAssignment/${this.assignment.subjectID}`)
  }

  Submit() {
    if (!this.isFormValid()) return;
    this.isLoading = true;
    const isTextbook = this.assignment.assignmentTypeID === 1;
    const submitObservable = isTextbook
      ? this.assignmentStudentServ.AddWhenTextBookAssignment(this.assignmentStudent, this.DomainName)
      : this.assignmentStudentServ.Add(this.assignmentStudent, this.DomainName);

    submitObservable.subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Assignment submitted successfully.',
          confirmButtonColor: '#089B41',
        });
       this.router.navigateByUrl(`Student/SubjectAssignment/${this.assignment.subjectID}`)
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = typeof err === 'string' ? err : err?.error || '';

        if (errorMessage.includes("cut-off date") || errorMessage.includes("deadline has passed")) {
          Swal.fire({
            icon: 'error',
            title: 'Submission Blocked',
            text: 'You cannot submit this assignment. The cut-off date has passed.',
            confirmButtonText: 'Okay',
            customClass: { confirmButton: 'secondaryBg' },
          });
        } else if (errorMessage.includes("You have already submitted this assignment and cannot submit it again") ) {
          Swal.fire({
            icon: 'error',
            title: 'Submission Blocked',
            text: 'You have already submitted this assignment and cannot submit it again.',
            confirmButtonText: 'Okay',
            customClass: { confirmButton: 'secondaryBg' },
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: 'Something went wrong while submitting the assignment.',
            confirmButtonText: 'Close',
            customClass: { confirmButton: 'secondaryBg' },
          });
        }
      }
    });
  }

  onImageFileSelected(event: any) {
    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;

    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        this.validationErrors['file'] = 'The file size exceeds the maximum limit of 25 MB.';
        this.assignmentStudent.file = null;
        return;
      }
      const allowedTypes = [
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
      ];
      if (allowedTypes.includes(file.type)) {
        this.assignmentStudent.file = file;
        this.validationErrors['file'] = '';
        const reader = new FileReader();
        reader.readAsDataURL(file);
      } else {
        this.validationErrors['file'] = 'Invalid file type. Only Word (.doc, .docx) and PDF (.pdf) files are allowed.';
        this.assignmentStudent.file = null;
      }
    }
    input.value = '';
  }

  capitalizeField(field: keyof AssignmentStudent): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    this.validationErrors = {};
    this.questionValidationErrors = {};
    let isValid = true;

    if (this.assignment.assignmentTypeID === 1) {
      if (!this.assignmentStudent.file) {
        this.validationErrors['file'] = '*File is required';
        isValid = false;
      }
    } else {
      this.assignmentStudent.assignmentStudentQuestions.forEach((q, index) => {
        switch (q.questionTypeID) {
          case 1: // True/False
            if (!q.answer || q.answer.trim() === '') {
              this.questionValidationErrors[index] = 'Please answer this question.';
              isValid = false;
            }
            break;
          case 6: // Essay
            if (!q.answer || q.answer.trim() === '') {
              this.questionValidationErrors[index] = 'Please answer this question.';
              isValid = false;
            }
            break;

          case 2: // MCQ
            if (!q.answerOptionID) {
              this.questionValidationErrors[index] = 'Please select an option.';
              isValid = false;
            }
            break;

          case 3: // Fill in the Blank
            if (
              q.assignmentStudentQuestionAnswerOption?.some(
                (opt) => !opt.answer || opt.answer.trim() === ''
              )
            ) {
              this.questionValidationErrors[index] = 'Fill in all blanks.';
              isValid = false;
            }
            break;

          case 4: // Drag & Drop
            if (
              q.subBankQuestion?.some(
                (sub) => !sub.answer || sub.answer.trim() === ''
              )
            ) {
              this.questionValidationErrors[index] = 'Complete all matches.';
              isValid = false;
            }
            break;

          case 5: // Ordering
            if (
              q.assignmentStudentQuestionAnswerOption?.some(
                (opt) => !opt.answer || opt.answer.trim() === ''
              )
            ) {
              this.questionValidationErrors[index] = 'Order all items.';
              isValid = false;
            }
            break;
        }
      });
    }
    return isValid;
  }

  onInputValueChange(event: { field: keyof AssignmentStudent; value: any }) {
    const { field, value } = event;
    (this.assignmentStudent as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  onDropMatch(row: AssignmentStudentQuestion, sub: SubBankQuestion, event: CdkDragDrop<string[]>) {
    const droppedAnswer = event.item.data;
    if (!sub.answer && row.answerPool.includes(droppedAnswer)) {
      sub.answer = droppedAnswer;
      const answerOption = row.assignmentStudentQuestionAnswerOption.find(opt => opt.subBankQuestionID === sub.id);
      if (answerOption) {
        answerOption.answer = droppedAnswer;
      }
      const index = row.answerPool.indexOf(droppedAnswer);
      if (index > -1) {
        row.answerPool.splice(index, 1);
      }
    }
  }

  removeAnswer(row: AssignmentStudentQuestion, sub: SubBankQuestion) {
    if (sub.answer) {
      row.answerPool.push(sub.answer);
      sub.answer = '';
    }
  }

  get subDropIds(): string[] {
    return this.assignmentStudent.assignmentStudentQuestions
      .flatMap(q => q.subBankQuestion.map((_, i) => `subDrop_${i}`));
  }
}
