import { TestBed } from '@angular/core/testing';

import { RemedialClassroomStudentService } from './remedial-classroom-student.service';

describe('RemedialClassroomStudentService', () => {
  let service: RemedialClassroomStudentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemedialClassroomStudentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
