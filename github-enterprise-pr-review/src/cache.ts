import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { getCacheDir } from "./paths.js";
import type { CachePayload } from "./types.js";

function buildKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

function getCacheFile(rawKey: string): string {
  return path.join(getCacheDir(), `${buildKey(rawKey)}.json`);
}

export async function readCache<T>(rawKey: string): Promise<T | null> {
  const filePath = getCacheFile(rawKey);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const payload = JSON.parse(raw) as CachePayload<T>;
    const ageMs = Date.now() - new Date(payload.cachedAt).getTime();
    if (ageMs > payload.ttlSeconds * 1000) {
      return null;
    }
    return payload.value;
  } catch {
    return null;
  }
}

export async function writeCache<T>(rawKey: string, value: T, ttlSeconds: number): Promise<void> {
  await fs.mkdir(getCacheDir(), { recursive: true });
  const filePath = getCacheFile(rawKey);
  const payload: CachePayload<T> = {
    cachedAt: new Date().toISOString(),
    ttlSeconds,
    value
  };
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}
