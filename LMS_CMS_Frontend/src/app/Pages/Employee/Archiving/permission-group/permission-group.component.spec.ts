import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionGroupComponent } from './permission-group.component';

describe('PermissionGroupComponent', () => {
  let component: PermissionGroupComponent;
  let fixture: ComponentFixture<PermissionGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
