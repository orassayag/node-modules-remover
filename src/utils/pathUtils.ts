import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { DirectorySizeResult } from '../types';

export function shouldIgnorePath(fullPath: string, ignorePatterns: string[]): boolean {
  if (ignorePatterns.length === 0) {
    return false;
  }
  const lowerPath = fullPath.toLowerCase();
  return ignorePatterns.some((pattern) => lowerPath.includes(pattern.toLowerCase()));
}

export async function getDirectorySize(path: string): Promise<DirectorySizeResult> {
  let files = 0;
  let bytes = 0;
  try {
    const entries = await readdir(path, { withFileTypes: true });
    const promises = entries.map(async (entry) => {
      const fullPath = join(path, entry.name);
      try {
        if (entry.isDirectory()) {
          const subResult = await getDirectorySize(fullPath);
          files += subResult.files;
          bytes += subResult.bytes;
        } else if (entry.isFile()) {
          const stats = await stat(fullPath);
          files++;
          bytes += stats.size;
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error);
      }
    });
    await Promise.all(promises);
  } catch (error) {
    console.error(`Error reading directory ${path}:`, error);
  }
  return { files, bytes };
}
