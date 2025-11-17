import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeJobReportComponent } from './employee-job-report.component';

describe('EmployeeJobReportComponent', () => {
  let component: EmployeeJobReportComponent;
  let fixture: ComponentFixture<EmployeeJobReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeJobReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeJobReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
