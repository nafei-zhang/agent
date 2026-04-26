import fs from "node:fs/promises";
import { AppError } from "./errors.js";
import { decryptToken, encryptToken } from "./crypto-store.js";
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

async function ensureConfigDir(): Promise<void> {
  await fs.mkdir(getConfigDir(), { recursive: true });
}

export async function saveConfig(enterpriseUrl: string, token: string): Promise<void> {
  const normalizedUrl = normalizeEnterpriseApiUrl(enterpriseUrl);
  if (!token || token.trim().length < 10) {
    throw new AppError("TOKEN_INVALID", "Token 长度过短或为空，请提供有效的个人访问令牌。");
  }
  const encrypted = await encryptToken(token.trim());
  const payload: StoredConfig = {
    enterpriseUrl: normalizedUrl,
    tokenCipherText: encrypted.cipherText,
    tokenIv: encrypted.iv,
    tokenTag: encrypted.tag,
    updatedAt: new Date().toISOString()
  };
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
      throw new AppError("CONFIG_NOT_FOUND", "未找到配置，请先执行 `gepr config init`。");
    }
    throw new AppError("CONFIG_READ_FAILED", "读取配置文件失败。", error);
  }
  let parsed: StoredConfig;
  try {
    parsed = JSON.parse(raw) as StoredConfig;
  } catch (error) {
    throw new AppError("CONFIG_PARSE_FAILED", "配置文件格式错误，请重新初始化。", error);
  }
  const token = await decryptToken({
    cipherText: parsed.tokenCipherText,
    iv: parsed.tokenIv,
    tag: parsed.tokenTag
  });
  return {
    enterpriseUrl: parsed.enterpriseUrl,
    token
  };
}

export async function validateConfig(): Promise<void> {
  const config = await loadConfig();
  const response = await fetch(`${config.enterpriseUrl}/user`, {
    method: "GET",
    headers: {
      Authorization: `token ${config.token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "gepr-skill"
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
