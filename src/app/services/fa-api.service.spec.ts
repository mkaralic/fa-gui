import { TestBed } from '@angular/core/testing';

import { FaApiService } from './fa-api.service';

describe('FaApiService', () => {
  let service: FaApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
