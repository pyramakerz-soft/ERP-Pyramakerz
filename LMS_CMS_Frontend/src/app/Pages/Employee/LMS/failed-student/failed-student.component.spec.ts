import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailedStudentComponent } from './failed-student.component';

describe('FailedStudentComponent', () => {
  let component: FailedStudentComponent;
  let fixture: ComponentFixture<FailedStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FailedStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FailedStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
