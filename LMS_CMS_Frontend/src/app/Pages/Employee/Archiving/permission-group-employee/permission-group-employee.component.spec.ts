import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionGroupEmployeeComponent } from './permission-group-employee.component';

describe('PermissionGroupEmployeeComponent', () => {
  let component: PermissionGroupEmployeeComponent;
  let fixture: ComponentFixture<PermissionGroupEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionGroupEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionGroupEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
