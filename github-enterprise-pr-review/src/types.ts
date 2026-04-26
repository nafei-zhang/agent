export interface StoredConfig {
  enterpriseApiUrl: string;
  tokenCipherText?: string;
  tokenIv?: string;
  tokenTag?: string;
  oauthClientId?: string;
  oauthClientSecretCipherText?: string;
  oauthClientSecretIv?: string;
  oauthClientSecretTag?: string;
  updatedAt: string;
}

export interface RuntimeConfig {
  enterpriseApiUrl: string;
  token?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
}

export interface PullRequestSummary {
  number: number;
  title: string;
  author: string;
  createdAt: string;
  state: string;
  changedFiles: number;
  additions: number;
  deletions: number;
  url: string;
}

export interface PullRequestFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export type Severity = "Critical" | "Major" | "Minor";

export interface ReviewIssue {
  severity: Severity;
  title: string;
  file?: string;
  snippet?: string;
  suggestion: string;
}

export interface ReviewResult {
  summary: string;
  positives: string[];
  issues: ReviewIssue[];
  templateLanguage: string;
}

export interface LanguageTemplate {
  language: string;
  prompt: string;
  checklist: string[];
}

export interface CachePayload<T> {
  cachedAt: string;
  ttlSeconds: number;
  value: T;
}
