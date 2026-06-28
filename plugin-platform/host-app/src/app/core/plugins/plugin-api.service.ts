import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PluginApi, PluginManifestEntry } from '../../models/plugin.models';

@Injectable({ providedIn: 'root' })
export class PluginApiService {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  buildScopedApi(plugin: PluginManifestEntry): PluginApi {
    const api: PluginApi = {
      theme: { primaryColor: '#003087', fontFamily: 'Inter, sans-serif' }
    };

    if (plugin.permissions.includes('auth.getToken')) {
      api.auth = { ...api.auth, getToken: () => this.auth.getToken() };
    }
    if (plugin.permissions.includes('auth.getCurrentUser')) {
      api.auth = { ...api.auth, getCurrentUser: () => this.auth.currentUser() };
    }
    if (plugin.permissions.includes('navigation.navigateTo')) {
      api.navigation = { navigateTo: (route: string) => this.router.navigate([route]) };
    }

    api.native = {
      isNative: () => (window as unknown as Record<string, unknown>)['Capacitor'] !== undefined,
      platform: () => {
        const cap = (window as unknown as Record<string, unknown>)['Capacitor'] as Record<string, unknown> | undefined;
        return (cap?.['getPlatform'] as (() => string) | undefined)?.() ?? 'web';
      }
    };

    return api;
  }

  injectApiForPlugin(plugin: PluginManifestEntry): void {
    (window as unknown as Record<string, unknown>)[`__api_${plugin.id}`] = this.buildScopedApi(plugin);
  }
}
