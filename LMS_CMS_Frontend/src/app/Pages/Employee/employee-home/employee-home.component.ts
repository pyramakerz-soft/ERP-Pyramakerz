import { Component } from '@angular/core';
import { AccountService } from '../../../Services/account.service';
import { TokenData } from '../../../Models/token-data';
import { ChartPieComponent } from '../../../Component/Employee/Home/chart-pie/chart-pie.component';
import { RevenueChartComponent } from '../../../Component/Employee/Home/revenue-chart/revenue-chart.component';
import { SalesAnalyticsComponent } from '../../../Component/Employee/Home/sales-analytics/sales-analytics.component';
import { FilterHeaderComponent } from '../../../Component/Employee/Home/filter-header/filter-header.component';
import { EmployeeService } from '../../../Services/Employee/employee.service';
import { ApiService } from '../../../Services/api.service';
import { Employee } from '../../../Models/Employee/employee';
import { CommonModule } from '@angular/common';
import { RevenueChartSalesComponent } from '../../../Component/Employee/Home/revenue-chart-sales/revenue-chart-sales.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [
    ChartPieComponent,
    RevenueChartComponent,
    RevenueChartSalesComponent,
    SalesAnalyticsComponent,
    FilterHeaderComponent,
    CommonModule , TranslateModule
  ],
  templateUrl: './employee-home.component.html',
  styleUrl: './employee-home.component.css',
})
export class EmployeeHomeComponent {
  tab: 'Week' | 'Month' | 'Year' | 'Custom' = 'Month';
  User_Data_After_Login :TokenData =new TokenData("", 0, 0, 0, 0, "", "", "", "", "") 
  DomainName: string = "";
    isRtl: boolean = false;
    subscription!: Subscription;
  employee:Employee = new Employee()

  constructor(public account:AccountService, 
    public employeeService:EmployeeService, 
    public ApiServ:ApiService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService){}

  ngOnInit(){
    this.User_Data_After_Login = this.account.Get_Data_Form_Token(); 
    this.DomainName=this.ApiServ.GetHeader();
    this.getEmployeeByID()

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

  getEmployeeByID(){
    this.employeeService.GetMyData(this.DomainName).subscribe(
      data =>{
        this.employee = data 
      }
    )
  }

  selectTab(tab: 'Week' | 'Month' | 'Year' | 'Custom') {
    this.tab = tab;
  }
}
