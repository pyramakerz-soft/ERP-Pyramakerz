import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Assignment } from '../../../../Models/LMS/assignment';
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
// import Swal from 'sweetalert2';
import { finalize } from 'rxjs';
import { SubBankQuestion } from '../../../../Models/LMS/sub-bank-question';
import { AssignmentStudentQuestion } from '../../../../Models/LMS/assignment-student-question';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './assignment-detail.component.html',
  styleUrl: './assignment-detail.component.css'
})

@InitLoader()
export class AssignmentDetailComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  TableData: AssignmentStudent[] = [];
  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';

  CurrentPage: number = 1
  PageSize: number = 10
  TotalPages: number = 1
  TotalRecords: number = 0
  isDeleting: boolean = false;
  AssignmentStudentId: number = 0;
  ClassId: number = 0;
  IsShowTabls: boolean = false
  assignmentStudent: AssignmentStudent = new AssignmentStudent()
  isLoading: boolean = false

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public BusTypeServ: BusTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public assignmentStudentServ: AssignmentStudentService,
    public assignmentServ: AssignmentService,
    private languageService: LanguageService, 
    private loadingService: LoadingService
  ) { }
  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });
    this.AssignmentStudentId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.GetAssignment()
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


  GetAssignment() {
    this.assignmentStudentServ.GetById(this.AssignmentStudentId, this.DomainName).subscribe((d) => {
      this.assignmentStudent = d
      for (let row of this.assignmentStudent.assignmentStudentQuestions) {
        this.autoCorrectMark(row);
      }
    })
  }

  moveToAssignment() {
    this.router.navigateByUrl(`Employee/Assignment Student/${this.assignmentStudent.assignmentID}`)
  }

  getAnswerForSubBankQuestion(row: AssignmentStudentQuestion, subBankQuestionID: number): string {
    const answerObj = row.assignmentStudentQuestionAnswerOption.find(
      (a: any) => a.subBankQuestionID === subBankQuestionID
    );
    return answerObj?.answer || '';
  }

  isAutoCorrectType(typeId: number): boolean {
    return typeId === 1 || typeId === 2; // True/False or MCQ
  }

  autoCorrectMark(row: any): void {
    const isTrueFalse = row.questionTypeID === 1;
    const isMCQ = row.questionTypeID === 2;

    if (isTrueFalse && row.questionCorrectAnswerName !== undefined) {
      row.mark = row.answer === row.questionCorrectAnswerName ? row.questionMark : 0;
    } else if (isMCQ && row.questionCorrectAnswerID !== undefined) {
      row.mark = row.answerOptionID === row.questionCorrectAnswerID ? row.questionMark : 0;
    } else if (!this.isAutoCorrectType(row.questionTypeID)) {
      row.mark = row.mark ?? 0;
    }
  }

  limitMark(row: any): void {
    if (row.mark > row.questionMark) {
      row.mark = row.questionMark;
    } else if (row.mark < 0) {
      row.mark = 0;
    }
  }

  preventExceed(event: KeyboardEvent, row: any): void {
    const value = parseInt((event.target as HTMLInputElement).value + event.key);
    if (!isNaN(value) && value > row.questionMark) {
      event.preventDefault();
    }
  }

  async save() {
    this.isLoading = true;
    const TheSubmittedDate = new Date(this.assignmentStudent.insertedAt); // current date
    const dueDate = new Date(this.assignmentStudent.dueDate);
    TheSubmittedDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);// ensure dueDate is a Date object

    const Swal = await import('sweetalert2').then(m => m.default);

    if (TheSubmittedDate > dueDate) {
      Swal.fire({
        title: 'Apply Late Submission Penalty?',
        text: 'If The student submitted after the due date. Do you want to apply the late submission penalty?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#089B41',
        cancelButtonColor: '#17253E',
        confirmButtonText: 'Apply Penalty',
        cancelButtonText: 'Forgive Delay',
      }).then((result) => {
        this.assignmentStudent.evaluationConsideringTheDelay = result.isConfirmed;
        this.assignmentStudentServ.Edit(this.assignmentStudent, this.DomainName)
          .pipe(finalize(() => this.isLoading = false)) // runs after success or error
          .subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Done',
                text: 'Updated Successfully',
                confirmButtonColor: '#089B41',
              });
              this.router.navigateByUrl(`Employee/Assignment Student/${this.assignmentStudent.assignmentID}`);
            },
            error: (err) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong, please try again.',
                confirmButtonColor: '#d33',
              });
              console.error('Edit error:', err);
            }
          });
      });
    }
    else {
      this.assignmentStudent.evaluationConsideringTheDelay = false
      this.assignmentStudentServ.Edit(this.assignmentStudent, this.DomainName)
        .pipe(finalize(() => this.isLoading = false)) // runs after success or error
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Updated Successfully',
              confirmButtonColor: '#089B41',
            });
            this.router.navigateByUrl(`Employee/Assignment Student/${this.assignmentStudent.assignmentID}`);
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Something went wrong, please try again.',
              confirmButtonColor: '#d33',
            });
            console.error('Edit error:', err);
          }
        });
    }
  }
}
