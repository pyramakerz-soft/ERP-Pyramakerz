import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisteredEmployeeComponent } from './registered-employee.component';

describe('RegisteredEmployeeComponent', () => {
  let component: RegisteredEmployeeComponent;
  let fixture: ComponentFixture<RegisteredEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisteredEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisteredEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
