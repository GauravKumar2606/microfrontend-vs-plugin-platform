# Platform UI Overhaul — Design Spec
**Date:** 2026-06-21  
**Scope:** Both projects — `microfrontend/` and `plugin-platform/`  
**Status:** Approved

---

## 1. Brand & Terminology

All references to "banking", "bank", "BANK01", "loan", "teller", "customer" in UI labels are replaced with neutral terms. Code internals (variable names, route names) are unchanged.

| Old UI Text | New UI Text |
|---|---|
| Banking Portal / Banking Platform | Platform |
| Customer Onboarding | Client Onboarding |
| Loan Origination System | Application Processing |
| BANK01 (tenant hint) | ORG01 |
| CUSTOMER role label | USER |
| TELLER role label | MEMBER |
| PLATFORM_ADMIN role label | ADMIN |
| "Banking Portal Login" | "Welcome back" |

---

## 2. Theme System

### 2.1 Mechanism
- CSS custom properties on `<html>` element, toggled by class: `theme-dark` / `theme-topnav` / `theme-minimal`
- A single `ThemeService` per project (not shared library — each project is independent)
- Persists selection to `localStorage` key `"pp-theme"`
- Applied in `main.ts` before app bootstrap to avoid flash

### 2.2 Token Map

| Token | Dark Sidebar | Top Nav Cards | Minimal |
|---|---|---|---|
| `--bg-primary` | `#0f1117` | `#f0f4f8` | `#ffffff` |
| `--bg-surface` | `#1a1d27` | `#ffffff` | `#fafafa` |
| `--bg-nav` | `#13151e` | `#1e40af` | `#ffffff` |
| `--text-primary` | `#e2e8f0` | `#1e293b` | `#111827` |
| `--text-secondary` | `#64748b` | `#64748b` | `#6b7280` |
| `--text-nav` | `#94a3b8` | `#e0f2fe` | `#374151` |
| `--accent` | `#6366f1` | `#3b82f6` | `#6366f1` |
| `--accent-hover` | `#4f46e5` | `#2563eb` | `#4f46e5` |
| `--border` | `#2d3148` | `#e2e8f0` | `#e5e7eb` |
| `--shadow` | `0 2px 8px rgba(0,0,0,0.4)` | `0 2px 8px rgba(0,0,0,0.08)` | `0 1px 3px rgba(0,0,0,0.06)` |

### 2.3 Layout per Theme

| Theme | Nav Position | Nav Width/Height | Content |
|---|---|---|---|
| Dark Sidebar | Left, fixed | 220px wide | Right of sidebar, scrollable |
| Top Nav Cards | Top, fixed | 56px tall | Full width below nav, card grid |
| Minimal | Top, fixed | 52px tall, no fill | Full width, white panels |

### 2.4 Floating Theme Toggle
- Fixed position: `bottom: 24px; right: 24px`
- Circular button 44px, `--accent` background
- Icon cycles: 🌙 (dark) → ⊞ (topnav) → ○ (minimal)
- Renders in app shell (not in individual MFEs)

---

## 3. Microfrontend Project

### 3.1 Shell — Login
- Centered card 400px, vertical center
- Left accent bar (4px `--accent`)
- "Platform" wordmark (bold, 28px) above form
- Username + Password fields with visible labels above inputs
- Full-width "Sign In" button
- Collapsible "Demo credentials" section below button
- Inline error banner inside card

### 3.2 Shell — Nav (adaptive per theme)
- **Dark Sidebar:** Logo + "Platform" text top; Onboarding / Application Processing / Analytics links with simple icons; user name + role badge + Logout at bottom
- **Top Nav / Minimal:** Horizontal bar; logo left; same 3 links center; user name + role + Logout right
- Active link highlighted with `--accent` background (sidebar) or underline (top nav)
- Nav hidden on `/login` route

### 3.3 MFE Unavailability Card
- `ManifestService.loadAndRegisterRoutes()` wraps `loadRemoteModule` in try/catch per app
- Fallback component rendered inline: grey card, ⚠️ icon, module name, "This module is currently unavailable. Please try again later.", "Retry" button that calls `location.reload()`
- No app crash; other routes unaffected

### 3.4 MFE — Client Onboarding (port 4201)
- 3-step wizard header (Step 1: Profile · Step 2: Documents · Step 3: Review)
- Step 1 shown active; steps 2/3 greyed out
- Mock form: Full Name, Email, Phone fields (disabled/readonly)
- "Coming Soon" badge top-right
- Professional card container with `--bg-surface`

### 3.5 MFE — Application Processing (port 4202, was LOS)
- Page title: "Application Processing"
- "New Application" button (top right, `--accent`)
- Table with 4 mock rows: ID, Applicant, Type, Submitted, Status
- Status badges: Pending (yellow), In Review (blue), Approved (green), Rejected (red)
- Table styled with `--border` and `--bg-surface`

### 3.6 MFE — Analytics & Reports (port 4203, was Reporting)
- Page title: "Analytics & Reports"
- 3 metric cards: Total Users (1,284), Active Sessions (47), Completion Rate (73%)
- Each card: large number, label, small trend indicator (↑ or ↓)
- CSS bar chart below: 5 bars representing weekly data, using `--accent`

---

## 4. Plugin Platform Project

### 4.1 Login
- Same card design as shell login (consistent cross-project)
- Fields: Organization ID (pre-filled "ORG01"), Username, Password
- "Demo credentials" collapsible hint
- On success → `/dashboard`

### 4.2 Dashboard
- "Welcome, {fullName}" header with role badge
- Plugin cards in 2-column responsive grid
- Each card: module name derived from tag name, `--bg-surface` background, `--shadow`
- Rendered plugin (`<plugin-slot>`) inside card body
- Empty state card: "No modules configured for this view"

### 4.3 Nav — All Themes
- Same 3-theme adaptive nav as microfrontend shell
- Links: Dashboard (all roles), Marketplace (USER/MEMBER), Submit Plugin (VENDOR), Admin (ADMIN)
- User name + role badge + Logout button
- Logout: calls `AuthService.logout()`, clears state, navigates to `/login`

### 4.4 Terminology Cleanup
- All remaining "Banking" / "Bank" / "bank" UI text replaced
- Marketplace page title: "Module Marketplace" (was "Plugin Marketplace" with banking copy)
- Submit Plugin form: "Organization Bundle URL" placeholder instead of "Bundle URL (HTTPS)"
- Admin page: "Module Registry" (was "Admin Marketplace")
- Tenant references in UI: "Organization" / "Org"

---

## 5. Documentation

### 5.1 `microfrontend/README.md`
Sections: Overview, Architecture (ASCII diagram), Prerequisites, Start Sequence, Port Map, Sample Users, Theme Switcher usage

### 5.2 `plugin-platform/README.md`
Sections: Overview, Architecture (ASCII diagram), Prerequisites, Start Sequence, Port Map, Sample Users, Plugin Development guide (how to write a plugin)

### 5.3 `COMPARISON.md` (repo root)
Structure:
1. Quick reference table (one row per dimension)
2. When to use each project
3. Architecture diagrams (mermaid)
4. Feature matrix (20+ rows)
5. Trade-offs (pros/cons)
6. Side-by-side code examples

---

## 6. Out of Scope
- Backend changes
- Real authentication / database changes
- Mobile-specific layouts (responsive down to 768px tablet only)
- Actual plugin SDK documentation
