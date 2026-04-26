#!/usr/bin/env node
import { getEnterpriseWebOrigin, loadConfig, saveConfig, validateToken } from "./config-manager.js";
import { AppError, toErrorMessage } from "./errors.js";
import { formatReviewMarkdown, splitCommentBody } from "./formatter.js";
import { ensureGitRepository, getRemoteOriginUrl, parseRepoFromRemote } from "./git-client.js";
import { listOpenPullRequests, listPullRequestFiles, postIssueComment } from "./github-api.js";
import { info, warn } from "./logger.js";
import { runDeviceFlow } from "./oauth.js";
import { createPrompter } from "./prompt.js";
import { generateReviewResult } from "./review-engine.js";
import { getLanguageTemplates } from "./templates.js";
import { resolveLangArgs, type Lang } from "./i18n.js";

function printUsage(lang: Lang): void {
  if (lang === "en") {
    console.log(`geprr - Enterprise GitHub PR Review Skill CLI

Usage:
  geprr                         Start interactive PR review flow
  geprr config init             Init enterprise URL and auth
  geprr config validate         Validate auth
`);
    return;
  }
  console.log(`geprr - Enterprise GitHub PR Review Skill CLI

用法:
  geprr                         进入交互式 PR Review 流程
  geprr config init             初始化企业地址与认证方式
  geprr config validate         验证认证
`);
}

async function configInitFlow(lang: Lang): Promise<void> {
  const prompt = createPrompter(lang);
  try {
    const enterpriseUrl = await prompt.ask(
      lang === "en"
        ? "Enter enterprise GitHub URL (example: https://github.example.com): "
        : "请输入企业 GitHub URL（示例: https://github.example.com）: "
    );
    const mode = await prompt.ask(lang === "en" ? "Auth mode (1=token, 2=OAuth device flow): " : "认证方式（1=token, 2=OAuth 设备流）: ");
    if (mode === "2") {
      const clientId = await prompt.ask(lang === "en" ? "Enter OAuth Client ID: " : "请输入 OAuth Client ID: ");
      await saveConfig({
        enterpriseApiUrl: enterpriseUrl,
        oauthClientId: clientId
      });
      const config = await loadConfig();
      const result = await runDeviceFlow({
        enterpriseOrigin: getEnterpriseWebOrigin(config.enterpriseApiUrl),
        clientId,
        scopes: ["repo", "read:org"]
      });
      info(
        lang === "en"
          ? `Open ${result.verificationUri} and enter code: ${result.userCode}`
          : `请访问 ${result.verificationUri} 并输入验证码: ${result.userCode}`
      );
      await saveConfig({
        enterpriseApiUrl: config.enterpriseApiUrl,
        oauthClientId: clientId,
        token: result.token
      });
      info(lang === "en" ? "OAuth token acquired and saved." : "OAuth token 获取并保存成功。");
      return;
    }

    const token = await prompt.ask(lang === "en" ? "Enter personal access token (PAT): " : "请输入个人访问 token（PAT）: ");
    await saveConfig({ enterpriseApiUrl: enterpriseUrl, token });
    info(lang === "en" ? "Configuration saved." : "配置保存成功。");
  } finally {
    prompt.close();
  }
}

async function runReviewFlow(lang: Lang): Promise<void> {
  const prompt = createPrompter(lang);
  try {
    const config = await loadConfig();
    await validateToken(config);
    await ensureGitRepository();

    const remote = await getRemoteOriginUrl();
    const repoMeta = parseRepoFromRemote(remote);
    info(lang === "en" ? `Repository: ${repoMeta.owner}/${repoMeta.repo}` : `目标仓库: ${repoMeta.owner}/${repoMeta.repo}`);

    const prs = await listOpenPullRequests(config, repoMeta.owner, repoMeta.repo);
    const selectedPr = await prompt.choosePr(prs);

    const templates = getLanguageTemplates(lang);
    const chosenTemplate = await prompt.chooseTemplate(templates);

    const files = await listPullRequestFiles(config, repoMeta.owner, repoMeta.repo, selectedPr.number);
    const review = generateReviewResult({
      templateLanguage: chosenTemplate.language,
      files
    });
    const markdown = formatReviewMarkdown(review);

    info(lang === "en" ? "Review report preview:" : "Review 报告预览：");
    console.log("\n" + markdown + "\n");
    const confirm = await prompt.confirm(lang === "en" ? "Publish comments to this PR?" : "确认发布评论到该 PR?");
    if (!confirm) {
      warn(lang === "en" ? "Publishing canceled." : "已取消发布。");
      return;
    }

    const parts = splitCommentBody(markdown, 60000);
    for (let i = 0; i < parts.length; i += 1) {
      const header = parts.length > 1 ? `Part ${i + 1}/${parts.length}\n\n` : "";
      await postIssueComment(config, repoMeta.owner, repoMeta.repo, selectedPr.number, `${header}${parts[i]}`);
    }
    info(lang === "en" ? `Comments published in ${parts.length} part(s).` : `评论发布完成，共 ${parts.length} 段。`);
  } finally {
    prompt.close();
  }
}

async function main(): Promise<void> {
  const parsed = resolveLangArgs(process.argv.slice(2));
  const lang = parsed.lang;
  const args = parsed.args;
  if (!args.length) {
    await runReviewFlow(lang);
    return;
  }
  if (args[0] === "config" && args[1] === "init") {
    await configInitFlow(lang);
    return;
  }
  if (args[0] === "config" && args[1] === "validate") {
    const config = await loadConfig();
    await validateToken(config);
    info(lang === "en" ? "Config validation succeeded." : "配置验证成功。");
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
