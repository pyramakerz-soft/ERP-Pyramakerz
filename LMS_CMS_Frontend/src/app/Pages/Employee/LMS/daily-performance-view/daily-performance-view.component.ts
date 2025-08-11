import { Component } from '@angular/core';
import { DailyPerformanceMaster } from '../../../../Models/LMS/daily-performance-master';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DailyPerformanceService } from '../../../../Services/Employee/LMS/daily-performance.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { PerformanceType } from '../../../../Models/LMS/performance-type';
import { DailyPerformance } from '../../../../Models/LMS/daily-performance';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-daily-performance-view',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './daily-performance-view.component.html',
  styleUrl: './daily-performance-view.component.css'
})
export class DailyPerformanceViewComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  File: any;
  DomainName: string = '';
  UserID: number = 0;
  path: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  dailyPerformanceMaster: DailyPerformanceMaster = new DailyPerformanceMaster();
  dailyPerformanceMasterId: number = 0
  isModalVisible: boolean = false;
  performanceTypes: PerformanceType[] = [];

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    private menuService: MenuService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    public DailyPerformanceServ: DailyPerformanceService,
        private languageService: LanguageService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.dailyPerformanceMasterId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.getData()
     this.subscription = this.languageService.language$.subscribe(direction => {
          this.isRtl = direction === 'rtl';
        });
        this.isRtl = document.documentElement.dir === 'rtl';
      
  }

  moveToBack() {
    this.router.navigateByUrl('Employee/Enter Daily Performance');
  }

  getData() {
    this.DailyPerformanceServ.GetById(this.dailyPerformanceMasterId, this.DomainName).subscribe((d) => {
      this.dailyPerformanceMaster = d.master;
      this.performanceTypes = d.performanceTypes
    });
  }

  getStars(studentId: number, performanceTypeId: number): number {
    const student = this.dailyPerformanceMaster.dailyPerformances.find(s => s.studentID === studentId);
    const perf = student?.studentPerformance.find(p => p.performanceTypeID === performanceTypeId);
    return perf?.stars || 0;
  }

}
