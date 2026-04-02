export interface ScanResult {
  path: string;
  files: number;
  bytes: number;
}

export interface DeleteResult {
  success: boolean;
  path: string;
  error?: string;
}

export interface Statistics {
  totalDirectories: number;
  totalFiles: number;
  totalBytes: number;
  totalIgnored: number;
  deletedDirectories: number;
  failedDeletions: number;
}

export interface Settings {
  scanPath: string;
  ignorePaths: string[];
  dryRun: boolean;
}

export interface DirectorySizeResult {
  files: number;
  bytes: number;
}
