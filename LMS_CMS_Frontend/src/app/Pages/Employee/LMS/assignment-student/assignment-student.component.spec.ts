import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentStudentComponent } from './assignment-student.component';

describe('AssignmentStudentComponent', () => {
  let component: AssignmentStudentComponent;
  let fixture: ComponentFixture<AssignmentStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
