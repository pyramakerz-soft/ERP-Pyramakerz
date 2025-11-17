import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacationEmployeeReportComponent } from './vacation-employee-report.component';

describe('VacationEmployeeReportComponent', () => {
  let component: VacationEmployeeReportComponent;
  let fixture: ComponentFixture<VacationEmployeeReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacationEmployeeReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VacationEmployeeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
