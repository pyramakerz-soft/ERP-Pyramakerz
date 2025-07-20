import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { AssignmentService } from '../../../../Services/Employee/LMS/assignment.service';
import { Assignment } from '../../../../Models/LMS/assignment';
import { AssignmentStudent } from '../../../../Models/LMS/assignment-student';

@Component({
  selector: 'app-subject-assignment',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './subject-assignment.component.html',
  styleUrl: './subject-assignment.component.css'
})
export class SubjectAssignmentComponent {

  path: string = ""
  DomainName: string = "";
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  SubjectID: number = 0;
  bgColors: string[] = ['#F7F7F7', '#D7F7FF', '#FFF1D7', '#E8EBFF'];
  mode: string = "solved";
  SolvedAssignment: AssignmentStudent[] = []
  UnSolvedAssignment: Assignment[] = []

  constructor(public account: AccountService, public router: Router, public ApiServ: ApiService, public AssignmentServ: AssignmentService,
    public activeRoute: ActivatedRoute, private menuService: MenuService) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });
    this.SubjectID = Number(this.activeRoute.snapshot.paramMap.get('SubjectId'));
    this.GetAssignments()
  }

  GetAssignments() {
    this.AssignmentServ.GetByStudentID(this.UserID, this.SubjectID, this.DomainName).subscribe((d) => {
      console.log(d)
      this.SolvedAssignment = d.solvedAssignments
      this.UnSolvedAssignment = d.unsolvedAssignments
    })
  }

  moveToBack() {
    this.router.navigateByUrl(`Student/Subject`)
  }

  TurnChoice(choice: string) {
    this.mode = choice
  }

  MoveToAssignmentView(AssignmentStudentId: number) {
    this.router.navigateByUrl(`Student/AssignmentView/${AssignmentStudentId}`)
  }

  MoveToAssignmentToSolve(AssignmentId: number) {
    this.router.navigateByUrl(`Student/Assignment/${AssignmentId}`)
  }

  isPastDueOrCutoff(dueDate: any, cutOfDate: string): boolean {
    const today = new Date();
    const due = new Date(dueDate);
    const cutoff = new Date(cutOfDate);
    return today >= due || today >= cutoff;
  }

  isPastCutoff(cutOfDate: string): boolean {
    const today = new Date();
    const cutoff = new Date(cutOfDate);
    return today >= cutoff;
  }
}
