import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Remover } from '../remover';
import { ScanResult } from '../../types/index';
import * as fs from 'fs/promises';

vi.mock('fs/promises');

describe('Remover', () => {
  let remover: Remover;

  beforeEach(() => {
    remover = new Remover();
    vi.clearAllMocks();
  });

  describe('delete', () => {
    it('should successfully delete directories', async () => {
      const directories: ScanResult[] = [
        { path: '/path1/node_modules', files: 100, bytes: 1000 },
        { path: '/path2/node_modules', files: 200, bytes: 2000 },
      ];
      vi.mocked(fs.rm).mockResolvedValue(undefined);
      const results = await remover.delete(directories);
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].path).toBe('/path1/node_modules');
      expect(results[1].success).toBe(true);
      expect(results[1].path).toBe('/path2/node_modules');
      expect(fs.rm).toHaveBeenCalledTimes(2);
      expect(fs.rm).toHaveBeenCalledWith('/path1/node_modules', { recursive: true, force: true });
    });

    it('should handle deletion failures gracefully', async () => {
      const directories: ScanResult[] = [
        { path: '/path1/node_modules', files: 100, bytes: 1000 },
        { path: '/path2/node_modules', files: 200, bytes: 2000 },
      ];
      vi.mocked(fs.rm)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Permission denied'));
      const results = await remover.delete(directories);
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('Permission denied');
    });

    it('should handle empty directory list', async () => {
      const results = await remover.delete([]);
      expect(results).toHaveLength(0);
      expect(fs.rm).not.toHaveBeenCalled();
    });

    it('should call progress callback during deletion', async () => {
      const directories: ScanResult[] = [
        { path: '/path1/node_modules', files: 100, bytes: 1000 },
        { path: '/path2/node_modules', files: 200, bytes: 2000 },
      ];
      vi.mocked(fs.rm).mockResolvedValue(undefined);
      const progressCallback = vi.fn();
      await remover.delete(directories, progressCallback);
      expect(progressCallback).toHaveBeenCalledTimes(2);
      expect(progressCallback).toHaveBeenCalledWith(1, 2, expect.any(Array));
      expect(progressCallback).toHaveBeenCalledWith(2, 2, expect.any(Array));
    });
  });
});
