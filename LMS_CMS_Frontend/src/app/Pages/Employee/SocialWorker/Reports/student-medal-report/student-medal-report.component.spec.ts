import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentMedalReportComponent } from './student-medal-report.component';

describe('StudentMedalReportComponent', () => {
  let component: StudentMedalReportComponent;
  let fixture: ComponentFixture<StudentMedalReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentMedalReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentMedalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
