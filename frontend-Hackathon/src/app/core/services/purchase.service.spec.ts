import { TestBed } from '@angular/core/testing';

import { PurchaseService } from './purchase.service';

describe('PurchseService', () => {
  let service: PurchaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});