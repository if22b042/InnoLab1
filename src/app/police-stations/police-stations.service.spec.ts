import { TestBed } from '@angular/core/testing';

import { PoliceStationsService } from './police-stations.service';

describe('PoliceStationsService', () => {
  let service: PoliceStationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PoliceStationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
