import { TestBed } from '@angular/core/testing';

import { NotificationsServicesService } from './notifications-services.service';

describe('NotificationsServicesService', () => {
  let service: NotificationsServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
