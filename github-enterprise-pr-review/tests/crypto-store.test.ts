import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "../src/crypto-store.js";

describe("crypto-store", () => {
  it("should encrypt and decrypt secret", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "geprr-secret-test-"));
    try {
      process.env.GEPRR_CONFIG_DIR = tmpDir;
      const source = "s3cr3t_abc";
      const encrypted = await encryptSecret(source);
      const plain = await decryptSecret(encrypted);
      expect(plain).toBe(source);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
      delete process.env.GEPRR_CONFIG_DIR;
    }
  });
});
