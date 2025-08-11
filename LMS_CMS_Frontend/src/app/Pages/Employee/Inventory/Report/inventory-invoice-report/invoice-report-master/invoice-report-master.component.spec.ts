import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryTransactionReportComponent } from './invoice-report-master.component';


describe('InventoryTransactionReportComponent', () => {
  let component: InventoryTransactionReportComponent;
  let fixture: ComponentFixture<InventoryTransactionReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryTransactionReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryTransactionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
