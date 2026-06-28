import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ManifestService } from './manifest.service';

vi.mock('@angular-architects/native-federation', () => ({
  loadRemoteModule: vi.fn()
}));

describe('ManifestService', () => {
  let service: ManifestService;
  let httpMock: HttpTestingController;
  let routerSpy: { resetConfig: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerSpy = { resetConfig: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        ManifestService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(ManifestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('calls router.resetConfig with routes derived from manifest', () => new Promise<void>(resolve => {
    service.loadAndRegisterRoutes().subscribe(() => {
      expect(routerSpy.resetConfig).toHaveBeenCalled();
      const routes = routerSpy.resetConfig.mock.calls[0][0] as Array<{ path: string }>;
      expect(routes.some(r => r.path === 'onboarding')).toBe(true);
      resolve();
    });
    httpMock.expectOne('/assets/manifest.json').flush({ onboarding: 'https://localhost:4201/remoteEntry.json' });
  }));
});
