import { TestBed } from '@angular/core/testing';

import { RemedialTimeTableClassesService } from './remedial-time-table-classes.service';

describe('RemedialTimeTableClassesService', () => {
  let service: RemedialTimeTableClassesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemedialTimeTableClassesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
