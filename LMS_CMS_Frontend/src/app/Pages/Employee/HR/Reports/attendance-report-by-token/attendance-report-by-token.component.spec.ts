import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceReportByTokenComponent } from './attendance-report-by-token.component';

describe('AttendanceReportByTokenComponent', () => {
  let component: AttendanceReportByTokenComponent;
  let fixture: ComponentFixture<AttendanceReportByTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceReportByTokenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceReportByTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
