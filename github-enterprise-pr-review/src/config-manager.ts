import fs from "node:fs/promises";
import { decryptSecret, encryptSecret } from "./crypto-store.js";
import { AppError } from "./errors.js";
import { getConfigDir, getConfigFilePath } from "./paths.js";
import type { RuntimeConfig, StoredConfig } from "./types.js";

function trimTrailingSlash(input: string): string {
  return input.replace(/\/+$/, "");
}

export function normalizeEnterpriseApiUrl(input: string): string {
  const cleaned = trimTrailingSlash(input.trim());
  const url = new URL(cleaned);
  if (url.pathname === "" || url.pathname === "/") {
    url.pathname = "/api/v3";
  }
  return trimTrailingSlash(url.toString());
}

export function getEnterpriseWebOrigin(apiUrl: string): string {
  const parsed = new URL(apiUrl);
  parsed.pathname = "/";
  return trimTrailingSlash(parsed.toString());
}

async function ensureConfigDir(): Promise<void> {
  await fs.mkdir(getConfigDir(), { recursive: true });
}

export async function saveConfig(input: {
  enterpriseApiUrl: string;
  token?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
}): Promise<void> {
  const payload: StoredConfig = {
    enterpriseApiUrl: normalizeEnterpriseApiUrl(input.enterpriseApiUrl),
    updatedAt: new Date().toISOString()
  };
  if (input.token?.trim()) {
    const encryptedToken = await encryptSecret(input.token.trim());
    payload.tokenCipherText = encryptedToken.cipherText;
    payload.tokenIv = encryptedToken.iv;
    payload.tokenTag = encryptedToken.tag;
  }
  if (input.oauthClientId?.trim()) {
    payload.oauthClientId = input.oauthClientId.trim();
  }
  if (input.oauthClientSecret?.trim()) {
    const encryptedSecret = await encryptSecret(input.oauthClientSecret.trim());
    payload.oauthClientSecretCipherText = encryptedSecret.cipherText;
    payload.oauthClientSecretIv = encryptedSecret.iv;
    payload.oauthClientSecretTag = encryptedSecret.tag;
  }
  await ensureConfigDir();
  await fs.writeFile(getConfigFilePath(), JSON.stringify(payload, null, 2), "utf8");
}

export async function loadConfig(): Promise<RuntimeConfig> {
  let raw: string;
  try {
    raw = await fs.readFile(getConfigFilePath(), "utf8");
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      throw new AppError("CONFIG_NOT_FOUND", "未找到配置，请先执行 `geprr config init`。");
    }
    throw new AppError("CONFIG_READ_FAILED", "读取配置文件失败。", error);
  }
  const parsed = JSON.parse(raw) as StoredConfig;
  const runtime: RuntimeConfig = { enterpriseApiUrl: parsed.enterpriseApiUrl };
  if (parsed.tokenCipherText && parsed.tokenIv && parsed.tokenTag) {
    runtime.token = await decryptSecret({
      cipherText: parsed.tokenCipherText,
      iv: parsed.tokenIv,
      tag: parsed.tokenTag
    });
  }
  if (parsed.oauthClientId) {
    runtime.oauthClientId = parsed.oauthClientId;
  }
  if (parsed.oauthClientSecretCipherText && parsed.oauthClientSecretIv && parsed.oauthClientSecretTag) {
    runtime.oauthClientSecret = await decryptSecret({
      cipherText: parsed.oauthClientSecretCipherText,
      iv: parsed.oauthClientSecretIv,
      tag: parsed.oauthClientSecretTag
    });
  }
  return runtime;
}

export async function validateToken(config: RuntimeConfig): Promise<void> {
  if (!config.token) {
    throw new AppError("TOKEN_MISSING", "当前未配置 token，请先执行 OAuth 或手动配置 token。");
  }
  const response = await fetch(`${config.enterpriseApiUrl}/user`, {
    method: "GET",
    headers: {
      Authorization: `token ${config.token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "geprr-skill"
    }
  }).catch((error: unknown) => {
    throw new AppError("NETWORK_ERROR", "无法连接企业 GitHub API，请检查网络和 URL。", error);
  });
  if (response.status === 401 || response.status === 403) {
    throw new AppError("AUTH_FAILED", "认证失败，请检查 token 权限和有效期。");
  }
  if (!response.ok) {
    throw new AppError("API_ERROR", `GitHub API 返回异常状态码: ${response.status}`);
  }
}
