import { Component } from '@angular/core';
import { Violation } from '../../../../Models/Violation/violation';
import { ViolationService } from '../../../../Services/Employee/Violation/violation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';

@Component({
  selector: 'app-violation-view',
  standalone: true,
  imports: [CommonModule, FormsModule , TranslateModule],
  templateUrl: './violation-view.component.html',
  styleUrl: './violation-view.component.css'
})
export class ViolationViewComponent {
  DomainName: string = "";
  ViolationId: number = 0

  violation: Violation = new Violation()
  path: string = ""
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  isRtl: boolean = false;
  subscription!: Subscription;
  keysArray: string[] = ['id', 'englishName', "arabicName"];
  key: string = 'id';
  value: any = '';


  constructor(public account: AccountService,private languageService: LanguageService, public EditDeleteServ: DeleteEditPermissionService, public ApiServ: ApiService, public activeRoute: ActivatedRoute,
    public router: Router, private menuService: MenuService, public ViolationServ: ViolationService,
    private realTimeService: RealTimeNotificationServiceService,) { }

  ngOnInit() {
    this.DomainName = this.ApiServ.GetHeader();
    this.ViolationId = Number(this.activeRoute.snapshot.paramMap.get('id'))
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();

    this.GetViolationById(this.ViolationId)

    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });
     this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

   ngOnDestroy(): void {
      this.realTimeService.stopConnection(); 
       if (this.subscription) {
        this.subscription.unsubscribe();
      }
  }

  moveToViolation() {
    this.router.navigateByUrl('Employee/violation');
  }

  GetViolationById(Id: number) {
    this.ViolationServ.GetByID(Id, this.DomainName).subscribe((data) => {
      this.violation = data;
      console.log(this.violation)
    });
  }

  openUrl(link: string) {
    if (link) {
      const fullUrl = `${link}`;
      window.open(fullUrl, '_blank');
    }
  }
}
