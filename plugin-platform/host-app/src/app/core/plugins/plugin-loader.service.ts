import { Injectable, inject } from '@angular/core';
import { PluginApiService } from './plugin-api.service';
import { PluginManifestEntry } from '../../models/plugin.models';

@Injectable({ providedIn: 'root' })
export class PluginLoaderService {
  private readonly pluginApi = inject(PluginApiService);
  private readonly loaded = new Set<string>();

  async load(plugin: PluginManifestEntry): Promise<void> {
    if (this.loaded.has(plugin.id)) return;

    this.pluginApi.injectApiForPlugin(plugin);

    const code = await this.fetchAndVerify(plugin.bundleUrl, plugin.checksum);

    await this.executeBundle(code);

    this.loaded.add(plugin.id);
  }

  protected async executeBundle(code: string): Promise<void> {
    const blob = new Blob([code], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    await import(/* @vite-ignore */ url);
    URL.revokeObjectURL(url);
  }

  private async fetchAndVerify(bundleUrl: string, expectedChecksum: string): Promise<string> {
    const response = await fetch(bundleUrl);
    if (!response.ok) throw new Error(`Failed to fetch plugin bundle: ${bundleUrl}`);
    const text = await response.text();
    await this.verifyChecksum(text, expectedChecksum);
    return text;
  }

  private async verifyChecksum(text: string, expectedChecksum: string): Promise<void> {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashHex = 'sha256:' + Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    if (hashHex !== expectedChecksum) {
      throw new Error(`Plugin checksum mismatch. Expected: ${expectedChecksum}, got: ${hashHex}`);
    }
  }
}
