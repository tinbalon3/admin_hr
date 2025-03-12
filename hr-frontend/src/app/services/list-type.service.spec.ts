import { TestBed } from '@angular/core/testing';

import { ListTypeService } from './list-type.service';

describe('ListTypeService', () => {
  let service: ListTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
