import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceEmployeesComponent } from './maintenance-employees.component';

describe('MaintenanceEmployeesComponent', () => {
  let component: MaintenanceEmployeesComponent;
  let fixture: ComponentFixture<MaintenanceEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
