import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveRequestReportComponent } from './leave-request-report.component';

describe('LeaveRequestReportComponent', () => {
  let component: LeaveRequestReportComponent;
  let fixture: ComponentFixture<LeaveRequestReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveRequestReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveRequestReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
