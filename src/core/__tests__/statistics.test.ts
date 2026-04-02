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
  });
});
