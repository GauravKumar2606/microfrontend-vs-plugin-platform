import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PluginApiService } from './plugin-api.service';
import { AuthService } from '../auth/auth.service';
import { PluginManifestEntry } from '../../models/plugin.models';

describe('PluginApiService', () => {
  let service: PluginApiService;

  const plugin: PluginManifestEntry = {
    id: 'loan-calc', version: '1.0.0', vendorId: 'vendor-a',
    bundleUrl: 'https://vendor.com/plugin.js', checksum: 'sha256:abc',
    tagName: 'vendor-a-loan-calc', placements: ['dashboard'],
    permissions: ['auth.getCurrentUser', 'navigation.navigateTo']
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PluginApiService,
        { provide: AuthService, useValue: { getToken: () => 'tok', currentUser: () => null } },
        { provide: Router, useValue: { navigate: vi.fn() } }
      ]
    });
    service = TestBed.inject(PluginApiService);
  });

  it('exposes only declared permissions in scoped API', () => {
    const api = service.buildScopedApi(plugin);
    expect(api.auth?.getCurrentUser).toBeDefined();
    expect(api.navigation?.navigateTo).toBeDefined();
    expect(api.auth?.getToken).toBeUndefined();
  });

  it('always includes theme regardless of permissions', () => {
    const api = service.buildScopedApi(plugin);
    expect(api.theme).toBeDefined();
  });

  it('injects scoped api onto window keyed by plugin id', () => {
    service.injectApiForPlugin(plugin);
    expect((window as unknown as Record<string, unknown>)['__api_loan-calc']).toBeDefined();
  });
});
