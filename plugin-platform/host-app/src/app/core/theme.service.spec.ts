import { describe, it, expect } from 'vitest';

const THEMES = ['dark', 'topnav', 'minimal'] as const;
type Theme = typeof THEMES[number];
const next = (t: Theme): Theme => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length];

describe('theme cycling logic', () => {
  it('dark -> topnav', () => expect(next('dark')).toBe('topnav'));
  it('topnav -> minimal', () => expect(next('topnav')).toBe('minimal'));
  it('minimal -> dark', () => expect(next('minimal')).toBe('dark'));
});
