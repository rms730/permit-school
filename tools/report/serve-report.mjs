#!/usr/bin/env node
import { createServer } from 'node:http';
import { statSync, createReadStream } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import getPort from 'get-port';
import open from 'open';
import kill from 'tree-kill';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(__filename, '../../');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { dir: resolve(repoRoot, 'web', 'playwright-report'), port: 9323, timeout: 15000, open: true, ci: !!process.env.CI };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dir') out.dir = resolve(args[++i]);
    if (a === '--port') out.port = parseInt(args[++i], 10);
    if (a === '--timeout') out.timeout = parseInt(args[++i], 10);
    if (a === '--no-open') out.open = false;
    if (a === '--open') out.open = true;
    if (a === '--ci') out.ci = true;
  }
  return out;
}

function contentType(p) {
  const ext = extname(p).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.map': 'application/json',
    '.webm': 'video/webm',
  })[ext] || 'application/octet-stream';
}

async function main() {
  const opts = parseArgs();
  const port = await getPort({ port: opts.port });
  const root = opts.dir;

  const server = createServer((req, res) => {
    const urlPath = (req.url || '/').split('?')[0];
    const filePath = resolve(root, urlPath === '/' ? 'index.html' : `.${urlPath}`);
    try {
      const st = statSync(filePath);
      if (st.isDirectory()) {
        res.writeHead(301, { Location: `${urlPath}/` });
        return res.end();
      }
      res.writeHead(200, { 'Content-Type': contentType(filePath) });
      createReadStream(filePath).pipe(res);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  await new Promise((resolveStart) => server.listen(port, resolveStart));
  const url = `http://localhost:${port}`;
  console.log(`📊 Serving report at ${url} (dir: ${root})`);
  console.log(`⏱️ Will auto-close in ${opts.ci ? 0 : opts.timeout} ms. Press Ctrl+C to quit earlier.`);

  if (opts.open && !opts.ci) {
    await open(url);
  }

  if (!opts.ci && opts.timeout > 0) {
    await delay(opts.timeout);
  }

  server.close(() => {
    console.log('✅ Report server closed.');
    process.exit(0);
  });

  // safety: if close hangs, hard-exit
  setTimeout(() => process.exit(0), 2000).unref();
}

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

main().catch((e) => {
  console.error('❌ Failed to serve report:', e);
  process.exit(1);
});
