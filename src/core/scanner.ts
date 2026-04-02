import { readdir } from 'fs/promises';
import { join } from 'path';
import { ScanResult } from '../types';
import { shouldIgnorePath, getDirectorySize } from '../utils/pathUtils';

export type ScanProgressCallback = (currentPath: string, foundCount: number) => void;

export class Scanner {
  private foundDirectories: ScanResult[] = [];
  private ignoredCount = 0;
  private progressCallback?: ScanProgressCallback;
  private lastProgressTime = 0;

  async scan(
    rootPath: string,
    ignorePaths: string[],
    onProgress?: ScanProgressCallback
  ): Promise<{
    directories: ScanResult[];
    ignoredCount: number;
  }> {
    this.foundDirectories = [];
    this.ignoredCount = 0;
    this.progressCallback = onProgress;
    this.lastProgressTime = Date.now();
    await this.scanDirectory(rootPath, ignorePaths);
    return {
      directories: this.foundDirectories,
      ignoredCount: this.ignoredCount,
    };
  }

  private updateProgress(currentPath: string): void {
    if (this.progressCallback) {
      const now = Date.now();
      if (now - this.lastProgressTime >= 500) {
        this.progressCallback(currentPath, this.foundDirectories.length);
        this.lastProgressTime = now;
      }
    }
  }

  private async scanDirectory(currentPath: string, ignorePaths: string[]): Promise<void> {
    if (shouldIgnorePath(currentPath, ignorePaths)) {
      this.ignoredCount++;
      return;
    }
    this.updateProgress(currentPath);
    try {
      const entries = await readdir(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = join(currentPath, entry.name);
          if (entry.name === 'node_modules') {
            if (shouldIgnorePath(fullPath, ignorePaths)) {
              this.ignoredCount++;
              continue;
            }
            const sizeResult = await getDirectorySize(fullPath);
            this.foundDirectories.push({
              path: fullPath,
              files: sizeResult.files,
              bytes: sizeResult.bytes,
            });
            this.updateProgress(currentPath);
          } else {
            await this.scanDirectory(fullPath, ignorePaths);
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('EACCES') && !errorMessage.includes('EPERM')) {
        console.error(`\nError scanning directory ${currentPath}:`, error);
      }
    }
  }
}
