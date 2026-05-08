import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StatisticsCollector } from '../statistics';
import { ScanResult, DeleteResult } from '../../types/index';

describe('StatisticsCollector', () => {
  let statisticsCollector: StatisticsCollector;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    statisticsCollector = new StatisticsCollector();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('aggregate', () => {
    it('should aggregate statistics correctly', () => {
      const scanResults: ScanResult[] = [
        { path: '/path1', files: 100, bytes: 1000000 },
        { path: '/path2', files: 200, bytes: 2000000 },
      ];
      const deleteResults: DeleteResult[] = [
        { success: true, path: '/path1' },
        { success: true, path: '/path2' },
      ];
      const stats = statisticsCollector.aggregate(scanResults, deleteResults, 0);
      expect(stats.totalDirectories).toBe(2);
      expect(stats.totalFiles).toBe(300);
      expect(stats.totalBytes).toBe(3000000);
      expect(stats.totalIgnored).toBe(0);
      expect(stats.deletedDirectories).toBe(2);
      expect(stats.failedDeletions).toBe(0);
    });

    it('should handle failed deletions', () => {
      const scanResults: ScanResult[] = [
        { path: '/path1', files: 100, bytes: 1000000 },
        { path: '/path2', files: 200, bytes: 2000000 },
      ];
      const deleteResults: DeleteResult[] = [
        { success: true, path: '/path1' },
        { success: false, path: '/path2', error: 'Permission denied' },
      ];
      const stats = statisticsCollector.aggregate(scanResults, deleteResults, 1);
      expect(stats.deletedDirectories).toBe(1);
      expect(stats.failedDeletions).toBe(1);
      expect(stats.totalIgnored).toBe(1);
    });

    it('should handle empty results', () => {
      const stats = statisticsCollector.aggregate([], [], 0);
      expect(stats.totalDirectories).toBe(0);
      expect(stats.totalFiles).toBe(0);
      expect(stats.totalBytes).toBe(0);
      expect(stats.deletedDirectories).toBe(0);
      expect(stats.failedDeletions).toBe(0);
    });
  });

  describe('display', () => {
    it('should display statistics in correct format', () => {
      const stats = {
        totalDirectories: 58,
        totalFiles: 84543554,
        totalBytes: 6089740000,
        totalIgnored: 0,
        deletedDirectories: 58,
        failedDeletions: 0,
      };
      statisticsCollector.display(stats);
      expect(consoleLogSpy).toHaveBeenCalledWith('===DIRECTORIES: 58===');
      expect(consoleLogSpy).toHaveBeenCalledWith('===FILES: 84,543,554===');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('===SIZE:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('(6,089,740,000 bytes)===')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('===IGNORED: 0===');
    });

    it('should display failed deletions when present', () => {
      const stats = {
        totalDirectories: 2,
        totalFiles: 100,
        totalBytes: 1000,
        totalIgnored: 0,
        deletedDirectories: 1,
        failedDeletions: 1,
      };
      statisticsCollector.display(stats);
      expect(consoleLogSpy).toHaveBeenCalledWith('===FAILED: 1===');
    });

    it('should clear screen when isProgress is true', () => {
      const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
      const stats = {
        totalDirectories: 1,
        totalFiles: 10,
        totalBytes: 100,
        totalIgnored: 0,
        deletedDirectories: 0,
        failedDeletions: 0,
      };
      statisticsCollector.display(stats, true);
      expect(stdoutSpy).toHaveBeenCalledWith('\x1B[2J\x1B[0f');
      stdoutSpy.mockRestore();
    });
  });

  describe('displayProgress', () => {
    it('should display progress on a single line', () => {
      const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
      const scanResults: ScanResult[] = [{ path: '/p1', files: 10, bytes: 100 }];
      const deleteResults: DeleteResult[] = [{ success: true, path: '/p1' }];

      statisticsCollector.displayProgress(scanResults, deleteResults, 0, 1, 2);

      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('\rProgress: 1/2 (50%)'));
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('Deleted: 1'));
      stdoutSpy.mockRestore();
    });
  });

  describe('displayFinalProgress', () => {
    it('should display final statistics with correct headers', () => {
      const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
      const scanResults: ScanResult[] = [{ path: '/p1', files: 10, bytes: 100 }];
      const deleteResults: DeleteResult[] = [{ success: true, path: '/p1' }];

      statisticsCollector.displayFinalProgress(scanResults, deleteResults, 0);

      expect(stdoutSpy).toHaveBeenCalledWith('\n\n');
      expect(consoleLogSpy).toHaveBeenCalledWith('===DIRECTORIES: 1===');
      expect(consoleLogSpy).toHaveBeenCalledWith('===FILES: 10===');
      expect(consoleLogSpy).toHaveBeenCalledWith('===DELETED: 1===');
      stdoutSpy.mockRestore();
    });

    it('should display failed deletions in final progress', () => {
      const scanResults: ScanResult[] = [{ path: '/p1', files: 10, bytes: 100 }];
      const deleteResults: DeleteResult[] = [{ success: false, path: '/p1', error: 'err' }];

      statisticsCollector.displayFinalProgress(scanResults, deleteResults, 0);

      expect(consoleLogSpy).toHaveBeenCalledWith('===FAILED: 1===');
    });
  });
});
