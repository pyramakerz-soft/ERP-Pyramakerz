import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeductionReportComponent } from './deduction-report.component';

describe('DeductionReportComponent', () => {
  let component: DeductionReportComponent;
  let fixture: ComponentFixture<DeductionReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeductionReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeductionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
