import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PluginSlotComponent } from './plugin-slot.component';
import { PluginLoaderService } from './plugin-loader.service';
import { PluginManifestEntry } from '../../models/plugin.models';

describe('PluginSlotComponent', () => {
  let fixture: ComponentFixture<PluginSlotComponent>;
  let loaderSpy: { load: ReturnType<typeof vi.fn> };

  const plugin: PluginManifestEntry = {
    id: 'loan-calc', version: '1.0.0', vendorId: 'v1',
    bundleUrl: 'https://vendor.com/plugin.js', checksum: 'sha256:abc',
    tagName: 'v1-loan-calc', placements: ['dashboard'], permissions: []
  };

  beforeEach(async () => {
    loaderSpy = { load: vi.fn().mockResolvedValue(undefined) };

    await TestBed.configureTestingModule({
      imports: [PluginSlotComponent],
      providers: [{ provide: PluginLoaderService, useValue: loaderSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(PluginSlotComponent);
    fixture.componentRef.setInput('plugin', plugin);
  });

  it('calls loader.load with the plugin on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(loaderSpy.load).toHaveBeenCalledWith(plugin);
  });

  it('renders the plugin tag name in the container', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('v1-loan-calc')).toBeTruthy();
  });
});
