#!/usr/bin/env node
import { loadConfig, saveConfig, validateConfig } from "./config-manager.js";
import { AppError, toErrorMessage } from "./errors.js";
import { resolveLangArgs, type Lang } from "./i18n.js";
import {
  branchExists,
  ensureGitRepository,
  fetchRemoteBranches,
  filterBranches,
  getAheadCount,
  getCurrentBranch,
  getRemoteUrl,
  hasMergeConflict,
  listLocalBranches,
  listRemoteBranches,
  parseRemoteUrl
} from "./git-client.js";
import { createPrompter } from "./prompt.js";
import { createPullRequest } from "./pr-service.js";
import type { BranchInfo } from "./types.js";

function printUsage(lang: Lang): void {
  if (lang === "en") {
    console.log(`gepr - Enterprise GitHub Pull Request Creator CLI

Usage:
  gepr                         Start interactive PR creation flow
  gepr config init             Init enterprise URL and token
  gepr config validate         Validate config
  gepr config show             Show enterprise API URL
`);
    return;
  }
  console.log(`gepr - Enterprise GitHub Pull Request Skill CLI

用法:
  gepr                         进入交互式 PR 创建流程
  gepr config init             初始化企业 URL 与 token
  gepr config validate         验证配置与认证
  gepr config show             展示当前企业 API URL
`);
}

function uniqueBranches(branches: BranchInfo[]): BranchInfo[] {
  const map = new Map<string, BranchInfo>();
  branches.forEach((branch) => {
    map.set(`${branch.kind}:${branch.name}`, branch);
  });
  return Array.from(map.values());
}

async function runCreatePrFlow(lang: Lang): Promise<void> {
  const prompt = createPrompter(lang);
  try {
    await ensureGitRepository();
    const config = await loadConfig();
    await validateConfig();

    console.log(lang === "en" ? "Syncing remote branches..." : "正在同步远程分支信息...");
    await fetchRemoteBranches();

    const currentBranch = await getCurrentBranch();
    const localBranches = await listLocalBranches();
    const remoteBranches = await listRemoteBranches();

    console.log(lang === "en" ? `Current branch: ${currentBranch}` : `当前工作分支: ${currentBranch}`);
    const sourceDefault = localBranches.find((b) => b.name === currentBranch) ?? localBranches[0];
    const useCurrent = await prompt.confirm(
      lang === "en"
        ? `Use current branch ${sourceDefault.name} as source branch?`
        : `源分支默认使用当前分支 ${sourceDefault.name}，是否确认?`
    );
    const sourceBranch = useCurrent
      ? sourceDefault
      : await prompt.chooseBranch(
          filterBranches(uniqueBranches([...localBranches, ...remoteBranches]), ""),
          lang === "en" ? "Choose source branch" : "请选择源分支"
        );

    const targetCandidates = remoteBranches.filter((b) => b.name !== sourceBranch.name);
    const targetBranch = await prompt.chooseBranch(
      targetCandidates,
      lang === "en" ? "Choose target branch (remote preferred)" : "请选择目标分支（建议远程分支）"
    );

    if (!(await branchExists(sourceBranch.name))) {
      throw new AppError(
        "SOURCE_NOT_FOUND",
        lang === "en" ? `Source branch not found: ${sourceBranch.name}` : `源分支不存在: ${sourceBranch.name}`
      );
    }
    if (!(await branchExists(targetBranch.name))) {
      throw new AppError(
        "TARGET_NOT_FOUND",
        lang === "en" ? `Target branch not found: ${targetBranch.name}` : `目标分支不存在: ${targetBranch.name}`
      );
    }

    const aheadCount = await getAheadCount(sourceBranch.name);
    if (aheadCount > 0) {
      const continueWithoutPush = await prompt.confirm(
        lang === "en"
          ? `${aheadCount} unpushed commits found on source branch. Continue creating PR?`
          : `检测到源分支有 ${aheadCount} 个未推送提交，仍继续创建 PR 吗?`
      );
      if (!continueWithoutPush) {
        throw new AppError(
          "UNPUSHED_ABORTED",
          lang === "en" ? "Canceled: push source branch first." : "用户取消：请先推送源分支后再创建 PR。"
        );
      }
    }

    const conflict = await hasMergeConflict(sourceBranch.name, targetBranch.name);
    if (conflict) {
      throw new AppError(
        "MERGE_CONFLICT",
        lang === "en"
          ? "Potential conflicts detected between source and target branches."
          : "检测到源/目标分支可能存在冲突，请先解决冲突后再创建 PR。"
      );
    }

    const title = await prompt.ask(lang === "en" ? "Enter PR title: " : "请输入 PR 标题: ");
    if (!title) {
      throw new AppError("INVALID_TITLE", lang === "en" ? "PR title cannot be empty." : "PR 标题不能为空。");
    }
    const body = await prompt.ask(lang === "en" ? "Enter PR description (optional): " : "请输入 PR 描述（可选）: ");

    const remoteUrl = await getRemoteUrl();
    const repoMeta = parseRemoteUrl(remoteUrl);
    if (!config.enterpriseUrl.includes(repoMeta.host)) {
      console.log(
        lang === "en"
          ? `Hint: API host differs from origin host (${repoMeta.host}). Please verify enterprise URL.`
          : `提示: 配置 API 域名与 origin 域名不同 (${repoMeta.host})，请确认企业地址是否正确。`
      );
    }

    const result = await createPullRequest(config, {
      owner: repoMeta.owner,
      repo: repoMeta.repo,
      head: sourceBranch.name,
      base: targetBranch.name,
      title,
      body
    });

    console.log(lang === "en" ? `PR created: #${result.number}` : `PR 创建成功: #${result.number}`);
    console.log(lang === "en" ? `URL: ${result.html_url}` : `访问地址: ${result.html_url}`);
  } finally {
    prompt.close();
  }
}

async function initConfigFlow(lang: Lang): Promise<void> {
  const prompt = createPrompter(lang);
  try {
    const enterpriseUrl = await prompt.ask(
      lang === "en"
        ? "Enter enterprise GitHub URL (example: https://github.example.com): "
        : "请输入企业 GitHub URL（示例: https://github.example.com）: "
    );
    const token = await prompt.ask(lang === "en" ? "Enter personal access token (PAT): " : "请输入个人访问 token（PAT）: ");
    await saveConfig(enterpriseUrl, token);
    await validateConfig();
    console.log(lang === "en" ? "Config initialized and verified." : "配置初始化成功，认证验证通过。");
  } finally {
    prompt.close();
  }
}

async function showConfigFlow(lang: Lang): Promise<void> {
  const config = await loadConfig();
  console.log(lang === "en" ? `Enterprise API URL: ${config.enterpriseUrl}` : `企业 API URL: ${config.enterpriseUrl}`);
  console.log(lang === "en" ? "Token: encrypted and hidden" : "Token: 已加密存储（显示已隐藏）");
}

async function main(): Promise<void> {
  const parsed = resolveLangArgs(process.argv.slice(2));
  const lang = parsed.lang;
  const args = parsed.args;
  if (!args.length) {
    await runCreatePrFlow(lang);
    return;
  }

  if (args[0] === "config" && args[1] === "init") {
    await initConfigFlow(lang);
    return;
  }
  if (args[0] === "config" && args[1] === "validate") {
    await validateConfig();
    console.log(lang === "en" ? "Config validation succeeded." : "配置验证成功。");
    return;
  }
  if (args[0] === "config" && args[1] === "show") {
    await showConfigFlow(lang);
    return;
  }
  printUsage(lang);
}

main().catch((error: unknown) => {
  const { lang } = resolveLangArgs(process.argv.slice(2));
  console.error(lang === "en" ? `Error: ${toErrorMessage(error, lang)}` : `错误: ${toErrorMessage(error, lang)}`);
  if (error instanceof AppError && error.causeError) {
    console.error(lang === "en" ? "Details:" : "详细原因:", error.causeError);
  }
  process.exitCode = 1;
});
