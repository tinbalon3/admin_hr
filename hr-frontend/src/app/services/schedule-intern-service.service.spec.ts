import { TestBed } from '@angular/core/testing';

import { ScheduleInternServiceService } from './schedule-intern-service.service';

describe('ScheduleInternServiceService', () => {
  let service: ScheduleInternServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScheduleInternServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
