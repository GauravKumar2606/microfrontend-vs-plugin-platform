import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, Routes, Component } from '@angular/router';
import { Observable, from, switchMap, tap } from 'rxjs';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { AuthGuard } from 'shared-auth';
import { UnavailableModuleComponent } from './unavailable-module.component';

@Injectable({ providedIn: 'root' })
export class ManifestService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  loadAndRegisterRoutes(): Observable<void> {
    return this.http.get<Record<string, string>>('/assets/manifest.json').pipe(
      tap(manifest => {
        const appNames = Object.keys(manifest);
        const dynamicRoutes: Routes = appNames.map(appName => ({
          path: appName,
          canActivate: [AuthGuard],
          loadComponent: () =>
            loadRemoteModule(appName, './Component')
              .then(m => m.AppComponent)
              .catch(() => {
                // Return a component factory that renders the unavailable card
                const name = appName.charAt(0).toUpperCase() + appName.slice(1);
                @Component({
                  standalone: true,
                  imports: [UnavailableModuleComponent],
                  template: `<app-unavailable-module moduleName="${name}" />`
                })
                class FallbackComponent {}
                return FallbackComponent;
              })
        }));

        const defaultApp = appNames[0] ?? 'login';
        this.router.resetConfig([
          ...dynamicRoutes,
          { path: 'login', loadComponent: () => import('../features/login/login.component').then(m => m.LoginComponent) },
          { path: '', redirectTo: `/${defaultApp}`, pathMatch: 'full' as const },
          { path: '**', redirectTo: `/${defaultApp}` }
        ]);
      }),
      switchMap(() => from(Promise.resolve()))
    );
  }
}
