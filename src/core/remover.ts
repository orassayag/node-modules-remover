import { rm } from 'fs/promises';
import { ScanResult, DeleteResult } from '../types';

export type ProgressCallback = (completed: number, total: number, results: DeleteResult[]) => void;

export class Remover {
  async delete(
    directories: ScanResult[],
    onProgress?: ProgressCallback
  ): Promise<DeleteResult[]> {
    const results: DeleteResult[] = [];
    const total = directories.length;
    for (let i = 0; i < directories.length; i++) {
      const directory = directories[i];
      try {
        await rm(directory.path, { recursive: true, force: true });
        results.push({
          success: true,
          path: directory.path,
        });
      } catch (error) {
        results.push({
          success: false,
          path: directory.path,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      if (onProgress) {
        onProgress(i + 1, total, results);
      }
    }
    return results;
  }
}
