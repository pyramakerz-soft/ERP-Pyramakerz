import { TestBed } from '@angular/core/testing';

import { CertificateStudentService } from './certificate-student.service';

describe('CertificateStudentService', () => {
  let service: CertificateStudentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CertificateStudentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
