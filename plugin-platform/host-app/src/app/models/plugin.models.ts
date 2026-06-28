export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'CUSTOMER' | 'TELLER' | 'ADMIN' | 'MANAGER' | 'PLATFORM_ADMIN' | 'VENDOR';
  tenantId: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  tenantId: string;
}

export interface TokenResponse {
  accessToken: string;
  user: User;
  enabledPlugins: PluginManifestEntry[];
}

export interface PluginManifestEntry {
  id: string;
  version: string;
  vendorId: string;
  bundleUrl: string;
  checksum: string;
  tagName: string;
  placements: string[];
  permissions: PluginPermission[];
}

export type PluginPermission =
  | 'auth.getToken'
  | 'auth.getCurrentUser'
  | 'navigation.navigateTo'
  | 'events.emit'
  | 'events.on'
  | 'native.camera';

export interface PluginApi {
  auth?: { getToken?: () => string | null; getCurrentUser?: () => User | null };
  navigation?: { navigateTo?: (route: string) => void };
  events?: { emit?: (type: string, payload?: unknown) => void; on?: (type: string, cb: (payload: unknown) => void) => void };
  theme: { primaryColor: string; fontFamily: string };
  native?: { isNative: () => boolean; platform: () => string };
}
