import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectWeeksComponent } from './subject-weeks.component';

describe('SubjectWeeksComponent', () => {
  let component: SubjectWeeksComponent;
  let fixture: ComponentFixture<SubjectWeeksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectWeeksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectWeeksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
