import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionGroupArchivingItemComponent } from './permission-group-archiving-item.component';

describe('PermissionGroupArchivingItemComponent', () => {
  let component: PermissionGroupArchivingItemComponent;
  let fixture: ComponentFixture<PermissionGroupArchivingItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionGroupArchivingItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionGroupArchivingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
