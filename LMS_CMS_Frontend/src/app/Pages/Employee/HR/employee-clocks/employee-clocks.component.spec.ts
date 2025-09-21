import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeClocksComponent } from './employee-clocks.component';

describe('EmployeeClocksComponent', () => {
  let component: EmployeeClocksComponent;
  let fixture: ComponentFixture<EmployeeClocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeClocksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeClocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
