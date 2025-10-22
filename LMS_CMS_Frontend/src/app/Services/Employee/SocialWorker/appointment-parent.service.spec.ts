import { TestBed } from '@angular/core/testing';

import { AppointmentParentService } from './appointment-parent.service';

describe('AppointmentParentService', () => {
  let service: AppointmentParentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentParentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
