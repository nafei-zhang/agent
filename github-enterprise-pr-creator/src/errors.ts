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
  SOURCE_NOT_FOUND: "Source branch does not exist.",
  TARGET_NOT_FOUND: "Target branch does not exist.",
  UNPUSHED_ABORTED: "Canceled by user: please push source branch first.",
  MERGE_CONFLICT: "Potential merge conflict detected. Resolve conflicts before creating PR."
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
