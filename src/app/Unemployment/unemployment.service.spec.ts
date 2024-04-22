import { TestBed } from '@angular/core/testing';

import { UnemploymentService } from './unemployment.service';

describe('UnemploymentService', () => {
  let service: UnemploymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnemploymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
