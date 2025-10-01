import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSalaryDetailedComponent } from './employee-salary-detailed.component';

describe('EmployeeSalaryDetailedComponent', () => {
  let component: EmployeeSalaryDetailedComponent;
  let fixture: ComponentFixture<EmployeeSalaryDetailedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeSalaryDetailedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSalaryDetailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
