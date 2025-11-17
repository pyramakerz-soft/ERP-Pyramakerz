import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacationEmployeeComponent } from './vacation-employee.component';

describe('VacationEmployeeComponent', () => {
  let component: VacationEmployeeComponent;
  let fixture: ComponentFixture<VacationEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacationEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VacationEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
