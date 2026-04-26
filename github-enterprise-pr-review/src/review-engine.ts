import type { PullRequestFile, ReviewIssue, ReviewResult } from "./types.js";

function buildSnippet(patch?: string): string | undefined {
  if (!patch) {
    return undefined;
  }
  return patch.split("\n").slice(0, 8).join("\n");
}

function detectIssues(file: PullRequestFile): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  const patch = file.patch ?? "";

  if (/eval\(|exec\(|child_process/.test(patch)) {
    issues.push({
      severity: "Critical",
      title: "潜在高危执行路径",
      file: file.filename,
      snippet: buildSnippet(patch),
      suggestion: "避免动态执行字符串，改为白名单命令或受控映射。"
    });
  }
  if (/console\.log|print\(/.test(patch) && !/test|spec/.test(file.filename)) {
    issues.push({
      severity: "Minor",
      title: "调试输出未清理",
      file: file.filename,
      snippet: buildSnippet(patch),
      suggestion: "移除调试输出或改为结构化日志并控制日志级别。"
    });
  }
  if (/TODO|FIXME/.test(patch)) {
    issues.push({
      severity: "Major",
      title: "存在未完成待办逻辑",
      file: file.filename,
      snippet: buildSnippet(patch),
      suggestion: "在 PR 合并前完成 TODO，或以 issue 跟踪并给出临时保护措施。"
    });
  }
  if (file.additions > 200 && !/test|spec/.test(file.filename)) {
    issues.push({
      severity: "Major",
      title: "单文件改动过大",
      file: file.filename,
      suggestion: "建议拆分提交或补充测试，降低评审与回归风险。"
    });
  }
  if (/catch\s*\(\w*\)\s*\{\s*\}/.test(patch)) {
    issues.push({
      severity: "Major",
      title: "异常被吞掉",
      file: file.filename,
      snippet: buildSnippet(patch),
      suggestion: "至少记录错误上下文，并返回可观测失败路径。"
    });
  }

  return issues;
}

export function generateReviewResult(input: {
  templateLanguage: string;
  files: PullRequestFile[];
}): ReviewResult {
  const issues = input.files.flatMap((file) => detectIssues(file));
  const positives: string[] = [];
  if (input.files.length > 0) {
    positives.push(`本次变更覆盖 ${input.files.length} 个文件，改动范围清晰。`);
  }
  if (issues.length === 0) {
    positives.push("未发现明显高风险问题，整体质量良好。");
  }

  const summary =
    issues.length === 0
      ? "本次 PR 总体实现清晰，建议通过并关注后续回归测试。"
      : `发现 ${issues.length} 个需关注项，建议修复 Critical/Major 问题后再合并。`;

  return {
    summary,
    positives,
    issues,
    templateLanguage: input.templateLanguage
  };
}
