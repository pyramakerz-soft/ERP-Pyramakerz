import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTableStudentComponent } from './time-table-student.component';

describe('TimeTableStudentComponent', () => {
  let component: TimeTableStudentComponent;
  let fixture: ComponentFixture<TimeTableStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeTableStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeTableStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
