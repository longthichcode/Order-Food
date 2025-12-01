import { TestBed } from '@angular/core/testing';

import { PromotionsServiceService } from './promotions-service.service';

describe('PromotionsServiceService', () => {
  let service: PromotionsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromotionsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
