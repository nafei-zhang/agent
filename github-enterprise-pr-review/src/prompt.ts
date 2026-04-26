import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { AppError } from "./errors.js";
import type { Lang } from "./i18n.js";
import type { LanguageTemplate, PullRequestSummary } from "./types.js";

export function createPrompter(lang: Lang = "zh") {
  const rl = createInterface({ input, output });

  async function ask(question: string): Promise<string> {
    return (await rl.question(question)).trim();
  }

  async function confirm(question: string): Promise<boolean> {
    const answer = (await ask(`${question} [y/N]: `)).toLowerCase();
    return answer === "y" || answer === "yes";
  }

  async function choosePr(prs: PullRequestSummary[]): Promise<PullRequestSummary> {
    if (!prs.length) {
      throw new AppError("NO_OPEN_PR", lang === "en" ? "No open pull requests in this repository." : "当前仓库没有开放中的 Pull Request。");
    }
    const keyword = await ask(lang === "en" ? "Enter search keyword (title/author, optional): " : "请输入搜索关键字（标题/作者，可选）: ");
    const filtered = keyword
      ? prs.filter((pr) => {
          const k = keyword.toLowerCase();
          return pr.title.toLowerCase().includes(k) || pr.author.toLowerCase().includes(k);
        })
      : prs;
    if (!filtered.length) {
      throw new AppError("NO_MATCHED_PR", lang === "en" ? "No pull requests matched the keyword." : "没有匹配搜索条件的 PR。");
    }
    output.write(lang === "en" ? "\nAvailable PR list:\n" : "\n可选 PR 列表:\n");
    filtered.forEach((pr, idx) => {
      output.write(
        `  ${idx + 1}) #${pr.number} ${pr.title} | ${pr.author} | ${pr.createdAt} | ${pr.state} | files:${pr.changedFiles} (+${pr.additions}/-${pr.deletions})\n`
      );
    });
    const selected = await ask(lang === "en" ? "Choose PR index: " : "请选择 PR 序号: ");
    const index = Number.parseInt(selected, 10);
    if (Number.isNaN(index) || index < 1 || index > filtered.length) {
      throw new AppError("INVALID_SELECTION", lang === "en" ? "Invalid PR selection." : "PR 选择无效。");
    }
    return filtered[index - 1];
  }

  async function chooseTemplate(templates: LanguageTemplate[]): Promise<LanguageTemplate> {
    output.write(lang === "en" ? "\nLanguage templates:\n" : "\n语言模板列表:\n");
    templates.forEach((t, idx) => {
      output.write(`  ${idx + 1}) ${t.language}\n`);
    });
    const selected = await ask(lang === "en" ? "Choose template index: " : "请选择语言模板序号: ");
    const index = Number.parseInt(selected, 10);
    if (Number.isNaN(index) || index < 1 || index > templates.length) {
      throw new AppError("INVALID_TEMPLATE", lang === "en" ? "Invalid template selection." : "模板选择无效。");
    }
    return templates[index - 1];
  }

  function close(): void {
    rl.close();
  }

  return {
    ask,
    confirm,
    choosePr,
    chooseTemplate,
    close
  };
}
