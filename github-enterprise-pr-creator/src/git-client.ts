import { spawn } from "node:child_process";
import { AppError } from "./errors.js";
import type { BranchInfo } from "./types.js";

async function runGit(args: string[], cwd: string = process.cwd()): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const child = spawn("git", args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (error: Error) => {
      reject(new AppError("GIT_EXEC_ERROR", "执行 git 命令失败，请确认已安装 Git。", error));
    });
    child.on("close", (code: number | null) => {
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }
      reject(new AppError("GIT_COMMAND_FAILED", stderr.trim() || `git ${args.join(" ")} 执行失败。`));
    });
  });
}

function parseBranchLine(line: string, kind: "local" | "remote"): BranchInfo | null {
  const [name, hash, committedAt, ...subjectParts] = line.split("\t");
  if (!name || !hash || !committedAt) {
    return null;
  }
  if (kind === "remote" && (name === "origin/HEAD" || name.startsWith("origin/HEAD "))) {
    return null;
  }
  const normalizedName = kind === "remote" ? name.replace(/^origin\//, "") : name;
  return {
    name: normalizedName,
    kind,
    hash,
    committedAt,
    subject: subjectParts.join("\t")
  };
}

export function parseRemoteUrl(remoteUrl: string): { host: string; owner: string; repo: string } {
  const trimmed = remoteUrl.trim();
  const sshMatch = trimmed.match(/^git@([^:]+):([^/]+)\/(.+?)(\.git)?$/);
  if (sshMatch) {
    return {
      host: sshMatch[1],
      owner: sshMatch[2],
      repo: sshMatch[3]
    };
  }
  const httpsMatch = trimmed.match(/^https?:\/\/([^/]+)\/([^/]+)\/(.+?)(\.git)?$/);
  if (httpsMatch) {
    return {
      host: httpsMatch[1],
      owner: httpsMatch[2],
      repo: httpsMatch[3]
    };
  }
  throw new AppError("REMOTE_PARSE_FAILED", `无法解析远程仓库地址: ${remoteUrl}`);
}

export async function ensureGitRepository(): Promise<void> {
  const result = await runGit(["rev-parse", "--is-inside-work-tree"]);
  if (result !== "true") {
    throw new AppError("NOT_GIT_REPO", "当前目录不是 Git 仓库。");
  }
}

export async function fetchRemoteBranches(): Promise<void> {
  try {
    await runGit(["fetch", "--all", "--prune"]);
  } catch (error) {
    throw new AppError("FETCH_FAILED", "拉取远程分支失败，请检查网络与远程仓库权限。", error);
  }
}

export async function getCurrentBranch(): Promise<string> {
  return await runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
}

export async function listLocalBranches(): Promise<BranchInfo[]> {
  const out = await runGit([
    "for-each-ref",
    "refs/heads",
    "--format=%(refname:short)%x09%(objectname:short)%x09%(committerdate:iso8601)%x09%(subject)"
  ]);
  if (!out) {
    return [];
  }
  return out
    .split("\n")
    .map((line) => parseBranchLine(line, "local"))
    .filter((item): item is BranchInfo => Boolean(item));
}

export async function listRemoteBranches(): Promise<BranchInfo[]> {
  const out = await runGit([
    "for-each-ref",
    "refs/remotes/origin",
    "--format=%(refname:short)%x09%(objectname:short)%x09%(committerdate:iso8601)%x09%(subject)"
  ]);
  if (!out) {
    return [];
  }
  return out
    .split("\n")
    .map((line) => parseBranchLine(line, "remote"))
    .filter((item): item is BranchInfo => Boolean(item));
}

export function filterBranches(branches: BranchInfo[], keyword: string): BranchInfo[] {
  if (!keyword.trim()) {
    return branches;
  }
  const lower = keyword.toLowerCase();
  return branches.filter((branch) => {
    return (
      branch.name.toLowerCase().includes(lower) ||
      branch.subject.toLowerCase().includes(lower) ||
      branch.hash.toLowerCase().includes(lower)
    );
  });
}

export async function branchExists(branchName: string): Promise<boolean> {
  const remotes = await runGit(["branch", "-r", "--list", `origin/${branchName}`]);
  if (remotes.trim()) {
    return true;
  }
  const locals = await runGit(["branch", "--list", branchName]);
  return Boolean(locals.trim());
}

export async function getRemoteUrl(): Promise<string> {
  try {
    return await runGit(["remote", "get-url", "origin"]);
  } catch (error) {
    throw new AppError("REMOTE_URL_FAILED", "无法读取远程仓库 origin URL。", error);
  }
}

export async function getAheadCount(branchName: string): Promise<number> {
  const upstream = await runGit(["rev-parse", "--abbrev-ref", `${branchName}@{upstream}`]).catch(() => "");
  if (!upstream) {
    return 0;
  }
  const out = await runGit(["rev-list", "--count", `${upstream}..${branchName}`]);
  return Number.parseInt(out, 10) || 0;
}

export async function hasMergeConflict(source: string, target: string): Promise<boolean> {
  const base = await runGit(["merge-base", target, source]).catch((error) => {
    throw new AppError("MERGE_BASE_FAILED", "计算分支共同基线失败，无法检查冲突。", error);
  });
  const mergeTree = await runGit(["merge-tree", base, target, source]);
  return /<<<<<<<|>>>>>>>|changed in both/.test(mergeTree);
}
