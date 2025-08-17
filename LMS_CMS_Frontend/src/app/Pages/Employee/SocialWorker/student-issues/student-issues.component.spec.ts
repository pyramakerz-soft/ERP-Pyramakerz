import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentIssuesComponent } from './student-issues.component';

describe('StudentIssuesComponent', () => {
  let component: StudentIssuesComponent;
  let fixture: ComponentFixture<StudentIssuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentIssuesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
