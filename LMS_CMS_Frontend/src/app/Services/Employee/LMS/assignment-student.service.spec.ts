import { TestBed } from '@angular/core/testing';

import { AssignmentStudentService } from './assignment-student.service';

describe('AssignmentStudentService', () => {
  let service: AssignmentStudentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignmentStudentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
