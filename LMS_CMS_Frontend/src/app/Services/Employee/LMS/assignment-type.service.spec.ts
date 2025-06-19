import { TestBed } from '@angular/core/testing';

import { AssignmentTypeService } from './assignment-type.service';

describe('AssignmentTypeService', () => {
  let service: AssignmentTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignmentTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
