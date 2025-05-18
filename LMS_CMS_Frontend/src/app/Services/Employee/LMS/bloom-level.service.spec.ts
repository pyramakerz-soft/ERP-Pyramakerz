import { TestBed } from '@angular/core/testing';

import { BloomLevelService } from './bloom-level.service';

describe('BloomLevelService', () => {
  let service: BloomLevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BloomLevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
