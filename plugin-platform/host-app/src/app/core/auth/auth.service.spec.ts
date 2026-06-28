import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenResponse } from '../../models/plugin.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockResponse: TokenResponse = {
    accessToken: 'jwt.token',
    user: { id: '1', username: 'cust1', fullName: 'Jane Doe', role: 'CUSTOMER', tenantId: 'BANK01' },
    enabledPlugins: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: vi.fn() } }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sets currentUser, token, and enabledPlugins on login', () => {
    service.login({ username: 'cust1', password: 'pass', tenantId: 'BANK01' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush(mockResponse);

    expect(service.currentUser()).toEqual(mockResponse.user);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.enabledPlugins()).toEqual([]);
  });

  it('clears state on logout even if server errors', () => {
    service.login({ username: 'cust1', password: 'pass', tenantId: 'BANK01' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush(mockResponse);

    service.logout().subscribe({ error: () => {} });
    httpMock.expectOne('/api/auth/logout').flush({});

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.enabledPlugins()).toEqual([]);
  });
});
