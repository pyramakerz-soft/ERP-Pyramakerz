import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentParentComponent } from './appointment-parent.component';

describe('AppointmentParentComponent', () => {
  let component: AppointmentParentComponent;
  let fixture: ComponentFixture<AppointmentParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentParentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
