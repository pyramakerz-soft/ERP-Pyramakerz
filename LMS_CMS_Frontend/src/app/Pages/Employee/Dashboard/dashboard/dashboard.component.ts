import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChartPieComponent } from '../../../../Component/Employee/Home/chart-pie/chart-pie.component';
import { FilterHeaderComponent } from '../../../../Component/Employee/Home/filter-header/filter-header.component';
import { RevenueChartSalesComponent } from '../../../../Component/Employee/Home/revenue-chart-sales/revenue-chart-sales.component';
import { RevenueChartComponent } from '../../../../Component/Employee/Home/revenue-chart/revenue-chart.component';
import { SalesAnalyticsComponent } from '../../../../Component/Employee/Home/sales-analytics/sales-analytics.component';
import { forkJoin, Subscription } from 'rxjs'; 
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { AssignmentPieComponent } from "../../../../Component/Employee/Home/assignment-pie/assignment-pie.component";
import { TodaysData, DashboardData } from '../../../../Models/Dashboard/dashboard.models';
import { CategoryRankingsComponent } from '../../../../Component/Employee/Home/category-ranking/category-ranking.component';
import { RequestProgressComponent } from '../../../../Component/Employee/Home/request-progresss/request-progresss.component';
import { DashboardService } from '../../../../Services/Dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ChartPieComponent, 
    RevenueChartComponent, 
    RevenueChartSalesComponent, 
    FilterHeaderComponent, 
    AssignmentPieComponent,
    RequestProgressComponent,
    CategoryRankingsComponent,
    CommonModule, 
    TranslateModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy { 
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "");
  DomainName: string = "";
  isRtl: boolean = false;
  subscription!: Subscription;
  
  // Data properties
  todaysData: TodaysData | null = null;
  dashboardData: DashboardData | null = null;
  isLoading: boolean = true;
  
  // Current selection
  selectedYear: number = new Date().getFullYear();
  selectedMonth?: number;

  constructor(
    public account: AccountService,
    public employeeService: EmployeeService,
    public ApiServ: ApiService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.DomainName = this.ApiServ.GetHeader();

    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';

    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.realTimeService.stopConnection();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }  

  loadDashboardData(): void {
    this.isLoading = true;
    
    forkJoin({
      todaysData: this.dashboardService.getTodaysData(this.DomainName),
      dashboardData: this.dashboardService.getDashboardData({
        year: this.selectedYear, 
        month: this.selectedMonth,
      } , this.DomainName)
    }).subscribe({
      next: (result) => {
        console.log('Dashboard data loaded:', result);
        this.todaysData = result.todaysData;
        this.dashboardData = result.dashboardData;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  onSelection(data: { year: number; month?: number }): void {
    this.selectedYear = data.year;
    this.selectedMonth = data.month;
    
    if (data.month) {
      console.log(`Selected: ${data.year}-${data.month}`);
    } else {
      console.log(`Selected Year: ${data.year}`);
    }
    
    // Reload dashboard data with new filters
    this.dashboardService.getDashboardData({ 
      year: this.selectedYear, 
      month: this.selectedMonth 
    } , this.DomainName).subscribe({
      next: (result) => {
        this.dashboardData = result;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  // Helper method to calculate percentage for progress bars
  calculatePercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }
}