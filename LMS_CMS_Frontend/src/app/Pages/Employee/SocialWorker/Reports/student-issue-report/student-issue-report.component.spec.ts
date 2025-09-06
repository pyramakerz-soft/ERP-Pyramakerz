import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentIssueReportComponent } from './student-issue-report.component';

describe('StudentIssueReportComponent', () => {
  let component: StudentIssueReportComponent;
  let fixture: ComponentFixture<StudentIssueReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentIssueReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentIssueReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
