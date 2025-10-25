import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentLessonComponent } from './parent-lesson.component';

describe('ParentLessonComponent', () => {
  let component: ParentLessonComponent;
  let fixture: ComponentFixture<ParentLessonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentLessonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentLessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
