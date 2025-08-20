import fs from "node:fs/promises";
import path from "path";

export async function readJson<T>(p: string): Promise<T> {
  const raw = await fs.readFile(path.resolve(p), "utf-8");
  return JSON.parse(raw) as T;
}
