import { readCache, writeCache } from "./cache.js";
import { AppError } from "./errors.js";
import { requestJson } from "./http-client.js";
import type { PullRequestFile, PullRequestSummary, RuntimeConfig } from "./types.js";

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "geprr-skill"
  };
}

interface GitHubPrListItem {
  number: number;
  title: string;
  state: string;
  created_at: string;
  html_url: string;
  user: { login: string };
}

interface GitHubPrDetail {
  changed_files: number;
  additions: number;
  deletions: number;
}

interface GitHubPrFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export async function listOpenPullRequests(
  config: RuntimeConfig,
  owner: string,
  repo: string
): Promise<PullRequestSummary[]> {
  if (!config.token) {
    throw new AppError("TOKEN_MISSING", "缺少访问 token，请先执行配置初始化。");
  }
  const cacheKey = `pr-list:${owner}/${repo}`;
  const cached = await readCache<PullRequestSummary[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const list = await requestJson<GitHubPrListItem[]>(
    `${config.enterpriseApiUrl}/repos/${owner}/${repo}/pulls?state=open&per_page=50`,
    { headers: authHeaders(config.token) }
  );

  const result: PullRequestSummary[] = [];
  for (const item of list) {
    const detail = await requestJson<GitHubPrDetail>(
      `${config.enterpriseApiUrl}/repos/${owner}/${repo}/pulls/${item.number}`,
      { headers: authHeaders(config.token), retries: 2 }
    );
    result.push({
      number: item.number,
      title: item.title,
      author: item.user.login,
      createdAt: item.created_at,
      state: item.state,
      changedFiles: detail.changed_files,
      additions: detail.additions,
      deletions: detail.deletions,
      url: item.html_url
    });
  }
  await writeCache(cacheKey, result, 60);
  return result;
}

export async function listPullRequestFiles(
  config: RuntimeConfig,
  owner: string,
  repo: string,
  prNumber: number
): Promise<PullRequestFile[]> {
  if (!config.token) {
    throw new AppError("TOKEN_MISSING", "缺少访问 token，请先执行配置初始化。");
  }
  const cacheKey = `pr-files:${owner}/${repo}#${prNumber}`;
  const cached = await readCache<PullRequestFile[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const files = await requestJson<GitHubPrFile[]>(
    `${config.enterpriseApiUrl}/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`,
    { headers: authHeaders(config.token) }
  );
  const mapped: PullRequestFile[] = files.map((f) => ({
    filename: f.filename,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
    changes: f.changes,
    patch: f.patch
  }));
  await writeCache(cacheKey, mapped, 60);
  return mapped;
}

export async function postIssueComment(
  config: RuntimeConfig,
  owner: string,
  repo: string,
  prNumber: number,
  body: string
): Promise<void> {
  if (!config.token) {
    throw new AppError("TOKEN_MISSING", "缺少访问 token，请先执行配置初始化。");
  }
  await requestJson(
    `${config.enterpriseApiUrl}/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    {
      method: "POST",
      headers: {
        ...authHeaders(config.token),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ body })
    }
  );
}
