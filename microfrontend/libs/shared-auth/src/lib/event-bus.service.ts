import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppEvent } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class EventBusService {
  private events$ = new Subject<AppEvent>();

  emit(event: AppEvent): void {
    this.events$.next(event);
  }

  on(type: string): Observable<AppEvent> {
    return this.events$.pipe(filter(e => e.type === type));
  }
}
