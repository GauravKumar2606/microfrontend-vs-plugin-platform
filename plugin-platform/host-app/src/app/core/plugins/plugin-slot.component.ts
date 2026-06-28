import { Component, ElementRef, OnInit, input, inject } from '@angular/core';
import { PluginLoaderService } from './plugin-loader.service';
import { PluginManifestEntry } from '../../models/plugin.models';

@Component({
  selector: 'app-plugin-slot',
  standalone: true,
  template: `<div class="plugin-slot" [attr.data-plugin-id]="plugin().id"></div>`
})
export class PluginSlotComponent implements OnInit {
  readonly plugin = input.required<PluginManifestEntry>();

  private readonly loader = inject(PluginLoaderService);
  private readonly elementRef = inject(ElementRef);

  async ngOnInit(): Promise<void> {
    await this.loader.load(this.plugin());
    const container = this.elementRef.nativeElement.querySelector('.plugin-slot');
    const webComponent = document.createElement(this.plugin().tagName);
    container.appendChild(webComponent);
  }
}
