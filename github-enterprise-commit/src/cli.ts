#!/usr/bin/env node
import { buildCommitMessage, validateCommitMessage } from "./conventional-commits.js";
import { loadConfig, saveConfig, validateConfig } from "./config-manager.js";
import { AppError, toErrorMessage } from "./errors.js";
import { resolveLangArgs, type Lang } from "./i18n.js";
import {
  commitAll,
  ensureGitRepository,
  getChangedFiles,
  getRecentCommits,
  pushCurrentBranch,
  rollbackCommit,
  searchCommits
} from "./git-client.js";
import { createPrompter } from "./prompt.js";

function printUsage(lang: Lang): void {
  if (lang === "en") {
    console.log(`gec - Enterprise GitHub Commit Skill CLI

Usage:
  gec                         Start interactive commit flow
  gec config init             Init enterprise URL and token
  gec config validate         Validate config
  gec config show             Show enterprise API URL
  gec history [limit]         Show recent commits
  gec search <keyword>        Search commits
  gec rollback <commit-hash>  Revert a commit
`);
    return;
  }
  console.log(`gec - Enterprise GitHub Commit Skill CLI

用法:
  gec                         进入交互式提交流程
  gec config init             初始化企业 URL 与 token
  gec config validate         验证配置与认证
  gec config show             展示当前企业 API URL
  gec history [limit]         查看最近提交
  gec search <keyword>        搜索提交
  gec rollback <commit-hash>  回滚指定提交
`);
}

async function interactiveCommitFlow(lang: Lang): Promise<void> {
  const prompt = createPrompter(lang);
  try {
    await ensureGitRepository();
    const files = await getChangedFiles();
    if (!files.length) {
      throw new AppError("NO_CHANGES", lang === "en" ? "No changed files detected." : "未检测到变更文件。");
    }
    console.log(lang === "en" ? "Detected changed files:" : "检测到以下变更文件:");
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });
    const proceed = await prompt.confirm(lang === "en" ? "Continue commit flow?" : "是否继续提交流程?");
    if (!proceed) {
      console.log(lang === "en" ? "Canceled." : "已取消。");
      return;
    }

    const type = await prompt.chooseType();
    const scope = await prompt.ask(
      lang === "en" ? "Enter scope (optional, press Enter to skip): " : "请输入影响范围 scope（可选，直接回车跳过）: "
    );
    const description = await prompt.ask(lang === "en" ? "Enter commit description: " : "请输入提交描述: ");
    const message = buildCommitMessage({ type, scope, description });

    if (!validateCommitMessage(message)) {
      throw new AppError(
        "INVALID_COMMIT_FORMAT",
        lang === "en"
          ? "Commit message does not follow Conventional Commits."
          : "提交信息不符合 Conventional Commits 规范。"
      );
    }

    console.log(`\n即将提交: ${message}`);
    const confirmCommit = await prompt.confirm(
      lang === "en" ? "Run git add/commit/push now?" : "确认执行 git add/commit/push?"
    );
    if (!confirmCommit) {
      console.log(lang === "en" ? "Canceled." : "已取消。");
      return;
    }
    await commitAll(message);
    await pushCurrentBranch();
    console.log(lang === "en" ? "Commit and push succeeded." : "提交并推送成功。");
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

async function historyFlow(limitRaw: string | undefined, lang: Lang): Promise<void> {
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 10;
  const commits = await getRecentCommits(Number.isNaN(limit) ? 10 : limit);
  if (!commits.length) {
    console.log(lang === "en" ? "No commit history." : "暂无提交记录。");
    return;
  }
  commits.forEach((commit) => {
    console.log(`${commit.hash.slice(0, 8)} | ${commit.date} | ${commit.author} | ${commit.subject}`);
  });
}

async function searchFlow(keyword: string | undefined, lang: Lang): Promise<void> {
  if (!keyword) {
    throw new AppError("MISSING_KEYWORD", lang === "en" ? "Please provide a search keyword." : "请提供搜索关键字。");
  }
  const commits = await searchCommits(keyword);
  if (!commits.length) {
    console.log(lang === "en" ? "No matching commits found." : "未找到匹配提交。");
    return;
  }
  commits.forEach((commit) => {
    console.log(`${commit.hash.slice(0, 8)} | ${commit.date} | ${commit.author} | ${commit.subject}`);
  });
}

async function rollbackFlow(hash: string | undefined, lang: Lang): Promise<void> {
  if (!hash) {
    throw new AppError(
      "MISSING_HASH",
      lang === "en" ? "Please provide a commit hash to rollback." : "请提供需要回滚的 commit hash。"
    );
  }
  await rollbackCommit(hash);
  console.log(lang === "en" ? "Rollback commit created. Please review and push." : "回滚提交已生成，请检查后推送。");
}

async function main(): Promise<void> {
  const parsed = resolveLangArgs(process.argv.slice(2));
  const lang = parsed.lang;
  const args = parsed.args;
  if (!args.length) {
    await interactiveCommitFlow(lang);
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
  if (args[0] === "history") {
    await historyFlow(args[1], lang);
    return;
  }
  if (args[0] === "search") {
    await searchFlow(args[1], lang);
    return;
  }
  if (args[0] === "rollback") {
    await rollbackFlow(args[1], lang);
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
