import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenResponse } from '../models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sets currentUser and token on successful login', () => {
    const mockResponse: TokenResponse = {
      accessToken: 'jwt.token.here',
      user: { id: '1', username: 'teller1', fullName: 'John Doe', role: 'TELLER', branchCode: 'BR01' }
    };

    service.login({ username: 'teller1', password: 'pass' }).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    req.flush(mockResponse);

    expect(service.currentUser()).toEqual(mockResponse.user);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('clears state on logout', () => {
    service.login({ username: 'teller1', password: 'pass' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush({
      accessToken: 'tok', user: { id: '1', username: 'u', fullName: 'U', role: 'TELLER', branchCode: 'BR01' }
    });

    service.logout().subscribe();
    httpMock.expectOne('/api/auth/logout').flush({});

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);

  });

  it('updates user and token on refreshToken', () => {
    const refreshResponse: TokenResponse = {
      accessToken: 'new.jwt.token',
      user: { id: '1', username: 'teller1', fullName: 'John Doe', role: 'TELLER', branchCode: 'BR01' }
    };

    service.refreshToken().subscribe();

    const req = httpMock.expectOne('/api/auth/refresh');
    req.flush(refreshResponse);

    expect(service.currentUser()).toEqual(refreshResponse.user);
    expect(service.isAuthenticated()).toBe(true);
  });
});
