import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxIssuerComponent } from './tax-issuer.component';

describe('TaxIssuerComponent', () => {
  let component: TaxIssuerComponent;
  let fixture: ComponentFixture<TaxIssuerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxIssuerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxIssuerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
