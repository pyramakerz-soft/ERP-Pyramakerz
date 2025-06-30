import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { Subject } from '../../../../Models/LMS/subject';

@Component({
  selector: 'app-subject-weeks',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './subject-weeks.component.html',
  styleUrl: './subject-weeks.component.css'
})
export class SubjectWeeksComponent {
 subjectData: Subject[] = []
  path: string = ""
  DomainName: string = "";
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")

  constructor(public account: AccountService, public router: Router, public ApiServ: ApiService,
    public activeRoute: ActivatedRoute, private menuService: MenuService, public subjectService: SubjectService) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });
    this.getSubjectData()
  }

  getSubjectData() {
    this.subjectService.GetByStudentId(this.UserID,this.DomainName).subscribe(
      (data) => {
        this.subjectData = data;
        console.log( this.subjectData)
      }
    )
  }

}
