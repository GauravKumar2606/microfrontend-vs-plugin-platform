import { Component } from '@angular/core';

interface Application {
  id: string; applicant: string; type: string; submitted: string;
  status: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
}

@Component({
  selector: 'app-los-root',
  standalone: true,
  template: `
    <div style="padding:32px;background:var(--bg-primary);min-height:100vh">
      <div style="max-width:900px;margin:0 auto">
        <!-- header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
          <div>
            <h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:var(--text-primary)">Application Processing</h1>
            <p style="margin:0;font-size:14px;color:var(--text-secondary)">Review and manage submitted applications</p>
          </div>
          <button disabled style="padding:10px 18px;background:var(--accent);color:white;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:not-allowed;opacity:0.7">+ New Application</button>
        </div>

        <!-- stat pills -->
        <div style="display:flex;gap:12px;margin-bottom:28px;flex-wrap:wrap">
          @for (stat of stats; track stat.label) {
            <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:8px;padding:14px 20px;min-width:120px">
              <div style="font-size:22px;font-weight:700;color:var(--text-primary)">{{ stat.value }}</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">{{ stat.label }}</div>
            </div>
          }
        </div>

        <!-- table -->
        <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:var(--shadow)">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:var(--bg-primary);border-bottom:1px solid var(--border)">
                <th style="padding:12px 20px;text-align:left;font-size:12px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">ID</th>
                <th style="padding:12px 20px;text-align:left;font-size:12px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">Applicant</th>
                <th style="padding:12px 20px;text-align:left;font-size:12px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">Type</th>
                <th style="padding:12px 20px;text-align:left;font-size:12px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">Submitted</th>
                <th style="padding:12px 20px;text-align:left;font-size:12px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (app of applications; track app.id; let odd = $odd) {
                <tr [style]="odd ? 'background:var(--bg-primary)' : ''">
                  <td style="padding:14px 20px;font-size:13px;color:var(--text-secondary);font-family:monospace">{{ app.id }}</td>
                  <td style="padding:14px 20px;font-size:14px;color:var(--text-primary);font-weight:500">{{ app.applicant }}</td>
                  <td style="padding:14px 20px;font-size:13px;color:var(--text-secondary)">{{ app.type }}</td>
                  <td style="padding:14px 20px;font-size:13px;color:var(--text-secondary)">{{ app.submitted }}</td>
                  <td style="padding:14px 20px"><span [style]="badgeStyle(app.status)" style="font-size:12px;padding:3px 10px;border-radius:999px;font-weight:600">{{ app.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class App {
  readonly stats = [
    { value: '24', label: 'Total' },
    { value: '8', label: 'Pending' },
    { value: '11', label: 'In Review' },
    { value: '5', label: 'Approved' },
  ];

  readonly applications: Application[] = [
    { id: 'APP-0041', applicant: 'Sarah Mitchell', type: 'Personal', submitted: '2026-06-18', status: 'In Review' },
    { id: 'APP-0040', applicant: 'James Okafor', type: 'Business', submitted: '2026-06-17', status: 'Pending' },
    { id: 'APP-0039', applicant: 'Priya Sharma', type: 'Personal', submitted: '2026-06-15', status: 'Approved' },
    { id: 'APP-0038', applicant: 'Carlos Reyes', type: 'Enterprise', submitted: '2026-06-14', status: 'Rejected' },
  ];

  badgeStyle(status: string): string {
    const map: Record<string, string> = {
      Pending:   'background:#fef3c7;color:#92400e;',
      'In Review': 'background:#dbeafe;color:#1e40af;',
      Approved:  'background:#d1fae5;color:#065f46;',
      Rejected:  'background:#fee2e2;color:#991b1b;',
    };
    return map[status] ?? '';
  }
}

export { App as AppComponent };
