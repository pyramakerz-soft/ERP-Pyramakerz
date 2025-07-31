import { TestBed } from '@angular/core/testing';

import { RemedialClassroomService } from './remedial-classroom.service';

describe('RemedialClassroomService', () => {
  let service: RemedialClassroomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemedialClassroomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
