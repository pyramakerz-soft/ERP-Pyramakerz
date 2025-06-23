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

@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './assignment-detail.component.html',
  styleUrl: './assignment-detail.component.css'
})
export class AssignmentDetailComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  TableData: AssignmentStudent[] = [];

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
    public assignmentServ: AssignmentService
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
  }

  GetAssignment() {
    this.assignmentStudentServ.GetById(this.AssignmentStudentId, this.DomainName).subscribe((d) => {
      this.assignmentStudent = d
      console.log(this.assignmentStudent)
    })
  }

  moveToAssignment() {
    this.router.navigateByUrl(`Employee/Assignment`)
  }

  getAnswerForSubBankQuestion(row: any, subBankQuestionID: number): string {
    const answerObj = row.assignmentStudentQuestionAnswerOption.find(
      (a: any) => a.subBankQuestionID === subBankQuestionID
    );
    return answerObj?.answer || '';
  }

}
