import { TestBed } from '@angular/core/testing';

import { StudentIssueService } from './student-issue.service';

describe('StudentIssueService', () => {
  let service: StudentIssueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentIssueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
