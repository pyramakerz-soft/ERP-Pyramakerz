import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemedialClassroomStudentComponent } from './remedial-classroom-student.component';

describe('RemedialClassroomStudentComponent', () => {
  let component: RemedialClassroomStudentComponent;
  let fixture: ComponentFixture<RemedialClassroomStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemedialClassroomStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemedialClassroomStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
