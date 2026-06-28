# Platform — Plugin System

A reference implementation of a **runtime plugin platform** using Angular 21 and Web Components. A host app loads vendor-supplied modules (custom elements) at runtime after admin approval, with per-tenant activation.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Host App (port 4200)                                                    │
│                                                                          │
│  Login → JWT → enabledPlugins[]                                         │
│                     │                                                   │
│  PluginLoaderService.load(plugin)                                       │
│    ├── fetch(bundleUrl)   ◄── Plugin Server (port 4300)               │
│    ├── SHA-256 verify                                                  │
│    └── import(blob) → customElements.define(tagName)                   │
│                     │                                                   │
│  <app-plugin-slot> stamps <tagName> into DOM                           │
│  window.__api_<id> provides scoped host API                            │
└──────────────────────────────────────────────────────────────────────────┘
         ▲ /api/*
         │ proxy
┌────────┴──────────────────────────────────────────────────────┐
│  Backend (port 5170) — .NET 10, SQLite                        │
│  Endpoints: auth, plugins, marketplace,                       │
│  tenant activation                                            │
└───────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 20+
- .NET 10 SDK
- npm 11+

## Start Sequence

Open **3 terminals** in order:

```powershell
# 1 – Backend (must be first)
cd plugin-platform/backend
dotnet run --launch-profile http     # :5170

# 2 – Sample module server
cd plugin-platform/sample-plugin
npx http-server . -p 4300 --cors     # :4300

# 3 – Host app
cd plugin-platform/host-app
npm start                             # :4200
```

Open `http://localhost:4200`

## Port Map

| Service | Port |
|---|---|
| Backend (.NET) | 5170 |
| Host App (Angular) | 4200 |
| Plugin Bundle Server | 4300 |

## Sample Users

All users belong to Organization **ORG01**.

| Username | Password | Role (display) | Capabilities |
|---|---|---|---|
| `cust1` | `pass123` | USER | View dashboard modules |
| `teller1` | `pass123` | MEMBER | View dashboard modules |
| `admin1` | `pass123` | ADMIN | Module Registry, Organizations |

## Theme Switcher

Floating button (bottom-right) cycles: Dark Sidebar → Top Nav Cards → Minimal.

## Writing a Plugin

A plugin is a vanilla JS (or any framework compiled to) Web Component:

```javascript
// src/index.js
class MyWidget extends HTMLElement {
  connectedCallback() {
    const api = window['__api_my-widget'];        // scoped host API
    const user = api?.auth?.getCurrentUser?.();
    this.innerHTML = `<div>Hello ${user?.fullName}</div>`;
  }
}
customElements.define('my-widget', MyWidget);
```

Then submit via the **Submit Module** page with:
- Bundle URL pointing to your JS file (hosted on port 4300 or external CDN)
- SHA-256 checksum (`sha256:…`)
- Tag name matching `customElements.define(…)`
- Specify `allowedRoles` (e.g., `CUSTOMER`, `TELLER`, `PLATFORM_ADMIN`)

An ADMIN must approve before it activates for any organization.

## Running Tests

```powershell
cd plugin-platform/host-app && npx vitest run
```
