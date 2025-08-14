import { TestBed } from '@angular/core/testing';

import { SocialWorkerMedalService } from './social-worker-medal.service';

describe('SocialWorkerMedalService', () => {
  let service: SocialWorkerMedalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocialWorkerMedalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
