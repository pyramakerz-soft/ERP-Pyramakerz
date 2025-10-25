import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyPreformanceReportComponent } from './daily-preformance-report.component';

describe('DailyPreformanceReportComponent', () => {
  let component: DailyPreformanceReportComponent;
  let fixture: ComponentFixture<DailyPreformanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyPreformanceReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyPreformanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
