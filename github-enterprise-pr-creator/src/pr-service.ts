import { AppError } from "./errors.js";
import type { PullRequestRequest, PullRequestResponse, RuntimeConfig } from "./types.js";

export async function createPullRequest(
  config: RuntimeConfig,
  payload: PullRequestRequest
): Promise<PullRequestResponse> {
  const url = `${config.enterpriseUrl}/repos/${payload.owner}/${payload.repo}/pulls`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `token ${config.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "gepr-skill"
    },
    body: JSON.stringify({
      title: payload.title,
      head: payload.head,
      base: payload.base,
      body: payload.body
    })
  }).catch((error: unknown) => {
    throw new AppError("NETWORK_ERROR", "创建 PR 时网络异常。", error);
  });

  if (response.status === 401 || response.status === 403) {
    throw new AppError("AUTH_FAILED", "PR 创建失败：权限不足或 token 无效。");
  }
  if (response.status === 422) {
    throw new AppError("PR_VALIDATION_FAILED", "PR 创建失败：分支可能不存在、无差异或已有相同 PR。");
  }
  if (!response.ok) {
    const body = await response.text();
    throw new AppError("PR_CREATE_FAILED", `PR 创建失败，状态码 ${response.status}: ${body}`);
  }

  const result = (await response.json()) as PullRequestResponse;
  return result;
}
