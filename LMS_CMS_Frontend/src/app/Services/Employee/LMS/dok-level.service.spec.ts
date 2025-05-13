import { TestBed } from '@angular/core/testing';

import { DokLevelService } from './dok-level.service';

describe('DokLevelService', () => {
  let service: DokLevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DokLevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
