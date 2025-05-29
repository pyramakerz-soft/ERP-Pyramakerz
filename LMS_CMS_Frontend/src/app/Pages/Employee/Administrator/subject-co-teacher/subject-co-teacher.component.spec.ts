import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectCoTeacherComponent } from './subject-co-teacher.component';

describe('SubjectCoTeacherComponent', () => {
  let component: SubjectCoTeacherComponent;
  let fixture: ComponentFixture<SubjectCoTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectCoTeacherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectCoTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
