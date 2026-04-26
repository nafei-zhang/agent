import { describe, expect, it } from "vitest";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { decryptToken, encryptToken } from "../src/crypto-store.js";

describe("crypto store", () => {
  it("should encrypt and decrypt token", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "gec-skill-test-"));
    try {
      process.env.GEC_CONFIG_DIR = tmpDir;
      const token = "ghp_abcdefghijklmnopqrstuvwxyz12345";
      const payload = await encryptToken(token);
      const plain = await decryptToken(payload);
      expect(plain).toBe(token);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
      delete process.env.GEC_CONFIG_DIR;
    }
  });
});
