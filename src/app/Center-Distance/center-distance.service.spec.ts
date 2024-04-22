import { TestBed } from '@angular/core/testing';

import { CenterDistanceService } from './center-distance.service';

describe('CenterDistanceService', () => {
  let service: CenterDistanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CenterDistanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
