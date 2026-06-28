import { Component } from '@angular/core';

@Component({
  selector: 'app-onboarding-root',
  standalone: true,
  template: `
    <div style="padding:32px;background:var(--bg-primary);min-height:100vh">
      <div style="max-width:720px;margin:0 auto">
        <!-- header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px">
          <div>
            <h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:var(--text-primary)">Client Onboarding</h1>
            <p style="margin:0;font-size:14px;color:var(--text-secondary)">Complete all steps to activate a new client account</p>
          </div>
          <span style="background:var(--accent);color:white;font-size:11px;padding:4px 10px;border-radius:999px;font-weight:600;letter-spacing:0.5px">COMING SOON</span>
        </div>

        <!-- stepper -->
        <div style="display:flex;align-items:center;gap:0;margin-bottom:32px">
          @for (step of steps; track step.n; let last = $last) {
            <div style="display:flex;align-items:center;flex:1">
              <div style="display:flex;align-items:center;gap:10px">
                <div [style]="stepCircle(step.n)"
                  style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;flex-shrink:0">
                  {{ step.n }}
                </div>
                <span [style]="stepLabel(step.n)" style="font-size:13px;font-weight:500;white-space:nowrap">{{ step.label }}</span>
              </div>
              @if (!last) {
                <div style="flex:1;height:1px;background:var(--border);margin:0 12px"></div>
              }
            </div>
          }
        </div>

        <!-- step content card -->
        <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:32px;box-shadow:var(--shadow)">
          <h2 style="margin:0 0 24px;font-size:18px;font-weight:600;color:var(--text-primary)">Step 1: Client Profile</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
            @for (field of fields; track field.label) {
              <div [style]="field.full ? 'grid-column:1/-1' : ''">
                <label style="display:block;font-size:12px;font-weight:500;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">{{ field.label }}</label>
                <input [type]="field.type" [placeholder]="field.placeholder" disabled
                  style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:6px;background:var(--bg-primary);color:var(--text-secondary);font-size:14px;cursor:not-allowed;opacity:0.7" />
              </div>
            }
          </div>
          <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:28px;padding-top:24px;border-top:1px solid var(--border)">
            <button disabled style="padding:10px 20px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--text-secondary);font-size:14px;cursor:not-allowed">Previous</button>
            <button disabled style="padding:10px 20px;background:var(--accent);color:white;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:not-allowed;opacity:0.6">Next Step →</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class App {
  readonly steps = [
    { n: 1, label: 'Profile' },
    { n: 2, label: 'Documents' },
    { n: 3, label: 'Review' }
  ];

  readonly fields = [
    { label: 'Full Name', type: 'text', placeholder: 'e.g. Jane Doe', full: false },
    { label: 'Email Address', type: 'email', placeholder: 'e.g. jane@example.com', full: false },
    { label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000', full: false },
    { label: 'Date of Birth', type: 'date', placeholder: '', full: false },
    { label: 'Residential Address', type: 'text', placeholder: 'Street address', full: true },
    { label: 'Organization / Company', type: 'text', placeholder: 'Optional', full: false },
    { label: 'Account Type', type: 'text', placeholder: 'Standard / Premium', full: false },
  ];

  stepCircle(n: number): string {
    return n === 1
      ? 'background:var(--accent);color:white;'
      : 'background:var(--bg-primary);color:var(--text-secondary);border:1px solid var(--border);';
  }

  stepLabel(n: number): string {
    return n === 1 ? 'color:var(--text-primary);' : 'color:var(--text-secondary);';
  }
}

// Shell's ManifestService loads with: loadRemoteModule(appName, './Component').then(m => m.AppComponent)
export { App as AppComponent };
