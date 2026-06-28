import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { PluginSlotComponent } from '../../core/plugins/plugin-slot.component';
import { PluginManifestEntry } from '../../models/plugin.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PluginSlotComponent],
  template: `
    <div style="padding:32px;background:var(--bg-primary);min-height:100vh">
      <div style="max-width:1000px;margin:0 auto">
        <!-- header -->
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:32px">
          <div>
            <h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:var(--text-primary)">
              Welcome, {{ auth.currentUser()?.fullName }}
            </h1>
            <p style="margin:0;font-size:14px;color:var(--text-secondary)">
              Your active modules are shown below
            </p>
          </div>
          <span style="margin-left:auto;background:var(--accent);color:white;font-size:12px;padding:4px 12px;border-radius:999px;font-weight:600">
            {{ roleLabel() }}
          </span>
        </div>

        @if (dashboardPlugins().length === 0) {
          <!-- empty state -->
          <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:56px;text-align:center;box-shadow:var(--shadow)">
            <div style="font-size:36px;margin-bottom:12px">⬡</div>
            <h2 style="margin:0 0 8px;font-size:18px;font-weight:600;color:var(--text-primary)">No modules configured</h2>
            <p style="margin:0;font-size:14px;color:var(--text-secondary)">No modules have been assigned to your role in this view.</p>
          </div>
        } @else {
          <!-- plugin grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px">
            @for (plugin of dashboardPlugins(); track plugin.id) {
              <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:var(--shadow)">
                <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
                  <div style="width:8px;height:8px;border-radius:50%;background:var(--accent)"></div>
                  <span style="font-size:14px;font-weight:600;color:var(--text-primary)">{{ pluginTitle(plugin) }}</span>
                  <span style="margin-left:auto;font-size:11px;color:var(--text-secondary)">v{{ plugin.version }}</span>
                </div>
                <div style="padding:20px">
                  <app-plugin-slot [plugin]="plugin" />
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent {
  readonly auth = inject(AuthService);

  dashboardPlugins(): PluginManifestEntry[] {
    return this.auth.enabledPlugins().filter(p => p.placements.includes('dashboard'));
  }

  pluginTitle(plugin: PluginManifestEntry): string {
    return plugin.tagName
      .replace(/^internal-/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  roleLabel(): string {
    const map: Record<string, string> = { CUSTOMER: 'USER', TELLER: 'MEMBER', PLATFORM_ADMIN: 'ADMIN' };
    return map[this.auth.currentUser()?.role ?? ''] ?? (this.auth.currentUser()?.role ?? '');
  }
}
