import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, finalize, tap } from 'rxjs';
import { LoginCredentials, PluginManifestEntry, TokenResponse, User } from '../../models/plugin.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private _currentUser = signal<User | null>(null);
  private _token = signal<string | null>(null);
  private _enabledPlugins = signal<PluginManifestEntry[]>([]);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly enabledPlugins = this._enabledPlugins.asReadonly();

  login(credentials: LoginCredentials): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/api/auth/login', credentials).pipe(
      tap(response => {
        this._token.set(response.accessToken);
        this._currentUser.set(response.user);
        this._enabledPlugins.set(response.enabledPlugins);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      finalize(() => {
        this._token.set(null);
        this._currentUser.set(null);
        this._enabledPlugins.set([]);
        this.router.navigate(['/login']);
      })
    );
  }

  getToken(): string | null {
    return this._token();
  }
}
