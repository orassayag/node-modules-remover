import { Statistics, ScanResult, DeleteResult } from '../types';
import { formatBytes, formatNumber } from '../utils/formatUtils';

export class StatisticsCollector {
  aggregate(
    scanResults: ScanResult[],
    deleteResults: DeleteResult[],
    ignoredCount: number
  ): Statistics {
    const totalDirectories = scanResults.length;
    const totalFiles = scanResults.reduce((sum, result) => sum + result.files, 0);
    const totalBytes = scanResults.reduce((sum, result) => sum + result.bytes, 0);
    const deletedDirectories = deleteResults.filter((result) => result.success).length;
    const failedDeletions = deleteResults.filter((result) => !result.success).length;
    return {
      totalDirectories,
      totalFiles,
      totalBytes,
      totalIgnored: ignoredCount,
      deletedDirectories,
      failedDeletions,
    };
  }

  display(stats: Statistics, isProgress = false): void {
    if (isProgress) {
      process.stdout.write('\x1B[2J\x1B[0f');
    }
    console.log(`===DIRECTORIES: ${formatNumber(stats.totalDirectories)}===`);
    console.log(`===FILES: ${formatNumber(stats.totalFiles)}===`);
    console.log(
      `===SIZE: ${formatBytes(stats.totalBytes)} (${formatNumber(stats.totalBytes)} bytes)===`
    );
    console.log(`===IGNORED: ${formatNumber(stats.totalIgnored)}===`);
    if (stats.deletedDirectories > 0) {
      console.log(`===DELETED: ${formatNumber(stats.deletedDirectories)}===`);
    }
    if (stats.failedDeletions > 0) {
      console.log(`===FAILED: ${formatNumber(stats.failedDeletions)}===`);
    }
  }

  displayProgress(
    scanResults: ScanResult[],
    deleteResults: DeleteResult[],
    ignoredCount: number,
    completed: number,
    total: number
  ): void {
    const stats = this.aggregate(scanResults, deleteResults, ignoredCount);
    const percentage = Math.round((completed / total) * 100);
    process.stdout.write(
      `\rProgress: ${completed}/${total} (${percentage}%) | ` +
        `Deleted: ${formatNumber(stats.deletedDirectories)} | ` +
        `Size: ${formatBytes(stats.totalBytes)} | ` +
        `Files: ${formatNumber(stats.totalFiles)}   `
    );
  }

  displayFinalProgress(
    scanResults: ScanResult[],
    deleteResults: DeleteResult[],
    ignoredCount: number
  ): void {
    const stats = this.aggregate(scanResults, deleteResults, ignoredCount);
    process.stdout.write('\n\n');
    console.log(`===DIRECTORIES: ${formatNumber(stats.totalDirectories)}===`);
    console.log(`===FILES: ${formatNumber(stats.totalFiles)}===`);
    console.log(
      `===SIZE: ${formatBytes(stats.totalBytes)} (${formatNumber(stats.totalBytes)} bytes)===`
    );
    console.log(`===IGNORED: ${formatNumber(stats.totalIgnored)}===`);
    console.log(`===DELETED: ${formatNumber(stats.deletedDirectories)}===`);
    if (stats.failedDeletions > 0) {
      console.log(`===FAILED: ${formatNumber(stats.failedDeletions)}===`);
    }
  }
}
