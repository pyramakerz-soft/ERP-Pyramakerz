import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalMeetingComponent } from './horizontal-meeting.component';

describe('HorizontalMeetingComponent', () => {
  let component: HorizontalMeetingComponent;
  let fixture: ComponentFixture<HorizontalMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalMeetingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorizontalMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
