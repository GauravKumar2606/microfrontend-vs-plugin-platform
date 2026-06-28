import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface PluginRecord { id: string; name: string; version: string; vendorId: string; status: string; }

@Component({
  selector: 'app-admin-marketplace',
  standalone: true,
  template: `
    <div style="padding:32px;background:var(--bg-primary);min-height:100vh">
      <div style="max-width:900px;margin:0 auto">
        <div style="margin-bottom:28px">
          <h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:var(--text-primary)">Module Registry</h1>
          <p style="margin:0;font-size:14px;color:var(--text-secondary)">Review and approve submitted modules</p>
        </div>

        @if (loading()) {
          <div style="color:var(--text-secondary);font-size:14px">Loading&hellip;</div>
        } @else if (plugins().length === 0) {
          <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:40px;text-align:center;color:var(--text-secondary);font-size:14px">
            No modules submitted yet.
          </div>
        } @else {
          <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:var(--shadow)">
            @for (plugin of plugins(); track plugin.id; let odd = $odd) {
              <div [style]="odd ? 'background:var(--bg-primary)' : ''" style="display:flex;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border);gap:16px">
                <div style="flex:1">
                  <div style="font-size:14px;font-weight:600;color:var(--text-primary)">{{ plugin.name }}</div>
                  <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">v{{ plugin.version }} &middot; {{ plugin.vendorId }}</div>
                </div>
                <span [style]="statusStyle(plugin.status)" style="font-size:12px;padding:3px 10px;border-radius:999px;font-weight:600">{{ plugin.status }}</span>
                @if (plugin.status === 'Pending') {
                  <button (click)="approve(plugin.id)" style="padding:6px 14px;background:var(--accent);color:white;border:none;border-radius:6px;font-size:13px;cursor:pointer;font-weight:500">Approve</button>
                  <button (click)="reject(plugin.id)" style="padding:6px 14px;background:transparent;border:1px solid var(--border);color:var(--text-secondary);border-radius:6px;font-size:13px;cursor:pointer">Reject</button>
                }
              </div>
            }
          </div>
        }
        @if (error()) { <p style="color:var(--error);font-size:13px;margin-top:12px">{{ error() }}</p> }
      </div>
    </div>
  `
})
export class AdminMarketplaceComponent {
  private readonly http = inject(HttpClient);
  plugins = signal<PluginRecord[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.http.get<PluginRecord[]>('/api/admin/plugins').subscribe({
      next: data => { this.plugins.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load modules.'); this.loading.set(false); }
    });
  }

  approve(id: string): void {
    this.http.put(`/api/marketplace/plugins/${id}/approve`, {}).subscribe({
      next: () => this.plugins.update(list => list.map(p => p.id === id ? { ...p, status: 'Approved' } : p)),
      error: () => this.error.set('Approve failed.')
    });
  }

  reject(id: string): void {
    this.http.put(`/api/marketplace/plugins/${id}/reject`, {}).subscribe({
      next: () => this.plugins.update(list => list.map(p => p.id === id ? { ...p, status: 'Rejected' } : p)),
      error: () => this.error.set('Reject failed.')
    });
  }

  statusStyle(s: string): string {
    if (s === 'Approved') return 'background:var(--success-bg);color:var(--success);';
    if (s === 'Rejected') return 'background:var(--error-bg);color:var(--error);';
    return 'background:var(--warning-bg);color:var(--warning);';
  }
}
