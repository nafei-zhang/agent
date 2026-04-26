import type { Lang } from "./i18n.js";

export class AppError extends Error {
  readonly code: string;
  readonly causeError?: unknown;

  constructor(code: string, message: string, causeError?: unknown) {
    super(message);
    this.code = code;
    this.causeError = causeError;
  }
}

const EN_ERROR_MAP: Record<string, string> = {
  NO_CHANGES: "No changed files detected.",
  INVALID_COMMIT_FORMAT: "Commit message does not follow Conventional Commits.",
  MISSING_KEYWORD: "Please provide a search keyword.",
  MISSING_HASH: "Please provide a commit hash to rollback."
};

export function toErrorMessage(error: unknown, lang: Lang = "zh"): string {
  if (error instanceof AppError) {
    if (lang === "en" && EN_ERROR_MAP[error.code]) {
      return `[${error.code}] ${EN_ERROR_MAP[error.code]}`;
    }
    return `[${error.code}] ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
