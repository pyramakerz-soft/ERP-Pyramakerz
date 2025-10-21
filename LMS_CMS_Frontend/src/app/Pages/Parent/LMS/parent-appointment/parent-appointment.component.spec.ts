import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentAppointmentComponent } from './parent-appointment.component';

describe('ParentAppointmentComponent', () => {
  let component: ParentAppointmentComponent;
  let fixture: ComponentFixture<ParentAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentAppointmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
