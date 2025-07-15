import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTableReplaceComponent } from './time-table-replace.component';

describe('TimeTableReplaceComponent', () => {
  let component: TimeTableReplaceComponent;
  let fixture: ComponentFixture<TimeTableReplaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeTableReplaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeTableReplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
