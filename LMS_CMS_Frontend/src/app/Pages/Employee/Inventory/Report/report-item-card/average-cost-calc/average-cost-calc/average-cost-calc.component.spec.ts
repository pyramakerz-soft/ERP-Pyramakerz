import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AverageCostCalcComponent } from './average-cost-calc.component';

describe('AverageCostCalcComponent', () => {
  let component: AverageCostCalcComponent;
  let fixture: ComponentFixture<AverageCostCalcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AverageCostCalcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AverageCostCalcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
