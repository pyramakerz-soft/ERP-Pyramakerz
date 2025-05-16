import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueChartSalesComponent } from './revenue-chart-sales.component';

describe('RevenueChartSalesComponent', () => {
  let component: RevenueChartSalesComponent;
  let fixture: ComponentFixture<RevenueChartSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueChartSalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueChartSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
