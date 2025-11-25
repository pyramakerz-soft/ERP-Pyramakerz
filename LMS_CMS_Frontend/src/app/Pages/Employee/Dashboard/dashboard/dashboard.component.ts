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
import { AssignmentPieComponent } from '../../../../Component/Employee/Home/assignment-pie/assignment-pie.component';
import {
  TodaysData,
  DashboardData,
} from '../../../../Models/Dashboard/dashboard.models';
import { CategoryRankingsComponent } from '../../../../Component/Employee/Home/category-ranking/category-ranking.component';
import { RequestProgressComponent } from '../../../../Component/Employee/Home/request-progresss/request-progresss.component';
import { DashboardService } from '../../../../Services/Dashboard/dashboard.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';

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
    TranslateModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})

@InitLoader()
export class DashboardComponent implements OnInit, OnDestroy {
  User_Data_After_Login: TokenData = new TokenData(
    '',
    0,
    0,
    0,
    0,
    '',
    '',
    '',
    '',
    ''
  );
  DomainName: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;

  todaysData: TodaysData | null = null;
  dashboardData: DashboardData | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  selectedYear: number = new Date().getFullYear();
  selectedMonth?: number;

  constructor(
    public account: AccountService,
    public employeeService: EmployeeService,
    public ApiServ: ApiService,
    private languageService: LanguageService, 
    private dashboardService: DashboardService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {  
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.DomainName = this.ApiServ.GetHeader();

    if (!this.DomainName) { 
      this.errorMessage = 'Domain configuration error';
      this.isLoading = false;
      return;
    }

    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
    this.isRtl = document.documentElement.dir === 'rtl';

    this.loadDashboardData();
  }

  ngOnDestroy(): void { 
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Loading dashboard data with DomainName:', this.DomainName);

    forkJoin({
      todaysData: this.dashboardService.getTodaysData(this.DomainName),
      dashboardData: this.dashboardService.getDashboardData(
        {
          year: this.selectedYear,
          month: this.selectedMonth,
        },
        this.DomainName
      ),
    }).subscribe({
      next: (result) => {
        console.log('Dashboard data loaded successfully:', result);
        this.todaysData = result.todaysData;
        this.dashboardData = result.dashboardData;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.errorMessage = 'Failed to load dashboard data';
        this.isLoading = false;

        // Log detailed error information
        // if (error.status === 404) {
        //   console.error('404 Error - Check if endpoints are correct:');
        //   console.error(
        //     "- Today's Data Endpoint:",
        //     `${this.ApiServ.BaseUrl}/Dashboard/GetTodaysData`
        //   );
        //   console.error(
        //     '- Dashboard Data Endpoint:',
        //     `${this.ApiServ.BaseUrl}/Dashboard`
        //   );
        // }
      },
    });
  }

  // onSelection(data: { year: number; month?: number }): void {
  //   this.selectedYear = data.year;
  //   this.selectedMonth = data.month;
  //   this.errorMessage = '';

  //   if (data.month) {
  //     console.log(`Selected: ${data.year}-${data.month}`);
  //   } else {
  //     console.log(`Selected Year: ${data.year}`);
  //   }

  //   // Reload dashboard data with new filters
  //   this.dashboardService
  //     .getDashboardData(
  //       {
  //         year: this.selectedYear,
  //         month: this.selectedMonth,
  //       },
  //       this.DomainName
  //     )
  //     .subscribe({
  //       next: (result) => {
  //         this.dashboardData = result;
  //       },
  //       error: (error) => {
  //         console.error('Error loading filtered dashboard data:', error);
  //         this.errorMessage = 'Failed to load filtered data';
  //       },
  //     });
  // }

  calculatePercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }

  retryLoadData(): void {
    this.loadDashboardData();
  }


get isMonthView(): boolean {
  return this.selectedMonth !== undefined && this.selectedMonth !== null;
}

onSelection(data: { year: number; month?: number }): void {
  this.selectedYear = data.year;
  this.selectedMonth = data.month;
  this.errorMessage = '';

  console.log(`Selected: ${data.year}${data.month ? '-' + data.month : ''}`);

  this.dashboardData = null;
  this.isLoading = true;

  this.dashboardService
    .getDashboardData(
      {
        year: this.selectedYear,
        month: this.selectedMonth,
      },
      this.DomainName
    )
    .subscribe({
      next: (result) => {
        this.dashboardData = result;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading filtered dashboard data:', error);
        this.errorMessage = 'Failed to load filtered data';
        this.dashboardData = null;
        this.isLoading = false;
      },
    });
}
}
