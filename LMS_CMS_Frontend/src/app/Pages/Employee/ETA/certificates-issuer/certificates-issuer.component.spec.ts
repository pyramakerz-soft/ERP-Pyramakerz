import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificatesIssuerComponent } from './certificates-issuer.component';

describe('CertificatesIssuerComponent', () => {
  let component: CertificatesIssuerComponent;
  let fixture: ComponentFixture<CertificatesIssuerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificatesIssuerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificatesIssuerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
