import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassroomSubjectsComponent } from './classroom-subjects.component';

describe('ClassroomSubjectsComponent', () => {
  let component: ClassroomSubjectsComponent;
  let fixture: ComponentFixture<ClassroomSubjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassroomSubjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassroomSubjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
