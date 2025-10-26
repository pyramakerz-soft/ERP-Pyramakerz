import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentMeetingComponent } from './parent-meeting.component';

describe('ParentMeetingComponent', () => {
  let component: ParentMeetingComponent;
  let fixture: ComponentFixture<ParentMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentMeetingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
