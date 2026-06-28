import { Component } from '@angular/core';

@Component({
  selector: 'app-reporting-root',
  standalone: true,
  template: `
    <div style="padding:32px;background:var(--bg-primary);min-height:100vh">
      <div style="max-width:900px;margin:0 auto">
        <div style="margin-bottom:28px">
          <h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:var(--text-primary)">Analytics & Reports</h1>
          <p style="margin:0;font-size:14px;color:var(--text-secondary)">Platform metrics – last 30 days</p>
        </div>

        <!-- metric cards -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:32px">
          @for (metric of metrics; track metric.label) {
            <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:24px;box-shadow:var(--shadow)">
              <div style="font-size:12px;font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">{{ metric.label }}</div>
              <div style="font-size:32px;font-weight:700;color:var(--text-primary);margin-bottom:6px">{{ metric.value }}</div>
              <div [style]="metric.up ? 'color:var(--success)' : 'color:var(--error)'" style="font-size:12px;font-weight:500">
                {{ metric.up ? '↑' : '↓' }} {{ metric.trend }} vs last period
              </div>
            </div>
          }
        </div>

        <!-- bar chart -->
        <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:28px;box-shadow:var(--shadow)">
          <h2 style="margin:0 0 24px;font-size:16px;font-weight:600;color:var(--text-primary)">Weekly Activity</h2>
          <div style="display:flex;align-items:flex-end;gap:16px;height:140px">
            @for (bar of bars; track bar.day) {
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px">
                <span style="font-size:11px;color:var(--text-secondary)">{{ bar.value }}</span>
                <div [style]="'height:' + bar.pct + '%;background:var(--accent);border-radius:4px 4px 0 0;width:100%;min-height:4px;opacity:' + (bar.today ? '1' : '0.55')"></div>
                <span style="font-size:11px;color:var(--text-secondary)">{{ bar.day }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class App {
  readonly metrics = [
    { label: 'Total Users', value: '1,284', trend: '12%', up: true },
    { label: 'Active Sessions', value: '47', trend: '3%', up: false },
    { label: 'Completion Rate', value: '73%', trend: '8%', up: true },
  ];

  readonly bars = [
    { day: 'Mon', value: 38, pct: 54, today: false },
    { day: 'Tue', value: 52, pct: 74, today: false },
    { day: 'Wed', value: 61, pct: 87, today: false },
    { day: 'Thu', value: 45, pct: 64, today: false },
    { day: 'Fri', value: 70, pct: 100, today: false },
    { day: 'Sat', value: 29, pct: 41, today: false },
    { day: 'Sun', value: 47, pct: 67, today: true },
  ];
}

// Shell's ManifestService loads with: loadRemoteModule(appName, './Component').then(m => m.AppComponent)
export { App as AppComponent };
