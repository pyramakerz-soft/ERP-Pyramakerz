import { TestBed } from '@angular/core/testing';

import { MaintenanceEmployeesService } from './maintenance-employees.service';

describe('MaintenanceEmployeesService', () => {
  let service: MaintenanceEmployeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaintenanceEmployeesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
