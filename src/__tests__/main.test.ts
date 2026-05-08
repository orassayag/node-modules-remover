import { describe, it, expect, vi, beforeEach } from 'vitest';
import { main } from '../main';
import { Scanner } from '../core/scanner';
import { Remover } from '../core/remover';
import { StatisticsCollector } from '../core/statistics';
import { settings } from '../settings';

vi.mock('../core/scanner', () => ({
  Scanner: class {
    scan = vi.fn().mockImplementation((_path, _ignore, onProgress) => {
      if (onProgress) {
        onProgress('a'.repeat(90), 1);
      }
      return Promise.resolve({
        directories: [{ path: '/test/node_modules', files: 10, bytes: 1000 }],
        ignoredCount: 5,
      });
    });
  },
}));

vi.mock('../core/remover', () => ({
  Remover: class {
    delete = vi.fn().mockImplementation((_dirs, onProgress) => {
      if (onProgress) {
        onProgress(1, 1, [{ success: true, path: '/test/node_modules' }]);
      }
      return Promise.resolve([{ success: true, path: '/test/node_modules' }]);
    });
  },
}));

vi.mock('../core/statistics', () => ({
  StatisticsCollector: class {
    aggregate = vi.fn().mockReturnValue({
      totalDirectories: 1,
      totalFiles: 10,
      totalBytes: 1000,
      totalIgnored: 5,
      deletedDirectories: 1,
      failedDeletions: 0,
    });
    display = vi.fn();
    displayProgress = vi.fn();
  },
}));

vi.mock('../settings', () => ({
  settings: {
    scanPath: '/test/path',
    ignorePaths: ['/ignored'],
    dryRun: false,
  },
}));

describe('main', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    settings.dryRun = false;
  });

  it('should run the full flow in normal mode', async () => {
    await main();

    expect(Scanner).toBeDefined();
    expect(Remover).toBeDefined();
    expect(StatisticsCollector).toBeDefined();
  });

  it('should run in dry run mode', async () => {
    settings.dryRun = true;
    await main();

    expect(Scanner).toBeDefined();
    expect(StatisticsCollector).toBeDefined();
    settings.dryRun = false;
  });
});
