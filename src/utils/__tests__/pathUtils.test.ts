import { describe, it, expect, vi } from 'vitest';
import { shouldIgnorePath, getDirectorySize } from '..';
import * as fsPromises from 'fs/promises';
import { Dirent } from 'fs';

vi.mock('fs/promises');

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
      expect(shouldIgnorePath('/home/user/test/project', ignorePaths)).toBe(
        true
      );
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

  describe('getDirectorySize', () => {
    it('should calculate size of a simple directory', async () => {
      const mockEntries = [
        { name: 'file1.txt', isFile: () => true, isDirectory: () => false },
        { name: 'file2.txt', isFile: () => true, isDirectory: () => false },
      ] as unknown as Dirent[];

      vi.mocked(fsPromises.readdir).mockResolvedValueOnce(mockEntries as any);
      vi.mocked(fsPromises.stat).mockResolvedValue({
        size: 100,
      } as unknown as import('fs').Stats);

      const result = await getDirectorySize('/mock/path');
      expect(result).toEqual({ files: 2, bytes: 200 });
    });

    it('should calculate size of a nested directory', async () => {
      const rootEntries = [
        { name: 'file1.txt', isFile: () => true, isDirectory: () => false },
        { name: 'subdir', isFile: () => false, isDirectory: () => true },
      ] as unknown as Dirent[];

      const subdirEntries = [
        { name: 'file2.txt', isFile: () => true, isDirectory: () => false },
      ] as unknown as Dirent[];

      vi.mocked(fsPromises.readdir)
        .mockResolvedValueOnce(rootEntries as any)
        .mockResolvedValueOnce(subdirEntries as any);

      vi.mocked(fsPromises.stat).mockResolvedValue({
        size: 100,
      } as unknown as import('fs').Stats);

      const result = await getDirectorySize('/mock/path');
      expect(result).toEqual({ files: 2, bytes: 200 });
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(fsPromises.readdir).mockRejectedValueOnce(
        new Error('Read error')
      );
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const result = await getDirectorySize('/invalid/path');
      expect(result).toEqual({ files: 0, bytes: 0 });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle errors during file processing gracefully', async () => {
      const mockEntries = [
        { name: 'file1.txt', isFile: () => true, isDirectory: () => false },
      ] as unknown as Dirent[];

      vi.mocked(fsPromises.readdir).mockResolvedValueOnce(mockEntries as any);
      vi.mocked(fsPromises.stat).mockRejectedValueOnce(new Error('Stat error'));
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await getDirectorySize('/mock/path');
      expect(result).toEqual({ files: 0, bytes: 0 });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
