import { TestBed } from '@angular/core/testing';

import { HomelessDataService } from './homeless-data.service';

describe('HomelessDataService', () => {
  let service: HomelessDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomelessDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
