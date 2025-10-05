import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrEmployeeReportComponent } from './hr-employee-report.component';

describe('HrEmployeeReportComponent', () => {
  let component: HrEmployeeReportComponent;
  let fixture: ComponentFixture<HrEmployeeReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrEmployeeReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrEmployeeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
