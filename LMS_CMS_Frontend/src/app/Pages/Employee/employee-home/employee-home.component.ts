import { Component } from '@angular/core';
import { AccountService } from '../../../Services/account.service';
import { TokenData } from '../../../Models/token-data';
import { ChartPieComponent } from '../../../Component/Employee/Home/chart-pie/chart-pie.component';
import { RevenueChartComponent } from '../../../Component/Employee/Home/revenue-chart/revenue-chart.component';
import { SalesAnalyticsComponent } from '../../../Component/Employee/Home/sales-analytics/sales-analytics.component';
import { FilterHeaderComponent } from '../../../Component/Employee/Home/filter-header/filter-header.component';

@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [
    ChartPieComponent,
    RevenueChartComponent,
    SalesAnalyticsComponent,
    FilterHeaderComponent,
  ],
  templateUrl: './employee-home.component.html',
  styleUrl: './employee-home.component.css',
})
export class EmployeeHomeComponent {
  tab: 'Week' | 'Month' | 'Year' | 'Custom' = 'Month';

  selectTab(tab: 'Week' | 'Month' | 'Year' | 'Custom') {
    this.tab = tab;
  }
}
