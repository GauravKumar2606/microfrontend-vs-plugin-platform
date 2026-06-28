import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let routerSpy: { createUrlTree: ReturnType<typeof vi.fn> };
  let isAuthenticatedWritable: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    isAuthenticatedWritable = signal(false);
    routerSpy = { createUrlTree: vi.fn().mockReturnValue({ toString: () => '/login' }) };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: { isAuthenticated: isAuthenticatedWritable.asReadonly() } },
        { provide: Router, useValue: routerSpy }
      ]
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('redirects to /login when not authenticated', () => {
    guard.canActivate();
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('allows navigation when authenticated', () => {
    isAuthenticatedWritable.set(true);
    expect(guard.canActivate()).toBe(true);
  });
});
