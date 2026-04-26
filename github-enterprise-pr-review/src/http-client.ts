import { AppError } from "./errors.js";

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  retries?: number;
}

function parseRateLimitReset(response: Response): number | null {
  const reset = response.headers.get("x-ratelimit-reset");
  if (!reset) {
    return null;
  }
  const resetMs = Number.parseInt(reset, 10) * 1000;
  if (Number.isNaN(resetMs)) {
    return null;
  }
  return Math.max(0, resetMs - Date.now());
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const retries = options.retries ?? 3;
  let attempt = 0;
  let waitMs = 800;

  while (attempt <= retries) {
    attempt += 1;
    let response: Response;
    try {
      response = await fetch(url, {
        method: options.method ?? "GET",
        headers: options.headers,
        body: options.body
      });
    } catch (error) {
      if (attempt > retries) {
        throw new AppError("NETWORK_ERROR", "网络请求失败，超过重试次数。", error);
      }
      await sleep(waitMs);
      waitMs *= 2;
      continue;
    }

    if (response.status === 429) {
      const retryAfter = Number.parseInt(response.headers.get("retry-after") ?? "0", 10);
      const pauseMs = Math.max(waitMs, retryAfter * 1000);
      if (attempt > retries) {
        throw new AppError("RATE_LIMIT", "请求触发速率限制且重试失败。");
      }
      await sleep(pauseMs);
      waitMs *= 2;
      continue;
    }

    if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") {
      const pauseMs = parseRateLimitReset(response) ?? waitMs;
      if (attempt > retries) {
        throw new AppError("RATE_LIMIT", "GitHub API 限流重试失败。");
      }
      await sleep(pauseMs);
      waitMs *= 2;
      continue;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new AppError("HTTP_ERROR", `请求失败: ${response.status} ${body}`);
    }

    return (await response.json()) as T;
  }

  throw new AppError("UNKNOWN", "请求异常结束。");
}
