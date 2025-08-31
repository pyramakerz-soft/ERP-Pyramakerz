import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherEvaluationReportComponent } from './teacher-evaluation-report.component';

describe('TeacherEvaluationReportComponent', () => {
  let component: TeacherEvaluationReportComponent;
  let fixture: ComponentFixture<TeacherEvaluationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherEvaluationReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherEvaluationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
