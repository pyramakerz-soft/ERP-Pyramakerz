import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarySummaryTokenComponent } from './salary-summary-token.component';

describe('SalarySummaryTokenComponent', () => {
  let component: SalarySummaryTokenComponent;
  let fixture: ComponentFixture<SalarySummaryTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalarySummaryTokenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalarySummaryTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
