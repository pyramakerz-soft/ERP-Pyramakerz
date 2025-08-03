import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemedialTimeTableComponent } from './remedial-time-table.component';

describe('RemedialTimeTableComponent', () => {
  let component: RemedialTimeTableComponent;
  let fixture: ComponentFixture<RemedialTimeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemedialTimeTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemedialTimeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
