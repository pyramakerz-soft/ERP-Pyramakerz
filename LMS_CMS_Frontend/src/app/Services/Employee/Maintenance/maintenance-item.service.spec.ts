import { TestBed } from '@angular/core/testing';

import { MaintenanceItemService } from './maintenance-item.service';

describe('MaintenanceItemService', () => {
  let service: MaintenanceItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaintenanceItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
