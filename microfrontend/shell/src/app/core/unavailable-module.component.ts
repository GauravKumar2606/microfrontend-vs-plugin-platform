import { Component, input } from '@angular/core';

@Component({
  selector: 'app-unavailable-module',
  standalone: true,
  template: `
    <div style="padding:40px;display:flex;justify-content:center">
      <div style="max-width:480px;width:100%;background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:40px;text-align:center">
        <div style="font-size:40px;margin-bottom:16px">⚠️</div>
        <h2 style="margin:0 0 8px;font-size:18px;font-weight:600;color:var(--text-primary)">{{ moduleName() }} Unavailable</h2>
        <p style="margin:0 0 24px;font-size:14px;color:var(--text-secondary);line-height:1.5">
          This module is currently unavailable. Please try again later.
        </p>
        <button (click)="retry()"
          style="background:var(--accent);color:white;border:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer">
          Retry
        </button>
      </div>
    </div>
  `
})
export class UnavailableModuleComponent {
  readonly moduleName = input<string>('Module');
  retry(): void { window.location.reload(); }
}
