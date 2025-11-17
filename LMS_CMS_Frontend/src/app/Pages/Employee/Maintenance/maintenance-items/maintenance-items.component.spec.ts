import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceItemsComponent } from './maintenance-items.component';

describe('MaintenanceItemsComponent', () => {
  let component: MaintenanceItemsComponent;
  let fixture: ComponentFixture<MaintenanceItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
