import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { ThemeService } from './core/theme.service';

const ICONS: Record<string, string> = { dark: '🌙', topnav: '⊞', minimal: '○' };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (auth.isAuthenticated()) {
      @if (theme.theme() === 'dark') {
        <!-- DARK SIDEBAR -->
        <div style="display:flex;min-height:100vh">
          <aside style="width:220px;min-height:100vh;background:var(--bg-nav);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100">
            <div style="padding:24px 20px 16px;border-bottom:1px solid var(--border)">
              <div style="display:flex;align-items:center;gap:10px">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--accent)"/>
                  <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--accent)" opacity="0.5"/>
                  <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--accent)" opacity="0.5"/>
                  <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--accent)"/>
                </svg>
                <span style="color:var(--text-primary);font-weight:700;font-size:16px">Platform</span>
              </div>
            </div>
            <nav style="flex:1;padding:16px 12px;display:flex;flex-direction:column;gap:4px">
              <a routerLink="/dashboard" routerLinkActive="pp-active"
                 style="display:block;padding:10px 12px;border-radius:6px;color:var(--text-nav);text-decoration:none;font-size:14px;font-weight:500">Dashboard</a>
              @if (isAdminOrVendor()) {
                <a routerLink="/admin/marketplace" routerLinkActive="pp-active"
                   style="display:block;padding:10px 12px;border-radius:6px;color:var(--text-nav);text-decoration:none;font-size:14px;font-weight:500">Module Registry</a>
              }
              @if (isAdmin()) {
                <a routerLink="/admin/tenants" routerLinkActive="pp-active"
                   style="display:block;padding:10px 12px;border-radius:6px;color:var(--text-nav);text-decoration:none;font-size:14px;font-weight:500">Organizations</a>
              }
              @if (isVendor()) {
                <a routerLink="/vendor/submit" routerLinkActive="pp-active"
                   style="display:block;padding:10px 12px;border-radius:6px;color:var(--text-nav);text-decoration:none;font-size:14px;font-weight:500">Submit Module</a>
              }
            </nav>
            <div style="padding:16px 12px;border-top:1px solid var(--border)">
              <div style="color:var(--text-primary);font-size:13px;font-weight:500;margin-bottom:2px">{{ auth.currentUser()?.fullName }}</div>
              <div style="color:var(--text-secondary);font-size:12px;margin-bottom:12px">{{ roleLabel() }}</div>
              <button (click)="logout()" style="width:100%;background:transparent;border:1px solid var(--border);color:var(--text-nav);padding:8px;border-radius:6px;cursor:pointer;font-size:13px">Sign out</button>
            </div>
          </aside>
          <main style="flex:1;margin-left:220px;background:var(--bg-primary);min-height:100vh">
            <router-outlet />
          </main>
        </div>
      } @else {
        <!-- TOP NAV -->
        <div>
          <header style="position:fixed;top:0;left:0;right:0;height:56px;background:var(--bg-nav);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 24px;gap:20px;z-index:100;box-shadow:var(--shadow)">
            <div style="display:flex;align-items:center;gap:8px;margin-right:8px">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--accent)"/>
                <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--accent)" opacity="0.5"/>
                <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--accent)" opacity="0.5"/>
                <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--accent)"/>
              </svg>
              <span style="color:var(--text-nav);font-weight:700;font-size:15px">Platform</span>
            </div>
            <a routerLink="/dashboard" routerLinkActive="pp-top-active"
               style="color:var(--text-nav);text-decoration:none;font-size:14px;font-weight:500;padding:6px 2px;border-bottom:2px solid transparent">Dashboard</a>
            @if (isAdminOrVendor()) {
              <a routerLink="/admin/marketplace" routerLinkActive="pp-top-active"
                 style="color:var(--text-nav);text-decoration:none;font-size:14px;font-weight:500;padding:6px 2px;border-bottom:2px solid transparent">Module Registry</a>
            }
            @if (isAdmin()) {
              <a routerLink="/admin/tenants" routerLinkActive="pp-top-active"
                 style="color:var(--text-nav);text-decoration:none;font-size:14px;font-weight:500;padding:6px 2px;border-bottom:2px solid transparent">Organizations</a>
            }
            @if (isVendor()) {
              <a routerLink="/vendor/submit" routerLinkActive="pp-top-active"
                 style="color:var(--text-nav);text-decoration:none;font-size:14px;font-weight:500;padding:6px 2px;border-bottom:2px solid transparent">Submit Module</a>
            }
            <span style="flex:1"></span>
            <span style="color:var(--text-nav);font-size:13px;font-weight:500">{{ auth.currentUser()?.fullName }}</span>
            <span style="background:var(--accent);color:white;font-size:11px;padding:2px 8px;border-radius:999px;font-weight:600">{{ roleLabel() }}</span>
            <button (click)="logout()" style="background:transparent;border:1px solid var(--text-nav);color:var(--text-nav);padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px">Sign out</button>
          </header>
          <main style="padding-top:56px;background:var(--bg-primary);min-height:100vh">
            <router-outlet />
          </main>
        </div>
      }
    } @else {
      <div style="background:var(--bg-primary);min-height:100vh"><router-outlet /></div>
    }
    <button (click)="theme.cycle()" title="Switch theme"
      style="position:fixed;bottom:24px;right:24px;width:44px;height:44px;border-radius:50%;background:var(--accent);color:white;border:none;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow);z-index:200">
      {{ themeIcon() }}
    </button>
    <style>
      .pp-active { background: var(--accent) !important; color: white !important; }
      .pp-top-active { border-bottom-color: var(--accent) !important; color: var(--accent) !important; }
    </style>
  `
})
export class App {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);

  themeIcon(): string { return ICONS[this.theme.theme()]; }
  isAdmin(): boolean { return this.auth.currentUser()?.role === 'PLATFORM_ADMIN'; }
  isVendor(): boolean { return this.auth.currentUser()?.role === 'VENDOR'; }
  isAdminOrVendor(): boolean { return this.isAdmin() || this.isVendor(); }
  roleLabel(): string {
    const map: Record<string, string> = { CUSTOMER: 'USER', TELLER: 'MEMBER', PLATFORM_ADMIN: 'ADMIN', VENDOR: 'VENDOR' };
    return map[this.auth.currentUser()?.role ?? ''] ?? (this.auth.currentUser()?.role ?? '');
  }
  logout(): void { this.auth.logout().subscribe(); }
}
