export const CONVENTIONAL_TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "test",
  "chore",
  "perf",
  "build",
  "ci",
  "revert"
] as const;

export type ConventionalType = (typeof CONVENTIONAL_TYPES)[number];

export interface StoredConfig {
  enterpriseUrl: string;
  tokenCipherText: string;
  tokenIv: string;
  tokenTag: string;
  updatedAt: string;
}

export interface RuntimeConfig {
  enterpriseUrl: string;
  token: string;
}

export interface CommitInput {
  type: ConventionalType;
  scope?: string;
  description: string;
}

export interface CommitEntry {
  hash: string;
  author: string;
  date: string;
  subject: string;
}
