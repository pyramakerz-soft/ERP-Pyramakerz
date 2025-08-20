import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { AssignmentStudent } from '../../../../Models/LMS/assignment-student';
import { AssignmentStudentQuestion } from '../../../../Models/LMS/assignment-student-question';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { AssignmentStudentService } from '../../../../Services/Employee/LMS/assignment-student.service';
import { AssignmentService } from '../../../../Services/Employee/LMS/assignment.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-student-assignment-view',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './student-assignment-view.component.html',
  styleUrl: './student-assignment-view.component.css'
})
export class StudentAssignmentViewComponent {

 User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  TableData: AssignmentStudent[] = [];

  DomainName: string = '';
  UserID: number = 0;
  isRtl: boolean = false;
  subscription!: Subscription;
  path: string = '';
  isDeleting: boolean = false;
  AssignmentStudentId: number = 0;
  ClassId: number = 0;
  assignmentStudent: AssignmentStudent = new AssignmentStudent()
  isLoading :boolean = false

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    private languageService: LanguageService,
    public account: AccountService,
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
    this.AssignmentStudentId = Number(this.activeRoute.snapshot.paramMap.get('AssignmentStudentId'));
    this.GetAssignment()
        this.subscription = this.languageService.language$.subscribe(direction => {
    this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  GetAssignment() {
    this.assignmentStudentServ.GetById(this.AssignmentStudentId, this.DomainName).subscribe((d) => {
      this.assignmentStudent = d
    })
  }

  moveToAssignment() {
    this.router.navigateByUrl(`Student/SubjectAssignment/${this.assignmentStudent.subjectId}`)
  }

  getAnswerForSubBankQuestion(row: AssignmentStudentQuestion, subBankQuestionID: number): string {
    const answerObj = row.assignmentStudentQuestionAnswerOption.find(
      (a: any) => a.subBankQuestionID === subBankQuestionID
    );
    return answerObj?.answer || '';
  }

}
