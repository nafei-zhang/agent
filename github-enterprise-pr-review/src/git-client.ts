import { spawn } from "node:child_process";
import { AppError } from "./errors.js";

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

export async function getRemoteOriginUrl(): Promise<string> {
  try {
    return await runGit(["remote", "get-url", "origin"]);
  } catch (error) {
    throw new AppError("REMOTE_URL_FAILED", "无法读取 origin 远程地址。", error);
  }
}

export function parseRepoFromRemote(url: string): { owner: string; repo: string; host: string } {
  const ssh = url.match(/^git@([^:]+):([^/]+)\/(.+?)(\.git)?$/);
  if (ssh) {
    return { host: ssh[1], owner: ssh[2], repo: ssh[3] };
  }
  const https = url.match(/^https?:\/\/([^/]+)\/([^/]+)\/(.+?)(\.git)?$/);
  if (https) {
    return { host: https[1], owner: https[2], repo: https[3] };
  }
  throw new AppError("REMOTE_PARSE_FAILED", `无法解析远程地址: ${url}`);
}
