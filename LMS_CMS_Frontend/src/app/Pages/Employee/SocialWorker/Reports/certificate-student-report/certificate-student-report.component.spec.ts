import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateStudentReportComponent } from './certificate-student-report.component';

describe('CertificateStudentReportComponent', () => {
  let component: CertificateStudentReportComponent;
  let fixture: ComponentFixture<CertificateStudentReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateStudentReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateStudentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
