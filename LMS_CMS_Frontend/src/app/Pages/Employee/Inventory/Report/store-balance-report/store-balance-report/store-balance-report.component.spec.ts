import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreBalanceReportComponent } from './store-balance-report.component';

describe('StoreBalanceReportComponent', () => {
  let component: StoreBalanceReportComponent;
  let fixture: ComponentFixture<StoreBalanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreBalanceReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreBalanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
