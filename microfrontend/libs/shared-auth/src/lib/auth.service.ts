import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, finalize, tap } from 'rxjs';
import { LoginCredentials, TokenResponse, User } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private _currentUser = signal<User | null>(null);
  private _token = signal<string | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  login(credentials: LoginCredentials): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/api/auth/login', credentials).pipe(
      tap(response => {
        this._token.set(response.accessToken);
        this._currentUser.set(response.user);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      finalize(() => {
        this._token.set(null);
        this._currentUser.set(null);
        this.router.navigate(['/login']);
      })
    );
  }

  getToken(): string | null {
    return this._token();
  }

  refreshToken(): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/api/auth/refresh', {}).pipe(
      tap(response => {
        this._token.set(response.accessToken);
        this._currentUser.set(response.user);
      })
    );
  }
}
