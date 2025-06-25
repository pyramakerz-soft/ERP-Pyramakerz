import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronicInvoiceComponent } from './electronic-invoice.component';

describe('ElectronicInvoiceComponent', () => {
  let component: ElectronicInvoiceComponent;
  let fixture: ComponentFixture<ElectronicInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElectronicInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElectronicInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
