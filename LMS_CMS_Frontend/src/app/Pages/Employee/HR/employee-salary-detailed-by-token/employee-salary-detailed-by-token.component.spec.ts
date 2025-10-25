import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSalaryDetailedByTokenComponent } from './employee-salary-detailed-by-token.component';

describe('EmployeeSalaryDetailedByTokenComponent', () => {
  let component: EmployeeSalaryDetailedByTokenComponent;
  let fixture: ComponentFixture<EmployeeSalaryDetailedByTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeSalaryDetailedByTokenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSalaryDetailedByTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
