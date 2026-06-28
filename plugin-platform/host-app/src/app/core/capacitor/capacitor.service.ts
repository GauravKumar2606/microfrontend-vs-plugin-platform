import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CapacitorService {
  readonly isNative = signal(this.detectNative());

  private detectNative(): boolean {
    // Capacitor sets this global when running inside a native wrapper
    const w = window as unknown as Record<string, unknown>;
    return !!(w['Capacitor'])
      && !!((w['Capacitor'] as Record<string, unknown>)['isNativePlatform']);
  }

  getPlatform(): 'web' | 'ios' | 'android' {
    const w = window as unknown as Record<string, unknown>;
    const cap = w['Capacitor'] as Record<string, unknown> | undefined;
    if (!cap) return 'web';
    return (cap['getPlatform'] as () => string)?.() as 'web' | 'ios' | 'android' ?? 'web';
  }
}
