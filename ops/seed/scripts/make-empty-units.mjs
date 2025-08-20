#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_DIR = path.resolve('ops/seed');
const JURISDICTION = 'CA';
const COURSE = 'DE-ONLINE';
const LANGUAGES = ['en', 'es'];
const CONTENT_TYPES = ['curriculum', 'questions'];

// Generate units 03-12 (padded with leading zeros)
const UNITS = Array.from({ length: 10 }, (_, i) => String(i + 3).padStart(2, '0'));

function log(message) {
  console.log(`[make-empty-units] ${message}`);
}

async function ensureDirectory(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    log(`Created directory: ${dirPath}`);
  }
}

async function createEmptyFile(filePath) {
  try {
    await fs.access(filePath);
    log(`Skipped (exists): ${filePath}`);
  } catch {
    await fs.writeFile(filePath, '{}\n', 'utf8');
    log(`Created: ${filePath}`);
  }
}

async function main() {
  log('Generating empty seed files for Units 03-12...');
  
  for (const unit of UNITS) {
    for (const contentType of CONTENT_TYPES) {
      for (const lang of LANGUAGES) {
        const dirPath = path.join(BASE_DIR, contentType, JURISDICTION, COURSE, 'units');
        const filePath = path.join(dirPath, `unit${unit}.${lang}.json`);
        
        await ensureDirectory(dirPath);
        await createEmptyFile(filePath);
      }
    }
  }
  
  log('✅ Empty seed files generation complete!');
  log(`Generated ${UNITS.length} units × ${CONTENT_TYPES.length} types × ${LANGUAGES.length} languages = ${UNITS.length * CONTENT_TYPES.length * LANGUAGES.length} files`);
}

main().catch(error => {
  console.error('❌ Error generating empty seed files:', error);
  process.exit(1);
});
