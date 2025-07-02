import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectLessonLiveComponent } from './subject-lesson-live.component';

describe('SubjectLessonLiveComponent', () => {
  let component: SubjectLessonLiveComponent;
  let fixture: ComponentFixture<SubjectLessonLiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectLessonLiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectLessonLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
