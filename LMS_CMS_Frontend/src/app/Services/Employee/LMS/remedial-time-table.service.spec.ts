import { TestBed } from '@angular/core/testing';

import { RemedialTimeTableService } from './remedial-time-table.service';

describe('RemedialTimeTableService', () => {
  let service: RemedialTimeTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemedialTimeTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
