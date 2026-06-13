import { describe, it, expect } from 'vitest';
import { settings } from '..';

describe('Settings', () => {
  it('should have default settings', () => {
    expect(settings).toBeDefined();
    expect(settings.scanPath).toBeDefined();
    expect(settings.ignorePaths).toBeInstanceOf(Array);
    expect(typeof settings.dryRun).toBe('boolean');
  });
});
