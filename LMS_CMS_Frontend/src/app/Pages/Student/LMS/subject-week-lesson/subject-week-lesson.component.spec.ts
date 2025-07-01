import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectWeekLessonComponent } from './subject-week-lesson.component';

describe('SubjectWeekLessonComponent', () => {
  let component: SubjectWeekLessonComponent;
  let fixture: ComponentFixture<SubjectWeekLessonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectWeekLessonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectWeekLessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
