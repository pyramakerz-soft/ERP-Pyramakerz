import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMarkStudentComponent } from './direct-mark-student.component';

describe('DirectMarkStudentComponent', () => {
  let component: DirectMarkStudentComponent;
  let fixture: ComponentFixture<DirectMarkStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectMarkStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectMarkStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
