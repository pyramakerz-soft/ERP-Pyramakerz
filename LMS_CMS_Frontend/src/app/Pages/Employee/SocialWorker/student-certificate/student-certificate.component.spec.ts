import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCertificateComponent } from './student-certificate.component';

describe('StudentCertificateComponent', () => {
  let component: StudentCertificateComponent;
  let fixture: ComponentFixture<StudentCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCertificateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
