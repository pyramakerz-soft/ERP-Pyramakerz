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
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';
@Component({
  selector: 'app-subject-assignment',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './subject-assignment.component.html',
  styleUrl: './subject-assignment.component.css'
})

@InitLoader()
export class SubjectAssignmentComponent {

  path: string = ""
  DomainName: string = "";
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  SubjectID: number = 0;
  isRtl: boolean = false;
  subscription!: Subscription;
  bgColors: string[] = ['#F7F7F7', '#D7F7FF', '#FFF1D7', '#E8EBFF'];
  mode: string = "all";
  SolvedAssignment: AssignmentStudent[] = []
  UnSolvedAssignment: Assignment[] = []
  AllAssignment: any[] = []

  constructor(public account: AccountService, private languageService: LanguageService, public router: Router, public ApiServ: ApiService, public AssignmentServ: AssignmentService,
    public activeRoute: ActivatedRoute, private menuService: MenuService,
    private loadingService: LoadingService ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });
    this.SubjectID = Number(this.activeRoute.snapshot.paramMap.get('SubjectId'));
    this.GetAssignments()
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

  GetAssignments() {
    this.AssignmentServ.GetByStudentID(this.UserID, this.SubjectID, this.DomainName).subscribe(
      (d) => {
        this.SolvedAssignment = d.solvedAssignments.map((a: any) => ({ ...a, isSolved: true }));
        this.UnSolvedAssignment = d.unsolvedAssignments.map((a: any) => ({ ...a, isSolved: false }));

        // Merge and sort by openDate descending
        this.AllAssignment = [...this.SolvedAssignment, ...this.UnSolvedAssignment].sort((a, b) => {
          return new Date(b.openDate).getTime() - new Date(a.openDate).getTime();
        });
      },
      (error) => {
        console.log('Error:', error);
        if (!error.error.includes("No Assignments For This Student For this Subject")) {
          this.router.navigateByUrl(`Student/Subject`);
        }
      }
    );
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
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    cutoff.setHours(0, 0, 0, 0);
    return today > due || today > cutoff;
  }

  isPastCutoff(cutOfDate: string): boolean {
    const today = new Date();
    const cutoff = new Date(cutOfDate);
    today.setHours(0, 0, 0, 0);
    cutoff.setHours(0, 0, 0, 0);
    return today > cutoff;
  }
}
