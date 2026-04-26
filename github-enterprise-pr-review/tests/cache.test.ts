import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { readCache, writeCache } from "../src/cache.js";

describe("cache", () => {
  it("should write and read cache", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "geprr-cache-test-"));
    try {
      process.env.GEPRR_CONFIG_DIR = tmpDir;
      await writeCache("a", { ok: true }, 30);
      const value = await readCache<{ ok: boolean }>("a");
      expect(value?.ok).toBe(true);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
      delete process.env.GEPRR_CONFIG_DIR;
    }
  });
});
