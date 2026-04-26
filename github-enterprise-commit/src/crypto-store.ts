import crypto from "node:crypto";
import fs from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { AppError } from "./errors.js";
import { getConfigDir, getKeyFilePath } from "./paths.js";

const KEY_LENGTH = 32;

async function ensureConfigDir(): Promise<void> {
  await fs.mkdir(getConfigDir(), { recursive: true });
}

async function readOrCreateKey(): Promise<Buffer> {
  const keyPath = getKeyFilePath();
  try {
    const key = await fs.readFile(keyPath);
    if (key.length !== KEY_LENGTH) {
      throw new AppError("INVALID_KEY", "发现无效密钥文件，请重新初始化配置。");
    }
    return key;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") {
      throw new AppError("KEY_READ_FAILED", "读取加密密钥失败。", err);
    }
    await ensureConfigDir();
    const key = crypto.randomBytes(KEY_LENGTH);
    await fs.writeFile(keyPath, key, { mode: 0o600 });
    await fs.chmod(keyPath, fsConstants.S_IRUSR | fsConstants.S_IWUSR);
    return key;
  }
}

export interface CipherPayload {
  cipherText: string;
  iv: string;
  tag: string;
}

export async function encryptToken(token: string): Promise<CipherPayload> {
  const key = await readOrCreateKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    cipherText: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64")
  };
}

export async function decryptToken(payload: CipherPayload): Promise<string> {
  try {
    const key = await readOrCreateKey();
    const iv = Buffer.from(payload.iv, "base64");
    const encrypted = Buffer.from(payload.cipherText, "base64");
    const tag = Buffer.from(payload.tag, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return plain.toString("utf8");
  } catch (error) {
    throw new AppError("DECRYPT_FAILED", "解密访问令牌失败，请重新执行配置初始化。", error);
  }
}
