import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubjectResource } from '../../../../Models/LMS/subject-resource';
import { SubjectResourceService } from '../../../../Services/Employee/LMS/subject-resource.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { MenuService } from '../../../../Services/shared/menu.service';

@Component({
  selector: 'app-subject-resources',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './subject-resources.component.html',
  styleUrl: './subject-resources.component.css'
})
export class SubjectResourcesComponent {

  SubjectResourcesData: SubjectResource[] = []
  path: string = ""
  DomainName: string = "";
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  SubjectID: number = 0;
  SubjectName: string = ""
  bgColors: string[] = ['#F7F7F7', '#D7F7FF', '#FFF1D7', '#E8EBFF'];

  constructor(public account: AccountService, public router: Router, public ApiServ: ApiService,
    public activeRoute: ActivatedRoute, private menuService: MenuService, public SubjectResourceServ: SubjectResourceService) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });
    this.SubjectID = Number(this.activeRoute.snapshot.paramMap.get('SubjectId'));
    this.GetSubjectResourceData()
  }

  GetSubjectResourceData() {
    this.SubjectResourceServ.GetBySubjectId(this.SubjectID, this.DomainName).subscribe((d) => {
      this.SubjectResourcesData = d
    })
  }

  moveToBack() {
    this.router.navigateByUrl(`Student/Subject`)
  }

  getRandomColor(index: number): string {
    return this.bgColors[index % this.bgColors.length];
  }

  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
