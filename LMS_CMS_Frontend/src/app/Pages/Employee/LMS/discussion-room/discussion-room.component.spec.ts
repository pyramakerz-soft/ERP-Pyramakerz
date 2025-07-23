import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionRoomComponent } from './discussion-room.component';

describe('DiscussionRoomComponent', () => {
  let component: DiscussionRoomComponent;
  let fixture: ComponentFixture<DiscussionRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscussionRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscussionRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
