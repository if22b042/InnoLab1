import { TestBed } from '@angular/core/testing';

import { GreenSpaceService } from './greenspace.service';

describe('GreenspaceService', () => {
  let service: GreenSpaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GreenSpaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
