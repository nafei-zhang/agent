import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { AppError } from "./errors.js";
import type { BranchInfo } from "./types.js";
import type { Lang } from "./i18n.js";

function renderBranchLine(branch: BranchInfo, index: number): string {
  const tag = branch.kind === "local" ? "L" : "R";
  return `  ${index + 1}) [${tag}] ${branch.name} | ${branch.hash} | ${branch.committedAt} | ${branch.subject}`;
}

export function createPrompter(lang: Lang = "zh") {
  const rl = createInterface({ input, output });

  async function ask(question: string): Promise<string> {
    return (await rl.question(question)).trim();
  }

  async function confirm(question: string): Promise<boolean> {
    const answer = (await ask(`${question} [y/N]: `)).toLowerCase();
    return answer === "y" || answer === "yes";
  }

  async function chooseBranch(branches: BranchInfo[], title: string): Promise<BranchInfo> {
    if (!branches.length) {
      throw new AppError("NO_BRANCHES", lang === "en" ? `No branches for ${title}.` : `${title}可选分支为空。`);
    }
    const keyword = await ask(
      lang === "en" ? `${title} search keyword (optional): ` : `${title}搜索关键字（可选，回车显示全部）: `
    );
    const filtered = keyword
      ? branches.filter((b) => {
          const k = keyword.toLowerCase();
          return (
            b.name.toLowerCase().includes(k) ||
            b.subject.toLowerCase().includes(k) ||
            b.hash.toLowerCase().includes(k)
          );
        })
      : branches;
    if (!filtered.length) {
      throw new AppError("NO_FILTERED_BRANCHES", lang === "en" ? "No branches matched the keyword." : "没有匹配搜索条件的分支。");
    }

    output.write(`\n${title}${lang === "en" ? " (L=local, R=remote)" : "（L=本地, R=远程）"}:\n`);
    filtered.forEach((branch, index) => {
      output.write(`${renderBranchLine(branch, index)}\n`);
    });
    const selected = await ask(lang === "en" ? "Enter branch index: " : "请输入分支序号: ");
    const idx = Number.parseInt(selected, 10);
    if (Number.isNaN(idx) || idx < 1 || idx > filtered.length) {
      throw new AppError("INVALID_SELECTION", lang === "en" ? "Invalid branch selection." : "分支选择无效。");
    }
    return filtered[idx - 1];
  }

  function close(): void {
    rl.close();
  }

  return {
    ask,
    confirm,
    chooseBranch,
    close
  };
}
