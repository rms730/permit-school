#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const repoRoot = resolve(__dirname, '..', '..');

const reportPath = resolve(repoRoot, 'web', 'playwright-report', 'index.html');
if (!existsSync(reportPath)) {
  console.error(`❌ Report not found at: ${reportPath}
Run tests first, e.g.: npm run -w web test:e2e`);
  process.exit(1);
}

const fileUrl = `file://${reportPath}`;
console.log(`📄 Opening Playwright report: ${fileUrl}`);

function openCrossPlatform(url) {
  const cmd =
    process.platform === 'darwin' ? 'open' :
    process.platform === 'win32' ? 'start ""' :
    'xdg-open';
  exec(`${cmd} "${url}"`);
}

openCrossPlatform(fileUrl);
