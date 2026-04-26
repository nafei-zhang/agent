import { AppError } from "./errors.js";
import { CONVENTIONAL_TYPES, type CommitInput } from "./types.js";

const COMMIT_REGEX =
  /^(feat|fix|docs|style|refactor|test|chore|perf|build|ci|revert)(\([a-zA-Z0-9._-]+\))?: [^\s].{0,96}$/;

export function buildCommitMessage(input: CommitInput): string {
  if (!CONVENTIONAL_TYPES.includes(input.type)) {
    throw new AppError("INVALID_TYPE", `不支持的提交类型: ${input.type}`);
  }
  const cleanDescription = input.description.trim();
  if (!cleanDescription) {
    throw new AppError("INVALID_DESCRIPTION", "提交描述不能为空。");
  }
  if (cleanDescription.length > 97) {
    throw new AppError("DESCRIPTION_TOO_LONG", "提交描述建议不超过 97 个字符。");
  }
  const scopePart = input.scope && input.scope.trim() ? `(${input.scope.trim()})` : "";
  return `${input.type}${scopePart}: ${cleanDescription}`;
}

export function validateCommitMessage(message: string): boolean {
  return COMMIT_REGEX.test(message.trim());
}
