import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllStoresBalanceReportComponent } from './all-store-balance.component';

describe('AllStoresBalanceReportComponent', () => {
  let component: AllStoresBalanceReportComponent;
  let fixture: ComponentFixture<AllStoresBalanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllStoresBalanceReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllStoresBalanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

