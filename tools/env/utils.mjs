import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export function detectEOL(content) {
  const hasCRLF = /\r\n/.test(content);
  return hasCRLF ? '\r\n' : '\n';
}

export function parseEnv(content) {
  const eol = detectEOL(content);
  const lines = content.split(eol);
  const order = [];
  const map = new Map();

  for (const line of lines) {
    // Preserve comments/blank lines in order too by tagging them
    if (!line || line.startsWith('#')) {
      order.push({ type: 'comment', raw: line });
      continue;
    }
    const idx = line.indexOf('=');
    if (idx === -1) {
      order.push({ type: 'raw', raw: line });
      continue;
    }
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1);
    if (!map.has(key)) order.push({ type: 'kv', key });
    map.set(key, val);
  }

  return { eol, lines, order, map };
}

export function stringifyEnv(map, order, eol) {
  const seen = new Set();
  const out = [];

  for (const item of order) {
    if (item.type === 'kv') {
      const key = item.key;
      if (map.has(key) && !seen.has(key)) {
        out.push(`${key}=${map.get(key)}`);
        seen.add(key);
      }
    } else {
      out.push(item.raw ?? '');
    }
  }

  // Append any new keys not in order
  for (const [key, val] of map.entries()) {
    if (!seen.has(key)) out.push(`${key}=${val}`);
  }

  return out.join(eol) + eol;
}

export function readEnvFile(file) {
  if (!fs.existsSync(file)) return { eol: os.EOL, order: [], map: new Map() };
  const content = fs.readFileSync(file, 'utf8');
  return parseEnv(content);
}

export function writeEnvFile(file, map, order, eol, { backup = true } = {}) {
  if (backup && fs.existsSync(file)) {
    fs.copyFileSync(file, `${file}.bak`);
  }
  const serialized = stringifyEnv(map, order, eol);
  fs.writeFileSync(file, serialized, 'utf8');
}

export function ensureFromExample(file, exampleFile) {
  if (!fs.existsSync(file)) {
    if (exampleFile && fs.existsSync(exampleFile)) {
      fs.copyFileSync(exampleFile, file);
    } else {
      fs.writeFileSync(file, '# created by setup script\n', 'utf8');
    }
  }
}

export function mergeKey(map, key, value) {
  map.set(key, value);
}
