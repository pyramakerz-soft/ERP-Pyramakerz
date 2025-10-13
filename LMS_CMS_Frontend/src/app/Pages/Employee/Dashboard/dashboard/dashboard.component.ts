import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChartPieComponent } from '../../../../Component/Employee/Home/chart-pie/chart-pie.component';
import { FilterHeaderComponent } from '../../../../Component/Employee/Home/filter-header/filter-header.component';
import { RevenueChartSalesComponent } from '../../../../Component/Employee/Home/revenue-chart-sales/revenue-chart-sales.component';
import { RevenueChartComponent } from '../../../../Component/Employee/Home/revenue-chart/revenue-chart.component';
import { SalesAnalyticsComponent } from '../../../../Component/Employee/Home/sales-analytics/sales-analytics.component';
import { Subscription } from 'rxjs'; 
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChartPieComponent, RevenueChartComponent, RevenueChartSalesComponent, SalesAnalyticsComponent, FilterHeaderComponent, CommonModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent { 
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  DomainName: string = "";
  isRtl: boolean = false;
  subscription!: Subscription; 

  constructor(public account: AccountService,
    public employeeService: EmployeeService,
    public ApiServ: ApiService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.DomainName = this.ApiServ.GetHeader();

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

  onSelection(data: { year: number; month?: number }) {
    if (data.month) {
      console.log(`Selected: ${data.year}-${data.month}`);
    } else {
      console.log(`Selected Year: ${data.year}`);
    } 
  }
}
