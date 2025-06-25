import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronicInvoiceDetailComponent } from './electronic-invoice-detail.component';

describe('ElectronicInvoiceDetailComponent', () => {
  let component: ElectronicInvoiceDetailComponent;
  let fixture: ComponentFixture<ElectronicInvoiceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElectronicInvoiceDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElectronicInvoiceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
