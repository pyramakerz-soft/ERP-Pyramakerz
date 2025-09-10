import { TestBed } from '@angular/core/testing';

import { VacationEmployeeService } from './vacation-employee.service';

describe('VacationEmployeeService', () => {
  let service: VacationEmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VacationEmployeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
