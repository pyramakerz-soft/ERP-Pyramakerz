import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisteredEmployeeViewComponent } from './registered-employee-view.component';

describe('RegisteredEmployeeViewComponent', () => {
  let component: RegisteredEmployeeViewComponent;
  let fixture: ComponentFixture<RegisteredEmployeeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisteredEmployeeViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisteredEmployeeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
