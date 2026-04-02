import { settings } from './settings';
import { Scanner } from './core/scanner';
import { Remover } from './core/remover';
import { StatisticsCollector } from './core/statistics';
import { DeleteResult } from './types';

async function main() {
  console.log('\n🔍 Node Modules Remover\n');
  if (settings.dryRun) {
    console.log('[DRY RUN MODE] No files will be deleted\n');
  }
  console.log(`Scanning: ${settings.scanPath}`);
  if (settings.ignorePaths.length > 0) {
    console.log(`Ignoring paths containing:`);
    settings.ignorePaths.forEach((path) => console.log(`  - ${path}`));
  }
  console.log('\nScanning directories...\n');
  const scanner = new Scanner();
  const { directories, ignoredCount } = await scanner.scan(
    settings.scanPath,
    settings.ignorePaths,
    (currentPath: string, foundCount: number) => {
      const truncatedPath = currentPath.length > 80 ? '...' + currentPath.slice(-77) : currentPath;
      process.stdout.write(
        `\rScanning: ${foundCount} found | Current: ${truncatedPath}${' '.repeat(20)}`
      );
    }
  );
  process.stdout.write('\r' + ' '.repeat(120) + '\r');
  console.log(`Found ${directories.length} node_modules directories\n`);
  let deleteResults: DeleteResult[] = [];
  if (settings.dryRun) {
    console.log('[DRY RUN] No files were deleted\n');
    deleteResults = directories.map((dir) => ({
      success: false,
      path: dir.path,
    }));
  } else {
    console.log('🗑️  Deleting node_modules directories...\n');
    const statisticsCollector = new StatisticsCollector();
    let lastUpdateTime = Date.now();
    const remover = new Remover();
    deleteResults = await remover.delete(directories, (completed, total, results) => {
      const now = Date.now();
      if (now - lastUpdateTime >= 2000 || completed === total) {
        statisticsCollector.displayProgress(
          directories,
          results,
          ignoredCount,
          completed,
          total
        );
        lastUpdateTime = now;
      }
    });
    const successCount = deleteResults.filter((r) => r.success).length;
    console.log(`\n\n✅ Deleted ${successCount}/${directories.length} directories successfully\n`);
  }
  const statisticsCollector = new StatisticsCollector();
  const stats = statisticsCollector.aggregate(directories, deleteResults, ignoredCount);
  statisticsCollector.display(stats);
  console.log('\n✅ Done!\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
