import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyPerformanceViewComponent } from './daily-performance-view.component';

describe('DailyPerformanceViewComponent', () => {
  let component: DailyPerformanceViewComponent;
  let fixture: ComponentFixture<DailyPerformanceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyPerformanceViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyPerformanceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
