import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { CONVENTIONAL_TYPES, type ConventionalType } from "./types.js";
import { AppError } from "./errors.js";
import type { Lang } from "./i18n.js";
import { ynHint } from "./i18n.js";

export function createPrompter(lang: Lang = "zh") {
  const rl = createInterface({ input, output });

  async function ask(question: string): Promise<string> {
    return (await rl.question(question)).trim();
  }

  async function confirm(question: string): Promise<boolean> {
    const answer = (await ask(`${question} ${ynHint(lang)}: `)).toLowerCase();
    return answer === "y" || answer === "yes";
  }

  async function chooseType(): Promise<ConventionalType> {
    output.write(lang === "en" ? "Choose commit type:\n" : "请选择提交类型:\n");
    CONVENTIONAL_TYPES.forEach((type, index) => {
      output.write(`  ${index + 1}) ${type}\n`);
    });
    const selected = await ask(lang === "en" ? "Enter number: " : "请输入序号: ");
    const idx = Number.parseInt(selected, 10);
    if (Number.isNaN(idx) || idx < 1 || idx > CONVENTIONAL_TYPES.length) {
      throw new AppError("INVALID_SELECTION", lang === "en" ? "Invalid commit type selection." : "提交类型选择无效。");
    }
    return CONVENTIONAL_TYPES[idx - 1];
  }

  function close(): void {
    rl.close();
  }

  return {
    ask,
    confirm,
    chooseType,
    close
  };
}
