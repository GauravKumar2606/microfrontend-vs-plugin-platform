import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface TenantPlugin { tenantId: string; pluginId: string; allowedRoles: string[]; }
interface PluginItem { id: string; name: string; version: string; }

@Component({
  selector: 'app-tenant-plugins',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="padding:32px;background:var(--bg-primary);min-height:100vh">
      <div style="max-width:800px;margin:0 auto">
        <div style="margin-bottom:28px">
          <h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:var(--text-primary)">Organizations</h1>
          <p style="margin:0;font-size:14px;color:var(--text-secondary)">Manage module assignments per organization</p>
        </div>

        <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:20px 24px;margin-bottom:24px;box-shadow:var(--shadow);display:flex;align-items:center;gap:12px">
          <input placeholder="Organization ID (e.g. ORG01)" [(ngModel)]="tenantId" name="tenantId"
            style="flex:1;padding:10px 14px;border:1px solid var(--border);border-radius:6px;background:var(--bg-primary);color:var(--text-primary);font-size:14px;outline:none" />
          <button (click)="load()" style="padding:10px 20px;background:var(--accent);color:white;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;white-space:nowrap">Load Org</button>
        </div>

        @if (tenantPlugins().length > 0) {
          <div style="margin-bottom:28px">
            <h2 style="font-size:16px;font-weight:600;color:var(--text-primary);margin:0 0 12px">Active Modules</h2>
            <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:var(--shadow)">
              @for (tp of tenantPlugins(); track tp.pluginId; let odd = $odd) {
                <div [style]="odd ? 'background:var(--bg-primary)' : ''" style="display:flex;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border);gap:16px">
                  <div style="flex:1">
                    <div style="font-size:14px;font-weight:600;color:var(--text-primary)">{{ tp.pluginId }}</div>
                    <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">Roles: {{ tp.allowedRoles.join(', ') }}</div>
                  </div>
                  <button (click)="deactivate(tp.pluginId)"
                    style="padding:6px 14px;background:transparent;border:1px solid var(--border);color:var(--text-secondary);border-radius:6px;font-size:13px;cursor:pointer">Remove</button>
                </div>
              }
            </div>
          </div>
        }

        @if (approvedPlugins().length > 0) {
          <div>
            <h2 style="font-size:16px;font-weight:600;color:var(--text-primary);margin:0 0 12px">Available Approved Modules</h2>
            <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:var(--shadow)">
              @for (plugin of approvedPlugins(); track plugin.id; let odd = $odd) {
                <div [style]="odd ? 'background:var(--bg-primary)' : ''" style="display:flex;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border);gap:12px">
                  <div style="flex:1">
                    <div style="font-size:14px;font-weight:600;color:var(--text-primary)">{{ plugin.name }}</div>
                    <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">v{{ plugin.version }}</div>
                  </div>
                  <input [placeholder]="'Roles (e.g. USER,ADMIN)'" [(ngModel)]="rolesInput[plugin.id]"
                    style="padding:8px 12px;border:1px solid var(--border);border-radius:6px;background:var(--bg-primary);color:var(--text-primary);font-size:13px;width:180px;outline:none" />
                  <button (click)="activate(plugin.id)"
                    style="padding:6px 14px;background:var(--accent);color:white;border:none;border-radius:6px;font-size:13px;cursor:pointer;font-weight:500">Activate</button>
                </div>
              }
            </div>
          </div>
        }

        @if (message()) {
          <p style="color:var(--accent);font-size:13px;margin-top:16px;font-weight:500">{{ message() }}</p>
        }
        @if (error()) {
          <p style="color:var(--error);font-size:13px;margin-top:12px">{{ error() }}</p>
        }
      </div>
    </div>
  `
})
export class TenantPluginsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  tenantId = 'ORG01';
  tenantPlugins = signal<TenantPlugin[]>([]);
  approvedPlugins = signal<PluginItem[]>([]);
  rolesInput: Record<string, string> = {};
  message = signal('');
  error = signal('');

  ngOnInit(): void {
    this.http.get<PluginItem[]>('/api/marketplace/plugins').subscribe(data => this.approvedPlugins.set(data));
  }

  load(): void {
    this.http.get<TenantPlugin[]>(`/api/tenants/${this.tenantId}/plugins`)
      .subscribe({
        next: data => this.tenantPlugins.set(data),
        error: () => this.error.set('Failed to load assignments.')
      });
  }

  activate(pluginId: string): void {
    const roles = (this.rolesInput[pluginId] ?? 'USER').split(',').map(r => r.trim());
    this.http.post(`/api/tenants/${this.tenantId}/plugins`, { pluginId, allowedRoles: roles }).subscribe({
      next: () => { this.message.set(`${pluginId} activated.`); this.load(); },
      error: () => this.error.set('Failed to activate.')
    });
  }

  deactivate(pluginId: string): void {
    this.http.delete(`/api/tenants/${this.tenantId}/plugins/${pluginId}`).subscribe({
      next: () => { this.message.set(`${pluginId} removed.`); this.load(); },
      error: () => this.error.set('Remove failed.')
    });
  }
}
