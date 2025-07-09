import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAssignmentViewComponent } from './student-assignment-view.component';

describe('StudentAssignmentViewComponent', () => {
  let component: StudentAssignmentViewComponent;
  let fixture: ComponentFixture<StudentAssignmentViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAssignmentViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentAssignmentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
