import { TestBed } from '@angular/core/testing';

import { MaintenanceCompaniesService } from './maintenance-companies.service';

describe('MaintenanceCompaniesService', () => {
  let service: MaintenanceCompaniesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaintenanceCompaniesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
