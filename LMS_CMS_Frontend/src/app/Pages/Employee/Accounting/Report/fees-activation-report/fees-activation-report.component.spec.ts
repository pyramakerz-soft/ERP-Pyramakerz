import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesActivationReportComponent } from './fees-activation-report.component';

describe('FeesActivationReportComponent', () => {
  let component: FeesActivationReportComponent;
  let fixture: ComponentFixture<FeesActivationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeesActivationReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeesActivationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
