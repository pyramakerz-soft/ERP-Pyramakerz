import { TestBed } from '@angular/core/testing';

import { SocialWorkerMedalStudentService } from './social-worker-medal-student.service';

describe('SocialWorkerMedalStudentService', () => {
  let service: SocialWorkerMedalStudentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocialWorkerMedalStudentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
