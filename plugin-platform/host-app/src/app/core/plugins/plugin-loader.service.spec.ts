import { TestBed } from '@angular/core/testing';
import { PluginLoaderService } from './plugin-loader.service';
import { PluginApiService } from './plugin-api.service';
import { PluginManifestEntry } from '../../models/plugin.models';

describe('PluginLoaderService', () => {
  let service: PluginLoaderService;
  let apiSpy: { injectApiForPlugin: ReturnType<typeof vi.fn> };

  const plugin: PluginManifestEntry = {
    id: 'test-plugin', version: '1.0.0', vendorId: 'v1',
    bundleUrl: 'https://vendor.com/plugin.js',
    checksum: 'sha256:abc123', tagName: 'v1-test-plugin',
    placements: ['dashboard'], permissions: []
  };

  beforeEach(() => {
    apiSpy = { injectApiForPlugin: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        PluginLoaderService,
        { provide: PluginApiService, useValue: apiSpy }
      ]
    });
    service = TestBed.inject(PluginLoaderService);
  });

  it('does not load the same plugin twice', async () => {
    vi.spyOn(service as any, 'fetchAndVerify').mockResolvedValue('class X extends HTMLElement{}; customElements.define("v1-test-plugin-a",X)');
    vi.spyOn(service as any, 'executeBundle').mockResolvedValue(undefined);
    const p = { ...plugin, id: 'test-plugin-a', tagName: 'v1-test-plugin-a' };
    await service.load(p);
    await service.load(p);
    expect((service as any).fetchAndVerify).toHaveBeenCalledTimes(1);
  });

  it('injects scoped API before loading bundle', async () => {
    vi.spyOn(service as any, 'fetchAndVerify').mockResolvedValue('class X extends HTMLElement{}; customElements.define("v1-test-plugin-b",X)');
    vi.spyOn(service as any, 'executeBundle').mockResolvedValue(undefined);
    const p = { ...plugin, id: 'test-plugin-b', tagName: 'v1-test-plugin-b' };
    await service.load(p);
    expect(apiSpy.injectApiForPlugin).toHaveBeenCalledWith(p);
  });
});
