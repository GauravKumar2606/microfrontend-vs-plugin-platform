import { describe, it, expect, beforeEach } from 'vitest';

const THEMES = ['dark', 'topnav', 'minimal'] as const;
type Theme = typeof THEMES[number];

function nextTheme(current: Theme): Theme {
  return THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
}

describe('theme cycling logic', () => {
  it('dark -> topnav', () => expect(nextTheme('dark')).toBe('topnav'));
  it('topnav -> minimal', () => expect(nextTheme('topnav')).toBe('minimal'));
  it('minimal -> dark', () => expect(nextTheme('minimal')).toBe('dark'));
});
