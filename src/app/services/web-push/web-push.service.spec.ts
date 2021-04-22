import { TestBed } from '@angular/core/testing';

import { WebPushService } from './web-push.service';

describe('NotificationService', () => {
  let service: WebPushService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebPushService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
