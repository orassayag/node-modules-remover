import { describe, it, expect } from 'vitest';
import { shouldIgnorePath } from '../pathUtils';

describe('pathUtils', () => {
  describe('shouldIgnorePath', () => {
    it('should return false when no ignore patterns are provided', () => {
      expect(shouldIgnorePath('/some/path', [])).toBe(false);
    });

    it('should return true when path contains ignore pattern', () => {
      const ignorePaths = ['Project A'];
      expect(shouldIgnorePath('/foo/Project A/bar', ignorePaths)).toBe(true);
    });

    it('should be case insensitive', () => {
      const ignorePaths = ['project a'];
      expect(shouldIgnorePath('/foo/Project A/bar', ignorePaths)).toBe(true);
    });

    it('should match pattern anywhere in path', () => {
      const ignorePaths = ['test'];
      expect(shouldIgnorePath('/home/user/test/project', ignorePaths)).toBe(true);
      expect(shouldIgnorePath('/home/testing/project', ignorePaths)).toBe(true);
    });

    it('should return false when path does not contain pattern', () => {
      const ignorePaths = ['Project A'];
      expect(shouldIgnorePath('/foo/Project B/bar', ignorePaths)).toBe(false);
    });

    it('should match any of multiple patterns', () => {
      const ignorePaths = ['Project A', 'Project B'];
      expect(shouldIgnorePath('/foo/Project A/bar', ignorePaths)).toBe(true);
      expect(shouldIgnorePath('/foo/Project B/bar', ignorePaths)).toBe(true);
      expect(shouldIgnorePath('/foo/Project C/bar', ignorePaths)).toBe(false);
    });
  });
});
