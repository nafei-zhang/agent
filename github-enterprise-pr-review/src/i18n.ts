export type Lang = "zh" | "en";

function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

export function resolveLangArgs(argv: string[]): { lang: Lang; args: string[] } {
  let lang: Lang = "en";
  let explicitLang = false;
  const args: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--lang" && argv[i + 1]) {
      lang = argv[i + 1].toLowerCase() === "en" ? "en" : "zh";
      explicitLang = true;
      i += 1;
      continue;
    }
    if (item.startsWith("--lang=")) {
      const value = item.split("=", 2)[1];
      lang = value?.toLowerCase() === "en" ? "en" : "zh";
      explicitLang = true;
      continue;
    }
    args.push(item);
  }
  if (!explicitLang) {
    const joinedInput = args.join(" ");
    if (containsChinese(joinedInput)) {
      lang = "zh";
    } else if (process.env.SKILL_LANG?.toLowerCase().startsWith("zh")) {
      lang = "zh";
    } else if (process.env.LANG?.toLowerCase().startsWith("zh")) {
      lang = "zh";
    }
  }
  return { lang, args };
}
