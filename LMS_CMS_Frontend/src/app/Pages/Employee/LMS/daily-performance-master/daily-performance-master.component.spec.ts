import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyPerformanceMasterComponent } from './daily-performance-master.component';

describe('DailyPerformanceMasterComponent', () => {
  let component: DailyPerformanceMasterComponent;
  let fixture: ComponentFixture<DailyPerformanceMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyPerformanceMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyPerformanceMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
