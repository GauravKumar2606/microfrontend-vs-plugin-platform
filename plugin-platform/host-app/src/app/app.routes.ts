import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', canActivate: [AuthGuard], loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'admin/marketplace', canActivate: [AuthGuard], loadComponent: () => import('./features/admin/marketplace/admin-marketplace.component').then(m => m.AdminMarketplaceComponent) },
  { path: 'admin/tenants', canActivate: [AuthGuard], loadComponent: () => import('./features/admin/tenant-plugins/tenant-plugins.component').then(m => m.TenantPluginsComponent) },
  { path: 'vendor/submit', canActivate: [AuthGuard], loadComponent: () => import('./features/vendor/submit-plugin/submit-plugin.component').then(m => m.SubmitPluginComponent) },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
