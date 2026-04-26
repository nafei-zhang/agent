import type { ReviewIssue, ReviewResult, Severity } from "./types.js";

const SEVERITY_ORDER: Severity[] = ["Critical", "Major", "Minor"];

function groupBySeverity(issues: ReviewIssue[]): Record<Severity, ReviewIssue[]> {
  return {
    Critical: issues.filter((i) => i.severity === "Critical"),
    Major: issues.filter((i) => i.severity === "Major"),
    Minor: issues.filter((i) => i.severity === "Minor")
  };
}

export function formatReviewMarkdown(result: ReviewResult): string {
  const grouped = groupBySeverity(result.issues);
  const lines: string[] = [];
  lines.push("# PR Review Report");
  lines.push("");
  lines.push("## 总体评估摘要");
  lines.push(`- 语言模板: ${result.templateLanguage}`);
  lines.push(`- 结论: ${result.summary}`);
  lines.push("");
  lines.push("## 问题列表（按严重级别）");
  SEVERITY_ORDER.forEach((severity) => {
    lines.push(`### ${severity}`);
    const items = grouped[severity];
    if (!items.length) {
      lines.push("- 无");
      return;
    }
    items.forEach((issue, idx) => {
      lines.push(`${idx + 1}. ${issue.title}`);
      if (issue.file) {
        lines.push(`   - 文件: \`${issue.file}\``);
      }
      lines.push(`   - 建议: ${issue.suggestion}`);
      if (issue.snippet) {
        lines.push("   - 代码片段:");
        lines.push("```diff");
        lines.push(issue.snippet);
        lines.push("```");
      }
    });
  });
  lines.push("");
  lines.push("## 正面反馈");
  result.positives.forEach((p) => lines.push(`- ${p}`));
  return lines.join("\n");
}

export function splitCommentBody(markdown: string, maxChars: number = 60000): string[] {
  if (markdown.length <= maxChars) {
    return [markdown];
  }
  const chunks: string[] = [];
  let rest = markdown;
  while (rest.length > maxChars) {
    const splitAt = rest.lastIndexOf("\n", maxChars);
    const index = splitAt > 0 ? splitAt : maxChars;
    chunks.push(rest.slice(0, index));
    rest = rest.slice(index).trimStart();
  }
  if (rest) {
    chunks.push(rest);
  }
  return chunks;
}
