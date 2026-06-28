# Platform — Microfrontend

A reference implementation of **Module Federation** using Angular 21 and Native Federation. A central shell loads independent micro-apps at runtime without rebuilding.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Shell (port 4200)                                                          │
│  ┌────────────────────────  reads  ┌────────────────────────────────────┐   │
│  │ManifestService├─────────────────┤ /assets/manifest.json             │   │
│  └────────┬───────┘                └────────────────────────────────────┘   │
│           │ loadRemoteModule()                                              │
│  ┌────────▼──────────────────────────────────────────────────────┐         │
│  │  <router-outlet>                                              │         │
│  │   /onboarding → port 4201                                     │         │
│  │   /los        → port 4202                                     │         │
│  │   /reporting  → port 4203                                     │         │
│  └───────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
         ▲ /api/*
         │ proxy
┌────────┴──────────────────────────────────────┐
│  Backend (port 5002) — .NET 10 minimal API    │
│  JWT auth, EF Core + SQLite                   │
└────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 20+
- .NET 10 SDK
- npm 11+
- Angular CLI 21

## Start Sequence

Open **5 terminals** in order:

```powershell
# 1 — Backend (must be first)
cd microfrontend/backend
dotnet run

# 2 — Onboarding MFE
cd microfrontend/apps/onboarding
ng serve

# 3 — Application Processing MFE
cd microfrontend/apps/los
ng serve

# 4 — Analytics MFE
cd microfrontend/apps/reporting
ng serve

# 5 — Shell (open browser after this starts)
cd microfrontend/shell
ng serve
```

Open `http://localhost:4200`

## Port Map

| Service | Port |
|---|---|
| Backend (.NET) | 5002 |
| Shell | 4200 |
| Onboarding MFE | 4201 |
| LOS (Application Processing) MFE | 4202 |
| Reporting MFE | 4203 |

## Sample Users

| Username | Password | Role | Notes |
|---|---|---|---|
| `admin1` | `pass123` | ADMIN | All modules |
| `teller1` | `pass123` | MEMBER | All modules |
| `cust1` | `pass123` | USER | Limited access |

**Auth:** JWT token-based. Tenant hint `ORG01` is available but not required for login—username/password only.

## Theme Switcher

A floating button (bottom-right) cycles through three layouts:
- **Dark Sidebar** — fixed left sidebar, dark chrome
- **Top Nav** — horizontal bar, card grid, blue header  
- **Minimal** — clean white, top bar only

Preference is saved to `localStorage` and persists across sessions.

## MFE Unavailability Handling

If a remote MFE server is not running, navigating to its route shows a fallback card with a **Retry** button instead of crashing the shell. Other routes remain functional. Simply start the missing MFE and click Retry to load it.

## Running Tests

```powershell
# Shell
cd microfrontend/shell && npx vitest run

# Per MFE
cd microfrontend/apps/onboarding && npx vitest run
cd microfrontend/apps/los && npx vitest run
cd microfrontend/apps/reporting && npx vitest run

# Backend
cd microfrontend/backend && dotnet test
```

## Technology Stack

- **Frontend:** Angular 21, TypeScript, RxJS, Tailwind CSS
- **Module Federation:** @angular-architects/native-federation
- **Backend:** .NET 10 minimal API, EF Core, SQLite
- **Auth:** JWT tokens
- **Testing:** Vitest (frontend), xUnit (.NET)
