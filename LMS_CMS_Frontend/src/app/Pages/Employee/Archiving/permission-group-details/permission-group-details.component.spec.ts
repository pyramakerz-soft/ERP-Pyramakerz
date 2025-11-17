import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionGroupDetailsComponent } from './permission-group-details.component';

describe('PermissionGroupDetailsComponent', () => {
  let component: PermissionGroupDetailsComponent;
  let fixture: ComponentFixture<PermissionGroupDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionGroupDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionGroupDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
