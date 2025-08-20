import fs from "node:fs";
import path from "node:path";

export function backupFile(filePath: string, stamp: string): string {
  const rel = filePath.replace(process.cwd() + path.sep, "");
  const outDir = path.join("ops", "seed", ".backups", stamp, path.dirname(rel));
  fs.mkdirSync(outDir, { recursive: true });
  const dest = path.join(outDir, path.basename(filePath));
  fs.copyFileSync(filePath, dest);
  return dest;
}
