import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentPieComponent } from './assignment-pie.component';

describe('AssignmentPieComponent', () => {
  let component: AssignmentPieComponent;
  let fixture: ComponentFixture<AssignmentPieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentPieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
