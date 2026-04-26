import { AppError } from "./errors.js";
import { requestJson } from "./http-client.js";

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface AccessTokenResponse {
  access_token?: string;
  error?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runDeviceFlow(input: {
  enterpriseOrigin: string;
  clientId: string;
  scopes: string[];
}): Promise<{ token: string; userCode: string; verificationUri: string }> {
  const deviceCode = await requestJson<DeviceCodeResponse>(`${input.enterpriseOrigin}/login/device/code`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `client_id=${encodeURIComponent(input.clientId)}&scope=${encodeURIComponent(input.scopes.join(" "))}`
  });

  const startedAt = Date.now();
  const timeoutMs = deviceCode.expires_in * 1000;
  const intervalMs = Math.max(deviceCode.interval * 1000, 2000);

  while (Date.now() - startedAt < timeoutMs) {
    await sleep(intervalMs);
    const tokenResp = await requestJson<AccessTokenResponse>(`${input.enterpriseOrigin}/login/oauth/access_token`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `client_id=${encodeURIComponent(input.clientId)}&device_code=${encodeURIComponent(
        deviceCode.device_code
      )}&grant_type=urn:ietf:params:oauth:grant-type:device_code`,
      retries: 1
    });

    if (tokenResp.access_token) {
      return {
        token: tokenResp.access_token,
        userCode: deviceCode.user_code,
        verificationUri: deviceCode.verification_uri
      };
    }
    if (tokenResp.error && tokenResp.error !== "authorization_pending") {
      throw new AppError("OAUTH_FAILED", `OAuth 设备授权失败: ${tokenResp.error}`);
    }
  }

  throw new AppError("OAUTH_TIMEOUT", "OAuth 设备授权超时，请重试。");
}
