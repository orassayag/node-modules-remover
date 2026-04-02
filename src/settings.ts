import { Settings } from './types';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

export const settings: Settings = {
  scanPath: '/Users/orassayag/Repos',
  ignorePaths: [projectRoot],
  dryRun: false,
};
