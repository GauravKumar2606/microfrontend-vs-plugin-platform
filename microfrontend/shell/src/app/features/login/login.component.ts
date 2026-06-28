import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'shared-auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="min-height:100vh;background:var(--bg-primary);display:flex;align-items:center;justify-content:center;padding:24px">
      <div style="width:100%;max-width:400px">
        <!-- logo + wordmark -->
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;justify-content:center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--accent)"/>
            <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--accent)" opacity="0.5"/>
            <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--accent)" opacity="0.5"/>
            <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--accent)"/>
          </svg>
          <span style="font-size:24px;font-weight:700;color:var(--text-primary);letter-spacing:-0.5px">Platform</span>
        </div>
        <!-- card -->
        <div style="background:var(--bg-surface);border-radius:12px;box-shadow:var(--shadow);border:1px solid var(--border);overflow:hidden">
          <div style="height:4px;background:var(--accent)"></div>
          <div style="padding:32px">
            <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:var(--text-primary)">Welcome back</h1>
            <p style="margin:0 0 28px;font-size:14px;color:var(--text-secondary)">Sign in to your account to continue</p>

            @if (errorMessage()) {
              <div style="background:var(--bg-surface);border-left:3px solid var(--error);color:var(--error);padding:10px 14px;border-radius:6px;font-size:13px;margin-bottom:20px">
                {{ errorMessage() }}
              </div>
            }

            <form (ngSubmit)="onSubmit()" style="display:flex;flex-direction:column;gap:16px">
              <div>
                <label style="display:block;font-size:13px;font-weight:500;color:var(--text-secondary);margin-bottom:6px">Username</label>
                <input type="text" [(ngModel)]="username" name="username" required autocomplete="username"
                  style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:6px;background:var(--bg-primary);color:var(--text-primary);font-size:14px;outline:none;transition:border-color 0.15s"
                  placeholder="Enter your username" />
              </div>
              <div>
                <label style="display:block;font-size:13px;font-weight:500;color:var(--text-secondary);margin-bottom:6px">Password</label>
                <input type="password" [(ngModel)]="password" name="password" required autocomplete="current-password"
                  style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:6px;background:var(--bg-primary);color:var(--text-primary);font-size:14px;outline:none;transition:border-color 0.15s"
                  placeholder="Enter your password" />
              </div>
              <button type="submit" [disabled]="loading()"
                style="width:100%;padding:11px;background:var(--accent);color:white;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;transition:background 0.15s;margin-top:4px">
                {{ loading() ? 'Signing inâ€¦' : 'Sign In' }}
              </button>
            </form>

            <!-- demo credentials collapsible -->
            <details style="margin-top:20px">
              <summary style="font-size:12px;color:var(--text-secondary);cursor:pointer;user-select:none">Demo credentials</summary>
              <div style="margin-top:10px;padding:12px;background:var(--bg-primary);border-radius:6px;border:1px solid var(--border);font-size:12px;color:var(--text-secondary)">
                <div style="margin-bottom:6px"><strong style="color:var(--text-primary)">teller1</strong> / pass123 â€" Member</div>
                <div><strong style="color:var(--text-primary)">admin1</strong> / pass123 â€" Admin</div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  onSubmit(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => { this.errorMessage.set('Invalid username or password.'); this.loading.set(false); }
    });
  }
}
