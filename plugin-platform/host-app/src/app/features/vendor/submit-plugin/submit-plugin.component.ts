import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-submit-plugin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="padding:32px;background:var(--bg-primary);min-height:100vh">
      <div style="max-width:600px;margin:0 auto">
        <div style="margin-bottom:28px">
          <h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:var(--text-primary)">Submit Module</h1>
          <p style="margin:0;font-size:14px;color:var(--text-secondary)">Submit a new module for review and approval</p>
        </div>

        @if (success()) {
          <div style="background:var(--success-bg);border:1px solid var(--success);color:var(--success);padding:16px 20px;border-radius:8px;font-size:14px;margin-bottom:16px">
            Module submitted for review. ID: <strong>{{ submittedId() }}</strong>
          </div>
        } @else {
          <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:32px;box-shadow:var(--shadow)">
            <form (ngSubmit)="onSubmit()" style="display:flex;flex-direction:column;gap:16px">
              @for (field of fields; track field.name) {
                <div>
                  <label style="display:block;font-size:13px;font-weight:500;color:var(--text-secondary);margin-bottom:6px">{{ field.label }}</label>
                  <input [placeholder]="field.placeholder" [(ngModel)]="formData[field.name]" [name]="field.name" [required]="field.required"
                    style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:6px;background:var(--bg-primary);color:var(--text-primary);font-size:14px;outline:none;box-sizing:border-box" />
                </div>
              }
              <button type="submit" [disabled]="submitting()"
                style="padding:11px;background:var(--accent);color:white;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;margin-top:4px">
                {{ submitting() ? 'Submitting&hellip;' : 'Submit for Review' }}
              </button>
              @if (error()) { <p style="color:var(--error);font-size:13px;margin:0">{{ error() }}</p> }
            </form>
          </div>
        }
      </div>
    </div>
  `
})
export class SubmitPluginComponent {
  private readonly http = inject(HttpClient);

  formData: Record<string, string> = { name: '', version: '', bundleUrl: '', checksum: '', tagName: '', placements: 'dashboard', permissions: '' };
  submitting = signal(false);
  success = signal(false);
  error = signal('');
  submittedId = signal('');

  readonly fields = [
    { name: 'name', label: 'Module Name', placeholder: 'e.g. Balance Widget', required: true },
    { name: 'version', label: 'Version', placeholder: 'e.g. 1.0.0', required: true },
    { name: 'bundleUrl', label: 'Organization Bundle URL', placeholder: 'http://your-server/module.js', required: true },
    { name: 'checksum', label: 'SHA-256 Checksum', placeholder: 'sha256:...', required: true },
    { name: 'tagName', label: 'Custom Element Tag', placeholder: 'my-module-widget', required: true },
    { name: 'placements', label: 'Placements (comma-separated)', placeholder: 'dashboard,profile', required: false },
    { name: 'permissions', label: 'Permissions (comma-separated)', placeholder: 'auth.getToken', required: false },
  ];

  onSubmit(): void {
    this.submitting.set(true);
    this.error.set('');
    const body = {
      name: this.formData['name'], version: this.formData['version'],
      bundleUrl: this.formData['bundleUrl'], checksum: this.formData['checksum'],
      tagName: this.formData['tagName'],
      placements: this.formData['placements'].split(',').map(s => s.trim()).filter(Boolean),
      permissions: this.formData['permissions'].split(',').map(s => s.trim()).filter(Boolean)
    };
    this.http.post<{ id: string }>('/api/marketplace/plugins', body).subscribe({
      next: res => { this.submittedId.set(res.id); this.success.set(true); this.submitting.set(false); },
      error: () => { this.error.set('Submission failed. Please try again.'); this.submitting.set(false); }
    });
  }
}
