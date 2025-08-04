import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemedialTimeTableViewComponent } from './remedial-time-table-view.component';

describe('RemedialTimeTableViewComponent', () => {
  let component: RemedialTimeTableViewComponent;
  let fixture: ComponentFixture<RemedialTimeTableViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemedialTimeTableViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemedialTimeTableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
