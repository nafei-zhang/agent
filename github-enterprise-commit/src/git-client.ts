import { spawn } from "node:child_process";
import { AppError } from "./errors.js";
import type { CommitEntry } from "./types.js";

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

export async function ensureGitRepository(): Promise<void> {
  const result = await runGit(["rev-parse", "--is-inside-work-tree"]);
  if (result !== "true") {
    throw new AppError("NOT_GIT_REPO", "当前目录不是 Git 仓库。");
  }
}

export async function getChangedFiles(): Promise<string[]> {
  const output = await runGit(["status", "--porcelain"]);
  if (!output) {
    return [];
  }
  return output
    .split("\n")
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
}

export async function commitAll(message: string): Promise<void> {
  await runGit(["add", "-A"]);
  try {
    await runGit(["commit", "-m", message]);
  } catch (error) {
    if (error instanceof AppError && /nothing to commit/i.test(error.message)) {
      throw new AppError("NO_CHANGES", "没有可提交的变更。");
    }
    throw error;
  }
}

export async function pushCurrentBranch(): Promise<void> {
  try {
    await runGit(["push"]);
  } catch (error) {
    throw new AppError("PUSH_FAILED", "推送失败，可能存在冲突或权限问题。", error);
  }
}

export async function getRecentCommits(limit: number = 10): Promise<CommitEntry[]> {
  const output = await runGit([
    "log",
    `--max-count=${Math.max(1, limit)}`,
    "--pretty=format:%H%x09%an%x09%ad%x09%s",
    "--date=iso"
  ]);
  if (!output) {
    return [];
  }
  return output.split("\n").map((line) => {
    const [hash, author, date, ...subjectParts] = line.split("\t");
    return {
      hash,
      author,
      date,
      subject: subjectParts.join("\t")
    };
  });
}

export async function searchCommits(keyword: string, limit: number = 20): Promise<CommitEntry[]> {
  if (!keyword.trim()) {
    throw new AppError("INVALID_KEYWORD", "搜索关键字不能为空。");
  }
  const output = await runGit([
    "log",
    `--max-count=${Math.max(1, limit)}`,
    "--pretty=format:%H%x09%an%x09%ad%x09%s",
    "--date=iso",
    "--grep",
    keyword
  ]);
  if (!output) {
    return [];
  }
  return output.split("\n").map((line) => {
    const [hash, author, date, ...subjectParts] = line.split("\t");
    return {
      hash,
      author,
      date,
      subject: subjectParts.join("\t")
    };
  });
}

export async function rollbackCommit(hash: string): Promise<void> {
  if (!hash.trim()) {
    throw new AppError("INVALID_HASH", "回滚提交 hash 不能为空。");
  }
  try {
    await runGit(["revert", "--no-edit", hash.trim()]);
  } catch (error) {
    throw new AppError("REVERT_FAILED", "回滚失败，可能存在冲突，请手动处理。", error);
  }
}
