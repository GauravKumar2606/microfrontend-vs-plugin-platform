import { TestBed } from '@angular/core/testing';
import { EventBusService } from './event-bus.service';

describe('EventBusService', () => {
  let service: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [EventBusService] });
    service = TestBed.inject(EventBusService);
  });

  it('delivers events to subscribers of matching type', () => new Promise<void>(resolve => {
    service.on('CUSTOMER_ONBOARDED').subscribe(event => {
      expect(event.payload).toEqual({ customerId: '123' });
      resolve();
    });
    service.emit({ type: 'CUSTOMER_ONBOARDED', payload: { customerId: '123' } });
  }));

  it('does not deliver events of non-matching type', () => {
    const received: unknown[] = [];
    service.on('OTHER_EVENT').subscribe(e => received.push(e));
    service.emit({ type: 'CUSTOMER_ONBOARDED', payload: {} });
    expect(received.length).toBe(0);
  });
});
