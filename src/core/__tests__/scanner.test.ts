import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Scanner } from '..';
import * as fsPromises from 'fs/promises';
import * as pathUtils from '../../utils';
import { Dirent } from 'fs';

vi.mock('fs/promises');
vi.mock('../../utils');

describe('Scanner', () => {
  let scanner: Scanner;

  beforeEach(() => {
    scanner = new Scanner();
    vi.clearAllMocks();
  });

  describe('scan', () => {
    it('should find node_modules directories', async () => {
      const rootPath = '/project';
      const mockEntries = [
        { name: 'node_modules', isDirectory: () => true, isFile: () => false },
        { name: 'src', isDirectory: () => true, isFile: () => false },
      ] as unknown as Dirent[];

      const srcEntries = [
        { name: 'index.ts', isDirectory: () => false, isFile: () => true },
      ] as unknown as Dirent[];

      vi.mocked(fsPromises.readdir)
        .mockResolvedValueOnce(mockEntries as any)
        .mockResolvedValueOnce(srcEntries as any);

      vi.mocked(pathUtils.shouldIgnorePath).mockReturnValue(false);
      vi.mocked(pathUtils.getDirectorySize).mockResolvedValue({
        files: 10,
        bytes: 1000,
      });

      const result = await scanner.scan(rootPath, []);

      expect(result.directories).toHaveLength(1);
      expect(result.directories[0].path).toContain('node_modules');
      expect(result.directories[0].files).toBe(10);
      expect(result.ignoredCount).toBe(0);
    });

    it('should respect ignore paths', async () => {
      const rootPath = '/project';
      vi.mocked(pathUtils.shouldIgnorePath).mockReturnValue(true);

      const result = await scanner.scan(rootPath, ['ignored']);

      expect(result.directories).toHaveLength(0);
      expect(result.ignoredCount).toBe(1);
    });

    it('should handle errors during scanning', async () => {
      const rootPath = '/project';
      vi.mocked(pathUtils.shouldIgnorePath).mockReturnValue(false);
      vi.mocked(fsPromises.readdir).mockRejectedValue(
        new Error('Unexpected error')
      );
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await scanner.scan(rootPath, []);

      expect(result.directories).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not log EACCES or EPERM errors', async () => {
      const rootPath = '/project';
      vi.mocked(pathUtils.shouldIgnorePath).mockReturnValue(false);

      // Test EACCES
      vi.mocked(fsPromises.readdir).mockRejectedValueOnce(
        new Error('EACCES: permission denied')
      );
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      await scanner.scan(rootPath, []);
      expect(consoleSpy).not.toHaveBeenCalled();

      // Test EPERM
      vi.mocked(fsPromises.readdir).mockRejectedValueOnce(
        new Error('EPERM: operation not permitted')
      );
      await scanner.scan(rootPath, []);
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should call progress callback', async () => {
      const rootPath = '/project';
      const mockEntries = [
        { name: 'node_modules', isDirectory: () => true, isFile: () => false },
      ] as unknown as Dirent[];

      vi.mocked(fsPromises.readdir).mockResolvedValueOnce(mockEntries as any);
      vi.mocked(pathUtils.shouldIgnorePath).mockReturnValue(false);
      vi.mocked(pathUtils.getDirectorySize).mockResolvedValue({
        files: 1,
        bytes: 1,
      });

      const onProgress = vi.fn();
      // Mock Date.now to control progress updates
      const now = Date.now();
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(now) // constructor/init
        .mockReturnValueOnce(now + 1000); // first update

      await scanner.scan(rootPath, [], onProgress);

      expect(onProgress).toHaveBeenCalled();
      vi.restoreAllMocks();
    });
  });
});
